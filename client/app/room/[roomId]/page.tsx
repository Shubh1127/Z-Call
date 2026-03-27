'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCallStore } from '@/lib/client/store/useCallStore'
import { VideoGrid } from '@/app/components/VideoGrid'
import { Controls } from '@/app/components/Controls'
import { ChatPanel } from '@/app/components/ChatPanel'

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId as string
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const {
    isConnected,
    isJoining,
    joinError,
    myName,
    isScreenSharing,
    localScreenStream,
    isChatOpen,
    reset,
  } = useCallStore()

  // Initialize on mount
  useEffect(() => {
    if (!roomId) {
      setError('Invalid room ID')
      return
    }

    // TODO: Initialize connection to room
    // For now, just mark as loaded
    setIsLoading(false)
  }, [roomId])

  // Handle errors
  useEffect(() => {
    if (joinError) {
      setError(joinError)
    }
  }, [joinError])

  const handleEndCall = () => {
    reset()
    router.push('/')
  }

  const handleScreenShare = () => {
    // TODO: Implement screen share logic
    console.log('Screen share toggled')
  }

  const handleSendMessage = (message: string) => {
    // TODO: Emit message via socket
    console.log('Send message:', message)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
          <p className="text-white">Loading room...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-black">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
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
            {isConnected ? '🟢 Connected' : isJoining ? '🟡 Joining...' : '🔴 Disconnected'}
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
        />
      </div>
    </div>
  )
}
