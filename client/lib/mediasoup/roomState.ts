import * as mediasoup from 'mediasoup'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProducerInfo {
  producerId: string
  peerId: string
  kind: mediasoup.types.MediaKind
  /** 'camera' | 'screen' | 'microphone' */
  source: string
  producer: mediasoup.types.Producer
}

export interface PeerState {
  peerId: string
  name: string
  image?: string
  socketId: string
  /** send transport */
  sendTransport?: mediasoup.types.WebRtcTransport
  /** recv transport */
  recvTransport?: mediasoup.types.WebRtcTransport
  producers: Map<string, mediasoup.types.Producer>
  consumers: Map<string, mediasoup.types.Consumer>
}

export interface RoomState {
  roomId: string
  hostPeerId?: string
  peers: Map<string, PeerState>
}

// ─── In-memory store ──────────────────────────────────────────────────────────

const rooms = new Map<string, RoomState>()

// ─── Room helpers ─────────────────────────────────────────────────────────────

export function getOrCreateRoom(roomId: string): RoomState {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, { roomId, peers: new Map(), hostPeerId: undefined })
  }
  return rooms.get(roomId)!
}

export function getRoom(roomId: string): RoomState | undefined {
  return rooms.get(roomId)
}

export function removeRoom(roomId: string): void {
  rooms.delete(roomId)
}

// ─── Peer helpers ─────────────────────────────────────────────────────────────

export function addPeer(
  roomId: string,
  peerId: string,
  name: string,
  image: string | undefined,
  socketId: string
): PeerState {
  const room = getOrCreateRoom(roomId)
  if (!room.hostPeerId) {
    room.hostPeerId = peerId
  }
  const peer: PeerState = {
    peerId,
    name,
    image,
    socketId,
    producers: new Map(),
    consumers: new Map(),
  }
  room.peers.set(peerId, peer)
  return peer
}

export function getPeer(roomId: string, peerId: string): PeerState | undefined {
  return rooms.get(roomId)?.peers.get(peerId)
}

export function removePeer(roomId: string, peerId: string): void {
  const room = rooms.get(roomId)
  if (!room) return

  const peer = room.peers.get(peerId)
  if (peer) {
    // Close all transports (this also closes producers/consumers)
    peer.sendTransport?.close()
    peer.recvTransport?.close()
    room.peers.delete(peerId)
  }

  // If room is empty, clean it up
  if (room.peers.size === 0) {
    removeRoom(roomId)
  }
}

/** Returns all producers in a room EXCEPT those belonging to `excludePeerId` */
export function getProducersForRoom(
  roomId: string,
  excludePeerId: string
): ProducerInfo[] {
  const room = rooms.get(roomId)
  if (!room) return []

  const result: ProducerInfo[] = []
  for (const [peerId, peer] of room.peers) {
    if (peerId === excludePeerId) continue
    for (const [producerId, producer] of peer.producers) {
      result.push({
        producerId,
        peerId,
        kind: producer.kind,
        source: (producer.appData?.source as string) || 'camera',
        producer,
      })
    }
  }
  return result
}

/** Find which peer owns a given socketId */
export function getPeerBySocket(
  socketId: string
): { roomId: string; peerId: string } | null {
  for (const [roomId, room] of rooms) {
    for (const [peerId, peer] of room.peers) {
      if (peer.socketId === socketId) return { roomId, peerId }
    }
  }
  return null
}