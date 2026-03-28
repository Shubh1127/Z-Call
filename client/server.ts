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
        origin: process.env.NEXT_PUBLIC_APP_URL || '*',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    })

    io.use(async (socket, nextAuth) => {
      try {
        const reqLike = {
          headers: {
            cookie: socket.handshake.headers.cookie || '',
          },
        } as Parameters<typeof getToken>[0]['req']

        const token = await getToken({
          req: reqLike,
          secret: process.env.NEXTAUTH_SECRET,
        })

        if (!token?.email) {
          return nextAuth(new Error('Unauthorized socket connection'))
        }

        socket.data.user = {
          email: token.email,
          name: token.name || 'User',
        }
        return nextAuth()
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