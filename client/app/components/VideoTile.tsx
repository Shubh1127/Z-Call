'use client'

import { useEffect, useRef } from 'react'

interface VideoTileProps {
  stream: MediaStream
  name: string
  isSpeaking?: boolean
  isMuted?: boolean
  isLocalStream?: boolean
}

export function VideoTile({
  stream,
  name,
  isSpeaking = false,
  isMuted = false,
  isLocalStream = false,
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!videoRef.current || !stream) return

    videoRef.current.srcObject = stream
    videoRef.current
      .play()
      .catch((err) => console.error('Video play failed:', err))
  }, [stream])

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden group">
      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocalStream || isMuted}
        className="w-full h-full object-cover"
      />

      {/* Speaking indicator border */}
      {isSpeaking && (
        <div className="absolute inset-0 border-4 border-blue-500 rounded-lg pointer-events-none" />
      )}

      {/* Name and status overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-white text-sm font-medium truncate">{name}</p>
            {isLocalStream && (
              <p className="text-gray-300 text-xs">You</p>
            )}
          </div>
          {isMuted && (
            <div className="ml-2 flex items-center justify-center w-6 h-6 bg-red-500 rounded-full">
              <span className="text-white text-xs font-bold">🔇</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
