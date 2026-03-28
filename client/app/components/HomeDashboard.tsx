'use client'

import { useEffect, useState } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallStore } from '@/lib/client/store/useCallStore'
import { v4 as uuidv4 } from 'uuid'
import { Video, User } from 'lucide-react'

interface HomeDashboardProps {
  userName: string
}

export default function HomeDashboard({ userName }: HomeDashboardProps) {
  const router = useRouter()
  const { setIdentity } = useCallStore()
  const [current, setCurrent] = useState<Date>(new Date())
  const [roomId, setRoomId] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const generateRoomId = () => {
    return uuidv4().split('-')[0]
  }

  const handleCreateRoom = async () => {
    setIsLoading(true)
    try {
      const newRoomId = generateRoomId()
      const peerId = uuidv4()

      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: newRoomId, name: `${userName}'s Room` }),
      })

      if (!response.ok) {
        throw new Error('Failed to create room')
      }

      setIdentity(newRoomId, peerId, userName)
      router.push(`/room/${newRoomId}`)
    } catch (err) {
      console.error('Failed to create room:', err)
      alert('Failed to create room')
      setIsLoading(false)
    }
  }

  const handleJoinRoom = async () => {
    if (!roomId.trim()) {
      alert('Please enter a room ID')
      return
    }

    setIsLoading(true)
    try {
      const peerId = uuidv4()

      const response = await fetch(`/api/rooms?roomId=${roomId}`)
      if (!response.ok) {
        throw new Error('Room not found')
      }

      setIdentity(roomId, peerId, userName)
      router.push(`/room/${roomId}`)
    } catch (err) {
      console.error('Failed to join room:', err)
      alert('Room not found. Please check the room ID.')
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(new Date())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  const time = current.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  const date = current.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="flex flex-col p-4">
      <div className="mb-8 flex w-full cursor-pointer items-center justify-between gap-3 px-8 hover:border-gray-500">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-700">
          <span>
            <Video />
          </span>
          <h1 className="text-2xl font-bold">Orbit</h1>
        </div>
        <div className="flex items-center gap-6">
          <div>
            {time} | {date}
          </div>
          <div className="flex items-center gap-2 rounded-full border px-3 py-1">
            <div className="max-w-32 truncate">{userName}</div>
            <span className="rounded-full border p-1">
              <User />
            </span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="rounded-full border border-gray-600 px-3 py-1 text-sm hover:bg-gray-800"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="text-center">
        <h1 className="mb-2 text-5xl font-bold text-white">Video calls and meetings for everyone</h1>
        <p className="text-lg text-gray-400">Connect, collaborate, and communicate with Orbit</p>
      </div>

      <div className="mt-10 flex w-full flex-1 items-center justify-center gap-4 p-8">
        <button onClick={handleCreateRoom} disabled={isLoading} className="py-3 font-semibold text-white">
          {isLoading ? (
            'Loading...'
          ) : (
            <span className="flex w-max items-center gap-2 rounded-full bg-blue-500 p-3">
              <Video />
              new meeting
            </span>
          )}
        </button>

        <div>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter room ID to join"
            className="w-max rounded-2xl bg-gray-800 p-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && roomId.trim()) {
                handleJoinRoom()
              }
            }}
          />
        </div>

        <button
          onClick={handleJoinRoom}
          disabled={isLoading || !roomId.trim()}
          className="w-max rounded-lg rounded-4xl bg-green-600 px-3 py-1 font-semibold text-white transition-colors hover:bg-green-700 disabled:border disabled:border-gray-600 disabled:bg-transparent"
        >
          {isLoading ? 'Loading...' : 'Join'}
        </button>
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>Built with React, Next.js, and Mediasoup</p>
      </div>
    </div>
  )
}
