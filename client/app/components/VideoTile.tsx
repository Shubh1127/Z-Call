'use client'

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'

interface VideoTileProps {
  stream?: MediaStream | null
  name: string
  image?: string
  isSpeaking?: boolean
  isMuted?: boolean
  isLocalStream?: boolean
}

export function VideoTile({
  stream,
  name,
  image,
  isSpeaking = false,
  isMuted = false,
  isLocalStream = false,
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [, setTrackVersion] = useState(0)

  const videoTrack = useMemo(() => stream?.getVideoTracks()[0] || null, [stream])
  const hasRenderableVideo = !!videoTrack && videoTrack.readyState === 'live'

  const tileBackground = useMemo(() => {
    const colors = [
      'bg-rose-600',
      'bg-orange-600',
      'bg-amber-600',
      'bg-emerald-600',
      'bg-cyan-600',
      'bg-sky-600',
      'bg-indigo-600',
      'bg-fuchsia-600',
    ]

    let hash = 0
    for (let i = 0; i < name.length; i += 1) {
      hash = (hash << 5) - hash + name.charCodeAt(i)
      hash |= 0
    }
    return colors[Math.abs(hash) % colors.length]
  }, [name])

  const initial = useMemo(() => {
    const firstChar = name.trim().charAt(0)
    return firstChar ? firstChar.toUpperCase() : 'U'
  }, [name])

  useEffect(() => {
    if (!videoTrack) {
      return
    }

    const bumpTrackVersion = () => {
      setTrackVersion((v) => v + 1)
    }

    videoTrack.addEventListener('mute', bumpTrackVersion)
    videoTrack.addEventListener('unmute', bumpTrackVersion)
    videoTrack.addEventListener('ended', bumpTrackVersion)

    return () => {
      videoTrack.removeEventListener('mute', bumpTrackVersion)
      videoTrack.removeEventListener('unmute', bumpTrackVersion)
      videoTrack.removeEventListener('ended', bumpTrackVersion)
    }
  }, [videoTrack])

  useEffect(() => {
    if (!videoRef.current || !stream || !hasRenderableVideo) return

    videoRef.current.srcObject = stream
    videoRef.current
      .play()
      .catch((err) => console.error('Video play failed:', err))
  }, [stream, hasRenderableVideo])

  return (
    <div
      className={`relative w-full h-full rounded-lg overflow-hidden group ${
        hasRenderableVideo ? 'bg-black' : tileBackground
      }`}
    >
      {/* Avatar layer */}
      {!hasRenderableVideo && (
        <div className="absolute inset-0 flex items-center justify-center">
          {image ? (
            <Image
              src={image}
              alt={`${name} avatar`}
              width={112}
              height={112}
              className="h-28 w-28 rounded-full border-2 border-white/30 object-cover"
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-white/30 bg-black/20 text-4xl font-bold text-white">
              {initial}
            </div>
          )}
        </div>
      )}

      {/* Video element */}
      {hasRenderableVideo && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocalStream || isMuted}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

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
