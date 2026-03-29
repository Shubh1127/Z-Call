'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useCallStore, RemotePeer } from '@/lib/client/store/useCallStore'
import { VideoTile } from './VideoTile'

interface VideoGridProps {
  isScreenSharing?: boolean
  screenShareStream?: MediaStream | null
  screenShareName?: string
}

function RemoteAudio({ stream }: { stream: MediaStream }) {
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.srcObject = stream
    audioRef.current.play().catch(() => {
      // Browser autoplay policies can block play until user interacts.
    })
  }, [stream])

  return <audio ref={audioRef} autoPlay playsInline />
}

export function VideoGrid({
  isScreenSharing = false,
  screenShareStream,
  screenShareName = 'Screen Share',
}: VideoGridProps) {
  const { localStream, myName, myImage, peers, isMicOn } = useCallStore()
  const isSharing = isScreenSharing

  // Determine the layout based on screen sharing status
  const layout = useMemo(() => {
    if (isSharing && screenShareStream) {
      return 'screen-share'
    }
    const peerCount = peers.size
    if (peerCount === 0) return 'grid-1'
    if (peerCount === 1) return 'grid-2'
    if (peerCount <= 3) return 'grid-3'
    if (peerCount <= 6) return 'grid-4'
    return 'grid-6'
  }, [peers.size, isSharing, screenShareStream])

  const gridClasses = {
    'grid-1': 'grid-cols-1',
    'grid-2': 'grid-cols-2',
    'grid-3': 'grid-cols-3 grid-rows-2',
    'grid-4': 'grid-cols-2 grid-rows-2',
    'grid-6': 'grid-cols-3 grid-rows-2',
    'screen-share': 'grid-cols-3 grid-rows-1',
  }

  const getPreferredVideoStream = (peer: RemotePeer) => {
    const streams = Array.from(peer.streams.values())
    const screenStream = streams.find((s) => s.kind === 'video' && s.source === 'screen')
    if (screenStream) return screenStream
    return streams.find((s) => s.kind === 'video')
  }

  return (
    <div className="w-full h-full bg-black p-4 rounded-lg">
      {/* Hidden audio sinks for remote peer audio tracks */}
      {Array.from(peers.values()).flatMap((peer: RemotePeer) =>
        Array.from(peer.streams.entries())
          .filter(([, data]) => data.kind === 'audio')
          .map(([producerId, data]) => (
            <RemoteAudio key={`${peer.peerId}-${producerId}`} stream={data.stream} />
          ))
      )}

      {/* Screen share mode */}
      {isSharing && screenShareStream && (
        <div className="grid grid-cols-3 gap-4 h-full">
          {/* Large screen share on left */}
          <div className="col-span-2 h-full rounded-lg overflow-hidden">
            <VideoTile
              stream={screenShareStream}
              name={screenShareName}
              image={undefined}
              isMuted={true}
              isLocalStream={false}
            />
          </div>

          {/* Small video tiles on right */}
          <div className="flex flex-col gap-4 h-full overflow-y-auto">
            {/* Local video */}
            {localStream && (
              <div className="flex-1 min-h-24 rounded-lg overflow-hidden">
                <VideoTile
                  stream={localStream}
                  name={myName || 'You'}
                  image={myImage}
                  isMuted={!isMicOn}
                  isLocalStream={true}
                />
              </div>
            )}

            {/* Remote peers */}
            {Array.from(peers.values()).map((peer: RemotePeer) => {
              const videoStream = getPreferredVideoStream(peer)
              return (
                <div key={peer.peerId} className="flex-1 min-h-24 rounded-lg overflow-hidden">
                  <VideoTile
                    stream={videoStream?.stream || null}
                    name={peer.name}
                    image={peer.image}
                    isSpeaking={peer.isSpeaking}
                    isMuted={false}
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Normal grid mode */}
      {!isSharing && (
        <div className={`grid ${gridClasses[layout as keyof typeof gridClasses]} gap-4 h-full`}>
          {/* Local video */}
          {localStream && (
            <div className="rounded-lg overflow-hidden">
              <VideoTile
                stream={localStream}
                name={myName || 'You'}
                image={myImage}
                isMuted={!isMicOn}
                isLocalStream={true}
              />
            </div>
          )}

          {/* Remote peers */}
          {Array.from(peers.values())
            .slice(0, layout === 'grid-1' ? 0 : layout === 'grid-2' ? 1 : 5)
            .map((peer: RemotePeer) => {
              const videoStream = getPreferredVideoStream(peer)
              return (
                <div key={peer.peerId} className="rounded-lg overflow-hidden">
                  <VideoTile
                    stream={videoStream?.stream || null}
                    name={peer.name}
                    image={peer.image}
                    isSpeaking={peer.isSpeaking}
                  />
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}
