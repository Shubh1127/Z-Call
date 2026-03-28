'use client'

import { useRef, useCallback } from 'react'
import { Device } from 'mediasoup-client'
import type {
  CreateTransportResponse,
  ProduceResponse,
  ConsumeResponse,
  JoinRoomResponse,
  GetProducersResponse,
  LeaveRoomPayload,
  NewProducerEvent,
  ProducerClosedEvent,
  ConsumerClosedEvent,
  PeerJoinedEvent,
  PeerLeftEvent,
} from '../socket/types'
import { useSocket } from './useSocket'
import { useCallStore } from './store/useCallStore'

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useMediasoup() {
  const { emitWithAck, emit, on } = useSocket()

  // mediasoup-client refs (not React state — no re-render needed)
  const deviceRef       = useRef<Device | null>(null)
  const sendTransport   = useRef<any>(null)
  const recvTransport   = useRef<any>(null)
  const producers       = useRef<Map<string, any>>(new Map())
  const consumers       = useRef<Map<string, any>>(new Map())

  // Zustand store actions
  const {
    roomId, peerId, myName,
    setJoining, setJoinError,
    setLocalStream, setLocalScreenStream,
    setCameraProducerId, setMicProducerId, setScreenProducerId,
    setMicOn, setCameraOn, setScreenSharing,
    addPeer, removePeer,
    addRemoteStream, removeRemoteStream,
    setMessages,
    reset,
  } = useCallStore()

  // ── Internal: create a WebRTC transport (send or recv) ─────────────────────
  const createTransport = useCallback(
    async (direction: 'send' | 'recv'): Promise<any> => {
      const res = await emitWithAck<CreateTransportResponse>('create-transport', {
        roomId, peerId, direction,
      })
      if (res.error || !res.transportParams) throw new Error(res.error || 'No transport params')

      const device = deviceRef.current!
      const transport =
        direction === 'send'
          ? device.createSendTransport(res.transportParams as any)
          : device.createRecvTransport(res.transportParams as any)

      // DTLS connect — fires once when the first produce/consume is called
      transport.on('connect', async ({ dtlsParameters }, callback, errback) => {
        try {
          await emitWithAck('connect-transport', { roomId, peerId, direction, dtlsParameters })
          callback()
        } catch (err: any) {
          errback(err)
        }
      })

      // Only for send transport
      if (direction === 'send') {
        transport.on('produce', async ({ kind, rtpParameters, appData }, callback, errback) => {
          try {
            const res2 = await emitWithAck<ProduceResponse>('produce', {
              roomId, peerId, kind, rtpParameters,
              source: (appData?.source as string) || 'camera',
            })
            if (res2.error || !res2.producerId) throw new Error(res2.error)
            callback({ id: res2.producerId })
          } catch (err: any) {
            errback(err)
          }
        })
      }

      return transport
    },
    [roomId, peerId, emitWithAck]
  )

  // ── Internal: consume a single remote producer ──────────────────────────────
  const consumeProducer = useCallback(
    async (
      producerId: string,
      remotePeerId: string,
      kind: 'audio' | 'video',
      source: string
    ) => {
      const device = deviceRef.current
      if (!device || !recvTransport.current) return

      const res = await emitWithAck<ConsumeResponse>('consume', {
        roomId, peerId,
        producerId,
        rtpCapabilities: device.rtpCapabilities,
      })

      if (res.error || !res.consumerId) {
        console.warn('consume failed:', res.error)
        return
      }

      const consumer = await recvTransport.current.consume({
        id:            res.consumerId,
        producerId:    res.producerId!,
        kind:          res.kind! as 'audio' | 'video',
        rtpParameters: res.rtpParameters as any,
      })

      consumers.current.set(consumer.id, consumer)

      // Wrap track in a MediaStream and push to store
      const stream = new MediaStream([consumer.track])
      addRemoteStream(remotePeerId, producerId, stream, kind, source)

      // Resume — mediasoup starts consumers paused by default
      await emitWithAck<{ resumed: boolean }>('resume-consumer', {
        roomId, peerId, consumerId: consumer.id,
      })

      consumer.on('transportclose', () => {
        consumer.close()
        consumers.current.delete(consumer.id)
        removeRemoteStream(remotePeerId, producerId)
      })

      consumer.on('trackended', () => {
        removeRemoteStream(remotePeerId, producerId)
      })
    },
    [roomId, peerId, emitWithAck, addRemoteStream, removeRemoteStream]
  )

  // ── JOIN ROOM ───────────────────────────────────────────────────────────────
  const joinRoom = useCallback(async () => {
    setJoining(true)
    setJoinError(null)

    try {
      // 1. Emit join-room — get RTP capabilities + existing peers + chat history
      const joinRes = await emitWithAck<JoinRoomResponse>('join-room', {
        roomId, peerId, name: myName,
      })
      if (joinRes.error) throw new Error(joinRes.error)

      // 2. Restore chat history into store
      if (joinRes.chatHistory?.length) {
        setMessages(joinRes.chatHistory as any)
      }

      // 3. Add existing peers to store
      joinRes.existingPeers?.forEach((p) => addPeer(p.peerId, p.name))

      // 4. Load mediasoup Device
      const device = new Device()
      await device.load({ routerRtpCapabilities: joinRes.rtpCapabilities as any })
      deviceRef.current = device

      // 5. Create send + recv transports in parallel
      const [st, rt] = await Promise.all([
        createTransport('send'),
        createTransport('recv'),
      ])
      sendTransport.current = st
      recvTransport.current = rt

      // 6. Get local camera + mic
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, frameRate: 30 },
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      })
      setLocalStream(localStream)

      // 7. Produce video (camera)
      const videoTrack = localStream.getVideoTracks()[0]
      const videoProducer = await sendTransport.current.produce({
        track: videoTrack,
        encodings: [
          { maxBitrate: 100_000, scaleResolutionDownBy: 4 },
          { maxBitrate: 300_000, scaleResolutionDownBy: 2 },
          { maxBitrate: 900_000 },
        ],
        codecOptions: { videoGoogleStartBitrate: 1000 },
        appData: { source: 'camera' },
      })
      producers.current.set(videoProducer.id, videoProducer)
      setCameraProducerId(videoProducer.id)

      // 8. Produce audio (mic)
      const audioTrack = localStream.getAudioTracks()[0]
      const audioProducer = await sendTransport.current.produce({
        track: audioTrack,
        appData: { source: 'microphone' },
      })
      producers.current.set(audioProducer.id, audioProducer)
      setMicProducerId(audioProducer.id)

      // 9. Consume all existing producers in the room
      const prodRes = await emitWithAck<GetProducersResponse>('get-producers', { roomId, peerId })
      await Promise.all(
        prodRes.producers.map((p) =>
          consumeProducer(p.producerId, p.peerId, p.kind, p.source)
        )
      )

      // 10. Listen for new producers joining after us
      on('new-producer', async (event: NewProducerEvent) => {
        addPeer(event.peerId, event.name)
        await consumeProducer(event.producerId, event.peerId, event.kind, event.source)
      })

      // 11. Listen for producers being closed
      on('producer-closed', ({ producerId, peerId: remotePeerId }: ProducerClosedEvent) => {
        removeRemoteStream(remotePeerId, producerId)
      })

      // 12. Listen for consumers being closed server-side
      on('consumer-closed', ({ consumerId }: ConsumerClosedEvent) => {
        const consumer = consumers.current.get(consumerId)
        consumer?.close()
        consumers.current.delete(consumerId)
      })

      // 13. Peer joined / left events
      on('peer-joined', ({ peerId: id, name }: PeerJoinedEvent) => addPeer(id, name))
      on('peer-left',   ({ peerId: id }: PeerLeftEvent) => removePeer(id))

      setJoining(false)
      console.log('✅ Joined room:', roomId)
    } catch (err: any) {
      console.error('joinRoom error:', err)
      setJoinError(err.message || 'Failed to join room')
      setJoining(false)
    }
  }, [
    roomId, peerId, myName,
    emitWithAck, on,
    createTransport, consumeProducer,
    setJoining, setJoinError,
    setLocalStream, setCameraProducerId, setMicProducerId,
    setMessages, addPeer, removePeer, removeRemoteStream,
  ])

  // ── TOGGLE MIC ──────────────────────────────────────────────────────────────
  const toggleMic = useCallback(() => {
    const { isMicOn, micProducerId, localStream } = useCallStore.getState()
    const producer = micProducerId ? producers.current.get(micProducerId) : null

    if (producer) {
      if (isMicOn) {
        producer.pause()
        localStream?.getAudioTracks().forEach((t) => (t.enabled = false))
      } else {
        producer.resume()
        localStream?.getAudioTracks().forEach((t) => (t.enabled = true))
      }
    }
    setMicOn(!isMicOn)
  }, [setMicOn])

  // ── TOGGLE CAMERA ───────────────────────────────────────────────────────────
  const toggleCamera = useCallback(async () => {
    const { isCameraOn, cameraProducerId, localStream } = useCallStore.getState()
    const producer = cameraProducerId ? producers.current.get(cameraProducerId) : null

    if (!producer || !localStream) {
      return
    }

    if (isCameraOn) {
      // Stop the camera track so laptop camera hardware (LED) turns off.
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = false
        track.stop()
        localStream.removeTrack(track)
      })
      producer.pause()
      setCameraOn(false)
      return
    }

    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, frameRate: 30 },
      })
      const newVideoTrack = cameraStream.getVideoTracks()[0]
      if (!newVideoTrack) {
        throw new Error('No camera track available')
      }

      await producer.replaceTrack({ track: newVideoTrack })
      producer.resume()

      const refreshedLocalStream = new MediaStream([
        ...localStream.getAudioTracks(),
        newVideoTrack,
      ])
      setLocalStream(refreshedLocalStream)
      setCameraOn(true)
    } catch (err) {
      console.error('Failed to re-enable camera:', err)
    }
  }, [setCameraOn, setLocalStream])

  // ── START SCREEN SHARE ──────────────────────────────────────────────────────
  const startScreenShare = useCallback(async () => {
    if (!sendTransport.current) return

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 15 },
        audio: true,
      })

      setLocalScreenStream(screenStream)

      const screenTrack = screenStream.getVideoTracks()[0]
      const screenProducer = await sendTransport.current.produce({
        track: screenTrack,
        encodings: [{ maxBitrate: 1_500_000 }],
        appData: { source: 'screen' },
      })

      producers.current.set(screenProducer.id, screenProducer)
      setScreenProducerId(screenProducer.id)
      setScreenSharing(true)

      // Auto-stop when user clicks browser's "Stop sharing" button
      screenTrack.onended = () => {
        const { screenProducerId, localScreenStream } = useCallStore.getState()

        if (screenProducerId) {
          const producer = producers.current.get(screenProducerId)
          if (producer) {
            producer.close()
            producers.current.delete(screenProducerId)
            emit('close-producer', { roomId, peerId, producerId: screenProducerId })
          }
          setScreenProducerId(null)
        }

        localScreenStream?.getTracks().forEach((t) => t.stop())
        setLocalScreenStream(null)
        setScreenSharing(false)
      }
    } catch (err: any) {
      if (err.name !== 'NotAllowedError') {
        console.error('Screen share error:', err)
      }
    }
  }, [roomId, peerId, emit, setLocalScreenStream, setScreenProducerId, setScreenSharing])

  // ── STOP SCREEN SHARE ───────────────────────────────────────────────────────
  const stopScreenShare = useCallback(() => {
    const { screenProducerId, localScreenStream } = useCallStore.getState()

    if (screenProducerId) {
      const producer = producers.current.get(screenProducerId)
      if (producer) {
        producer.close()
        producers.current.delete(screenProducerId)
        emit('close-producer', { roomId, peerId, producerId: screenProducerId })
      }
      setScreenProducerId(null)
    }

    localScreenStream?.getTracks().forEach((t) => t.stop())
    setLocalScreenStream(null)
    setScreenSharing(false)
  }, [roomId, peerId, emit, setScreenProducerId, setLocalScreenStream, setScreenSharing])

  // ── LEAVE ROOM ──────────────────────────────────────────────────────────────
  const leaveRoom = useCallback(async () => {
    try {
      const payload: LeaveRoomPayload = { roomId, peerId }
      await emitWithAck<{ left?: boolean }>('leave-room', payload)
    } catch {
      // Ignore acknowledgement errors on leave and continue local cleanup.
    }

    // Close all producers
    producers.current.forEach((p) => p.close())
    producers.current.clear()

    // Close all consumers
    consumers.current.forEach((c) => c.close())
    consumers.current.clear()

    // Close transports
    sendTransport.current?.close()
    recvTransport.current?.close()
    sendTransport.current = null
    recvTransport.current = null
    deviceRef.current = null

    // Reset Zustand store (also stops local tracks)
    reset()
  }, [roomId, peerId, emitWithAck, reset])

  return {
    joinRoom,
    leaveRoom,
    toggleMic,
    toggleCamera,
    startScreenShare,
    stopScreenShare,
  }
}