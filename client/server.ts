import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })

import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { Server as SocketIOServer } from 'socket.io'
import { getToken } from 'next-auth/jwt'
import { initMediasoupWorkers } from './lib/mediasoup/worker.js'
import { registerSocketHandlers } from './lib/socket/handlers.js'
import { connectDB } from './lib/db/connect.js'

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(async () => {
  try {
    const appOrigin = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const allowedOrigins = new Set(
      [
        appOrigin,
        process.env.NEXT_PUBLIC_SOCKET_URL,
        'http://localhost:3000',
        'http://127.0.0.1:3000',
      ].filter(Boolean)
    )

    // 1. Connect to MongoDB
    await connectDB()
    console.log('✅ MongoDB connected')

    // 2. Initialize mediasoup workers
    await initMediasoupWorkers()
    console.log('✅ Mediasoup workers initialized')

    // 3. Create HTTP server
    const httpServer = createServer((req, res) => {
      const parsedUrl = parse(req.url!, true)
      handle(req, res, parsedUrl)
    })

    // 4. Attach Socket.IO
    const io = new SocketIOServer(httpServer, {
      cors: {
        origin: (origin, callback) => {
          if (!origin || allowedOrigins.has(origin)) {
            return callback(null, true)
          }
          return callback(new Error(`Socket CORS blocked for origin: ${origin}`))
        },
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    })

    io.use(async (socket, nextAuth) => {
      try {
        const cookieHeader = socket.handshake.headers.cookie || ''
        const reqLike = {
          headers: {
            cookie: cookieHeader,
          },
        } as Parameters<typeof getToken>[0]['req']

        const token = await getToken({
          req: reqLike,
          secret: process.env.NEXTAUTH_SECRET,
        })

        // Fallback across cookie names used by NextAuth in dev/prod/proxy setups.
        const tokenWithDefaultCookie =
          token ||
          (await getToken({
            req: reqLike,
            secret: process.env.NEXTAUTH_SECRET,
            cookieName: 'next-auth.session-token',
          })) ||
          (await getToken({
            req: reqLike,
            secret: process.env.NEXTAUTH_SECRET,
            cookieName: '__Secure-next-auth.session-token',
          })) ||
          (await getToken({
            req: reqLike,
            secret: process.env.NEXTAUTH_SECRET,
            cookieName: 'authjs.session-token',
          })) ||
          (await getToken({
            req: reqLike,
            secret: process.env.NEXTAUTH_SECRET,
            cookieName: '__Secure-authjs.session-token',
          }))

        if (tokenWithDefaultCookie && tokenWithDefaultCookie.sub) {
          socket.data.user = {
            email: tokenWithDefaultCookie.email || tokenWithDefaultCookie.sub,
            name: tokenWithDefaultCookie.name || 'User',
            image: (tokenWithDefaultCookie.picture as string | undefined) || '',
          }
          return nextAuth()
        }

        // Fallback: verify the same cookie via NextAuth session endpoint.
        if (cookieHeader) {
          const sessionResponse = await fetch(`${appOrigin}/api/auth/session`, {
            headers: { cookie: cookieHeader },
          })

          if (sessionResponse.ok) {
            const session = (await sessionResponse.json()) as {
              user?: { name?: string | null; email?: string | null; image?: string | null }
            }

            if (session.user?.email || session.user?.name) {
              socket.data.user = {
                email: session.user?.email || 'unknown-user',
                name: session.user?.name || 'User',
                image: session.user?.image || '',
              }
              return nextAuth()
            }
          }
        }

        return nextAuth(new Error('Unauthorized socket connection'))
      } catch (err) {
        return nextAuth(err as Error)
      }
    })

    // 5. Register all socket event handlers
    registerSocketHandlers(io)
    console.log('✅ Socket.IO handlers registered')

    const PORT = parseInt(process.env.PORT || '3000', 10)
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error('❌ Server startup failed:', err)
    process.exit(1)
  }
})