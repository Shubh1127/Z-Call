/**
 * Shared Socket.IO event types for both client and server.
 * Import these wherever you use socket events to get full type safety.
 */

// ─── Payloads emitted by CLIENT → SERVER ──────────────────────────────────────

export interface JoinRoomPayload {
  roomId: string
  peerId: string
  name: string
}

export interface CreateTransportPayload {
  roomId: string
  peerId: string
  direction: 'send' | 'recv'
}

export interface ConnectTransportPayload {
  roomId: string
  peerId: string
  direction: 'send' | 'recv'
  dtlsParameters: object
}

export interface ProducePayload {
  roomId: string
  peerId: string
  kind: 'audio' | 'video'
  rtpParameters: object
  source: 'camera' | 'microphone' | 'screen'
}

export interface ConsumePayload {
  roomId: string
  peerId: string
  producerId: string
  rtpCapabilities: object
}

export interface ResumeConsumerPayload {
  roomId: string
  peerId: string
  consumerId: string
}

export interface CloseProducerPayload {
  roomId: string
  peerId: string
  producerId: string
}

export interface LeaveRoomPayload {
  roomId: string
  peerId: string
}

export interface ChatMessagePayload {
  roomId: string
  peerId: string
  sender: string
  content: string
}

// ─── Payloads emitted by SERVER → CLIENT ──────────────────────────────────────

export interface PeerJoinedEvent {
  peerId: string
  name: string
}

export interface PeerLeftEvent {
  peerId: string
}

export interface NewProducerEvent {
  producerId: string
  peerId: string
  name: string
  kind: 'audio' | 'video'
  source: 'camera' | 'microphone' | 'screen'
}

export interface ProducerClosedEvent {
  producerId: string
  peerId: string
}

export interface ConsumerClosedEvent {
  consumerId: string
}

export interface IncomingChatMessage {
  peerId: string
  sender: string
  content: string
  timestamp: string
}

export interface MeetingEndedEvent {
  roomId: string
  hostPeerId: string
}

// ─── Callback response shapes ─────────────────────────────────────────────────

export interface JoinRoomResponse {
  rtpCapabilities?: object
  existingPeers?: { peerId: string; name: string }[]
  chatHistory?: IncomingChatMessage[]
  error?: string
}

export interface CreateTransportResponse {
  transportParams?: {
    id: string
    iceParameters: object
    iceCandidates: object[]
    dtlsParameters: object
    sctpParameters?: object
  }
  error?: string
}

export interface ProduceResponse {
  producerId?: string
  error?: string
}

export interface ConsumeResponse {
  consumerId?: string
  producerId?: string
  kind?: 'audio' | 'video'
  rtpParameters?: object
  error?: string
}

export interface GetProducersResponse {
  producers: {
    producerId: string
    peerId: string
    kind: 'audio' | 'video'
    source: string
  }[]
}