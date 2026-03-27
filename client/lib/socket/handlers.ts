import { Server, Socket } from 'socket.io'
import { connectDB } from '../db/connect'
import { Room } from '../models/Room'
import { Peer } from '../models/Peer'
import { Message } from '../models/Message'
import { getOrCreateRouter, closeRouter } from '../mediasoup/router'
import { createWebRtcTransport, transportParams } from '../mediasoup/transport'
import {
  addPeer,
  getPeer,
  removePeer,
  getPeerBySocket,
  getProducersForRoom,
  getOrCreateRoom,
} from '../mediasoup/roomState'

// ─── Helper ───────────────────────────────────────────────────────────────────

function ack(callback: Function, data: object) {
  if (typeof callback === 'function') callback(data)
}

// ─── Main handler registration ────────────────────────────────────────────────

export function registerSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`)

    // ── 1. JOIN ROOM ────────────────────────────────────────────────────────
    /**
     * Client emits: { roomId, peerId, name }
     * Server responds with: { rtpCapabilities, existingPeers, chatHistory }
     */
    socket.on(
      'join-room',
      async (
        { roomId, peerId, name }: { roomId: string; peerId: string; name: string },
        callback: Function
      ) => {
        try {
          await connectDB()

          // Ensure room exists in DB
          const room = await Room.findOne({ roomId })
          if (!room) return ack(callback, { error: 'Room not found' })

          // Upsert peer in DB
          await Peer.findOneAndUpdate(
            { roomId, peerId },
            { name, socketId: socket.id, joinedAt: new Date() },
            { upsert: true, new: true }
          )

          // Add to in-memory state
          addPeer(roomId, peerId, name, socket.id)
          socket.join(roomId)

          // Get mediasoup router RTP capabilities for this room
          const router = await getOrCreateRouter(roomId)

          // Gather existing peers (everyone else in the room)
          const roomState = getOrCreateRoom(roomId)
          const existingPeers = [...roomState.peers.entries()]
            .filter(([id]) => id !== peerId)
            .map(([id, p]) => ({ peerId: id, name: p.name }))

          // Fetch last 50 chat messages for this room
          const chatHistory = await Message.find({ roomId })
            .sort({ timestamp: -1 })
            .limit(50)
            .lean()
            .then((msgs) => msgs.reverse())

          // Notify others that a new peer joined
          socket.to(roomId).emit('peer-joined', { peerId, name })

          console.log(`👤 ${name} (${peerId}) joined room ${roomId}`)

          ack(callback, {
            rtpCapabilities: router.rtpCapabilities,
            existingPeers,
            chatHistory,
          })
        } catch (err) {
          console.error('join-room error:', err)
          ack(callback, { error: 'Failed to join room' })
        }
      }
    )

    // ── 2. GET RTP CAPABILITIES ─────────────────────────────────────────────
    socket.on('get-rtp-capabilities', async ({ roomId }: { roomId: string }, callback: Function) => {
      try {
        const router = await getOrCreateRouter(roomId)
        ack(callback, { rtpCapabilities: router.rtpCapabilities })
      } catch (err) {
        ack(callback, { error: 'Failed to get RTP capabilities' })
      }
    })

    // ── 3. CREATE TRANSPORT ─────────────────────────────────────────────────
    /**
     * direction: 'send' | 'recv'
     * Creates a WebRTC transport on the server side.
     */
    socket.on(
      'create-transport',
      async (
        { roomId, peerId, direction }: { roomId: string; peerId: string; direction: 'send' | 'recv' },
        callback: Function
      ) => {
        try {
          const router = await getOrCreateRouter(roomId)
          const transport = await createWebRtcTransport(router)
          const peer = getPeer(roomId, peerId)

          if (!peer) return ack(callback, { error: 'Peer not found in room' })

          if (direction === 'send') {
            peer.sendTransport = transport
          } else {
            peer.recvTransport = transport
          }

          ack(callback, { transportParams: transportParams(transport) })
        } catch (err) {
          console.error('create-transport error:', err)
          ack(callback, { error: 'Failed to create transport' })
        }
      }
    )

    // ── 4. CONNECT TRANSPORT ────────────────────────────────────────────────
    /**
     * Called by client once the local side is ready to connect.
     */
    socket.on(
      'connect-transport',
      async (
        {
          roomId,
          peerId,
          direction,
          dtlsParameters,
        }: {
          roomId: string
          peerId: string
          direction: 'send' | 'recv'
          dtlsParameters: any
        },
        callback: Function
      ) => {
        try {
          const peer = getPeer(roomId, peerId)
          if (!peer) return ack(callback, { error: 'Peer not found' })

          const transport = direction === 'send' ? peer.sendTransport : peer.recvTransport
          if (!transport) return ack(callback, { error: `No ${direction} transport found` })

          await transport.connect({ dtlsParameters })
          ack(callback, { connected: true })
        } catch (err) {
          console.error('connect-transport error:', err)
          ack(callback, { error: 'Failed to connect transport' })
        }
      }
    )

    // ── 5. PRODUCE ──────────────────────────────────────────────────────────
    /**
     * Client sends media (camera video, microphone audio, or screen share).
     * source: 'camera' | 'microphone' | 'screen'
     */
    socket.on(
      'produce',
      async (
        {
          roomId,
          peerId,
          kind,
          rtpParameters,
          source,
        }: {
          roomId: string
          peerId: string
          kind: 'audio' | 'video'
          rtpParameters: any
          source: 'camera' | 'microphone' | 'screen'
        },
        callback: Function
      ) => {
        try {
          const peer = getPeer(roomId, peerId)
          if (!peer || !peer.sendTransport) {
            return ack(callback, { error: 'Send transport not found' })
          }

          const producer = await peer.sendTransport.produce({
            kind,
            rtpParameters,
            appData: { peerId, source },
          })

          peer.producers.set(producer.id, producer)

          producer.on('transportclose', () => {
            producer.close()
            peer.producers.delete(producer.id)
          })

          // Notify all other peers in the room about this new producer
          socket.to(roomId).emit('new-producer', {
            producerId: producer.id,
            peerId,
            name: peer.name,
            kind,
            source,
          })

          console.log(`📡 Producer created [${source}/${kind}] for ${peerId} in ${roomId}`)
          ack(callback, { producerId: producer.id })
        } catch (err) {
          console.error('produce error:', err)
          ack(callback, { error: 'Failed to produce' })
        }
      }
    )

    // ── 6. CONSUME ──────────────────────────────────────────────────────────
    /**
     * Client requests to consume a specific producer from another peer.
     */
    socket.on(
      'consume',
      async (
        {
          roomId,
          peerId,
          producerId,
          rtpCapabilities,
        }: {
          roomId: string
          peerId: string
          producerId: string
          rtpCapabilities: any
        },
        callback: Function
      ) => {
        try {
          const router = await getOrCreateRouter(roomId)
          const peer = getPeer(roomId, peerId)

          if (!peer || !peer.recvTransport) {
            return ack(callback, { error: 'Recv transport not found' })
          }

          if (!router.canConsume({ producerId, rtpCapabilities })) {
            return ack(callback, { error: 'Cannot consume this producer' })
          }

          const consumer = await peer.recvTransport.consume({
            producerId,
            rtpCapabilities,
            paused: true, // start paused, client will resume
          })

          peer.consumers.set(consumer.id, consumer)

          consumer.on('transportclose', () => consumer.close())
          consumer.on('producerclose', () => {
            consumer.close()
            peer.consumers.delete(consumer.id)
            socket.emit('consumer-closed', { consumerId: consumer.id })
          })

          ack(callback, {
            consumerId:    consumer.id,
            producerId,
            kind:          consumer.kind,
            rtpParameters: consumer.rtpParameters,
          })
        } catch (err) {
          console.error('consume error:', err)
          ack(callback, { error: 'Failed to consume' })
        }
      }
    )

    // ── 7. RESUME CONSUMER ──────────────────────────────────────────────────
    socket.on(
      'resume-consumer',
      async (
        { roomId, peerId, consumerId }: { roomId: string; peerId: string; consumerId: string },
        callback: Function
      ) => {
        try {
          const peer = getPeer(roomId, peerId)
          const consumer = peer?.consumers.get(consumerId)
          if (!consumer) return ack(callback, { error: 'Consumer not found' })
          await consumer.resume()
          ack(callback, { resumed: true })
        } catch (err) {
          ack(callback, { error: 'Failed to resume consumer' })
        }
      }
    )

    // ── 8. GET EXISTING PRODUCERS ───────────────────────────────────────────
    /**
     * When a peer joins late, it needs to know about all existing producers.
     */
    socket.on(
      'get-producers',
      ({ roomId, peerId }: { roomId: string; peerId: string }, callback: Function) => {
        const producers = getProducersForRoom(roomId, peerId).map((p) => ({
          producerId: p.producerId,
          peerId:     p.peerId,
          kind:       p.kind,
          source:     p.source,
        }))
        ack(callback, { producers })
      }
    )

    // ── 9. CLOSE PRODUCER (mute / stop screen share) ────────────────────────
    socket.on(
      'close-producer',
      (
        { roomId, peerId, producerId }: { roomId: string; peerId: string; producerId: string }
      ) => {
        const peer = getPeer(roomId, peerId)
        const producer = peer?.producers.get(producerId)
        if (producer) {
          producer.close()
          peer!.producers.delete(producerId)
          // Notify others so they can remove the video tile
          socket.to(roomId).emit('producer-closed', { producerId, peerId })
        }
      }
    )

    // ── 10. CHAT MESSAGE ────────────────────────────────────────────────────
    socket.on(
      'chat-message',
      async ({
        roomId,
        peerId,
        sender,
        content,
      }: {
        roomId: string
        peerId: string
        sender: string
        content: string
      }) => {
        try {
          await connectDB()
          const timestamp = new Date()

          // Persist to MongoDB
          await Message.create({ roomId, peerId, sender, content, timestamp })

          // Broadcast to everyone in the room (including sender)
          io.to(roomId).emit('chat-message', {
            peerId,
            sender,
            content,
            timestamp: timestamp.toISOString(),
          })
        } catch (err) {
          console.error('chat-message error:', err)
        }
      }
    )

    // ── 11. DISCONNECT ──────────────────────────────────────────────────────
    socket.on('disconnect', async () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`)

      const found = getPeerBySocket(socket.id)
      if (!found) return

      const { roomId, peerId } = found

      try {
        await connectDB()
        await Peer.deleteOne({ roomId, peerId })
      } catch (err) {
        console.error('DB cleanup error:', err)
      }

      removePeer(roomId, peerId)

      // Notify remaining peers
      socket.to(roomId).emit('peer-left', { peerId })

      // If room is now empty, mark inactive in DB
      const roomState = getOrCreateRoom(roomId)
      if (roomState.peers.size === 0) {
        try {
          await connectDB()
          await Room.findOneAndUpdate({ roomId }, { isActive: false })
          closeRouter(roomId)
        } catch (err) {
          console.error('Room cleanup error:', err)
        }
      }

      console.log(`👤 Peer ${peerId} left room ${roomId}`)
    })
  })
}