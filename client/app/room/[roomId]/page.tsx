'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCallStore } from '@/lib/client/store/useCallStore'
import { useMediasoup } from '@/lib/client/useMediasoup'
import { useChat } from '@/lib/client/useChat'
import { VideoGrid } from '@/app/components/VideoGrid'
import { Controls } from '@/app/components/Controls'
import { ChatPanel } from '@/app/components/ChatPanel'

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId as string
  const [isInitialized, setIsInitialized] = useState(false)

  const {
    isConnected,
    isJoining,
    joinError,
    myName,
    peerId,
    isScreenSharing,
    localScreenStream,
    isChatOpen,
  } = useCallStore()

  const {
    joinRoom,
    leaveRoom,
    toggleMic,
    toggleCamera,
    startScreenShare,
    stopScreenShare,
  } = useMediasoup()

  const { sendMessage } = useChat()

  // Join room on mount
  useEffect(() => {
    if (!roomId || !peerId || !myName || isInitialized) return

    console.log('Initializing room...')
    joinRoom()
    setIsInitialized(true)
  }, [roomId, peerId, myName, isInitialized, joinRoom])

  // Handle screen share toggle
  const handleScreenShare = () => {
    if (isScreenSharing) {
      stopScreenShare()
    } else {
      startScreenShare()
    }
  }

  // Handle end call
  const handleEndCall = () => {
    leaveRoom()
    router.push('/')
  }

  // Handle send message
  const handleSendMessage = (message: string) => {
    sendMessage(message)
  }

  // Show loading state
  if (isJoining || !isInitialized) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
          <p className="text-white">Joining room...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (joinError) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-black">
        <div className="text-center">
          <p className="text-red-400 mb-4">{joinError}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full h-screen bg-black gap-4 p-4">
      {/* Header with room info */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Room: {roomId}</h1>
          <p className="text-gray-400 text-sm">
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </p>
        </div>
        <div className="text-white text-sm">
          <p>{myName || 'Anonymous'}</p>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Video grid (takes most space) */}
        <div className="flex-1 min-w-0">
          <VideoGrid
            isScreenSharing={isScreenSharing}
            screenShareStream={localScreenStream}
            screenShareName={myName || 'You'}
          />
        </div>

        {/* Chat panel (side panel) */}
        {isChatOpen && (
          <div className="w-80 min-h-0">
            <ChatPanel onSendMessage={handleSendMessage} />
          </div>
        )}
      </div>

      {/* Controls at bottom */}
      <div>
        <Controls
          onEndCall={handleEndCall}
          onScreenShare={handleScreenShare}
          onToggleMic={toggleMic}
          onToggleCamera={toggleCamera}
        />
      </div>
    </div>
  )
}
