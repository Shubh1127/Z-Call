import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  peerId: string
  sender: string
  content: string
  timestamp: string
}

export interface RemotePeer {
  peerId: string
  name: string
  image?: string
  /** keyed by producerId */
  streams: Map<string, { stream: MediaStream; kind: 'audio' | 'video'; source: string }>
  isSpeaking: boolean
}

export interface CallState {
  // ── Identity ───────────────────────────────────────────────────────────────
  roomId: string
  peerId: string
  myName: string
  myImage: string

  // ── Connection ─────────────────────────────────────────────────────────────
  isConnected: boolean
  isJoining: boolean
  joinError: string | null

  // ── Local media ────────────────────────────────────────────────────────────
  localStream: MediaStream | null
  localScreenStream: MediaStream | null

  // ── Producer IDs (needed to close / toggle) ────────────────────────────────
  cameraProducerId: string | null
  micProducerId: string | null
  screenProducerId: string | null

  // ── Media toggles ──────────────────────────────────────────────────────────
  isMicOn: boolean
  isCameraOn: boolean
  isScreenSharing: boolean

  // ── Remote peers ───────────────────────────────────────────────────────────
  peers: Map<string, RemotePeer>

  // ── Chat ───────────────────────────────────────────────────────────────────
  messages: ChatMessage[]
  unreadCount: number
  isChatOpen: boolean
}

export interface CallActions {
  // ── Identity ───────────────────────────────────────────────────────────────
  setIdentity: (roomId: string, peerId: string, name: string, image?: string) => void

  // ── Connection ─────────────────────────────────────────────────────────────
  setConnected: (val: boolean) => void
  setJoining: (val: boolean) => void
  setJoinError: (err: string | null) => void

  // ── Local media ────────────────────────────────────────────────────────────
  setLocalStream: (stream: MediaStream | null) => void
  setLocalScreenStream: (stream: MediaStream | null) => void

  // ── Producers ──────────────────────────────────────────────────────────────
  setCameraProducerId: (id: string | null) => void
  setMicProducerId: (id: string | null) => void
  setScreenProducerId: (id: string | null) => void

  // ── Toggles ────────────────────────────────────────────────────────────────
  setMicOn: (val: boolean) => void
  setCameraOn: (val: boolean) => void
  setScreenSharing: (val: boolean) => void

  // ── Peers ──────────────────────────────────────────────────────────────────
  addPeer: (peerId: string, name: string, image?: string) => void
  removePeer: (peerId: string) => void
  addRemoteStream: (
    peerId: string,
    producerId: string,
    stream: MediaStream,
    kind: 'audio' | 'video',
    source: string
  ) => void
  removeRemoteStream: (peerId: string, producerId: string) => void
  setPeerSpeaking: (peerId: string, isSpeaking: boolean) => void

  // ── Chat ───────────────────────────────────────────────────────────────────
  addMessage: (msg: ChatMessage) => void
  setMessages: (msgs: ChatMessage[]) => void
  setChatOpen: (val: boolean) => void
  clearUnread: () => void

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  reset: () => void
}

// ─── Initial state ────────────────────────────────────────────────────────────

const initialState: CallState = {
  roomId: '',
  peerId: '',
  myName: '',
  myImage: '',

  isConnected: false,
  isJoining: false,
  joinError: null,

  localStream: null,
  localScreenStream: null,

  cameraProducerId: null,
  micProducerId: null,
  screenProducerId: null,

  isMicOn: true,
  isCameraOn: true,
  isScreenSharing: false,

  peers: new Map(),

  messages: [],
  unreadCount: 0,
  isChatOpen: false,
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCallStore = create<CallState & CallActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // ── Identity ─────────────────────────────────────────────────────────
      setIdentity: (roomId, peerId, myName, myImage = '') =>
        set({ roomId, peerId, myName, myImage }),

      // ── Connection ────────────────────────────────────────────────────────
      setConnected: (isConnected) => set({ isConnected }),
      setJoining: (isJoining) => set({ isJoining }),
      setJoinError: (joinError) => set({ joinError }),

      // ── Local media ───────────────────────────────────────────────────────
      setLocalStream: (localStream) => set({ localStream }),
      setLocalScreenStream: (localScreenStream) => set({ localScreenStream }),

      // ── Producers ─────────────────────────────────────────────────────────
      setCameraProducerId: (cameraProducerId) => set({ cameraProducerId }),
      setMicProducerId: (micProducerId) => set({ micProducerId }),
      setScreenProducerId: (screenProducerId) => set({ screenProducerId }),

      // ── Toggles ───────────────────────────────────────────────────────────
      setMicOn: (isMicOn) => set({ isMicOn }),
      setCameraOn: (isCameraOn) => set({ isCameraOn }),
      setScreenSharing: (isScreenSharing) => set({ isScreenSharing }),

      // ── Peers ─────────────────────────────────────────────────────────────
      addPeer: (peerId, name, image) => {
        set((state) => {
          const peers = new Map(state.peers)
          if (!peers.has(peerId)) {
            peers.set(peerId, {
              peerId,
              name,
              image,
              streams: new Map(),
              isSpeaking: false,
            })
          }
          return { peers }
        })
      },

      removePeer: (peerId) => {
        set((state) => {
          const peers = new Map(state.peers)
          peers.delete(peerId)
          return { peers }
        })
      },

      addRemoteStream: (peerId, producerId, stream, kind, source) => {
        set((state) => {
          const peers = new Map(state.peers)
          const peer = peers.get(peerId)
          if (!peer) return {}
          const streams = new Map(peer.streams)
          streams.set(producerId, { stream, kind, source })
          peers.set(peerId, { ...peer, streams })
          return { peers }
        })
      },

      removeRemoteStream: (peerId, producerId) => {
        set((state) => {
          const peers = new Map(state.peers)
          const peer = peers.get(peerId)
          if (!peer) return {}
          const streams = new Map(peer.streams)
          streams.delete(producerId)
          peers.set(peerId, { ...peer, streams })
          return { peers }
        })
      },

      setPeerSpeaking: (peerId, isSpeaking) => {
        set((state) => {
          const peers = new Map(state.peers)
          const peer = peers.get(peerId)
          if (!peer) return {}
          peers.set(peerId, { ...peer, isSpeaking })
          return { peers }
        })
      },

      // ── Chat ──────────────────────────────────────────────────────────────
      addMessage: (msg) => {
        set((state) => ({
          messages: [...state.messages, msg],
          unreadCount: state.isChatOpen ? 0 : state.unreadCount + 1,
        }))
      },

      setMessages: (messages) => set({ messages }),

      setChatOpen: (isChatOpen) =>
        set({ isChatOpen, unreadCount: isChatOpen ? 0 : get().unreadCount }),

      clearUnread: () => set({ unreadCount: 0 }),

      // ── Lifecycle ─────────────────────────────────────────────────────────
      reset: () => {
        // Stop all local tracks before resetting
        const { localStream, localScreenStream } = get()
        localStream?.getTracks().forEach((t) => t.stop())
        localScreenStream?.getTracks().forEach((t) => t.stop())
        set({ ...initialState, peers: new Map() })
      },
    }),
    { name: 'CallStore' }
  )
)