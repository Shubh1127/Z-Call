'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCallStore } from '@/lib/client/store/useCallStore'
import { v4 as uuidv4 } from 'uuid'

export default function Home() {
  const router = useRouter()
  const { setIdentity } = useCallStore()
  const [myName, setMyName] = useState('')
  const [roomId, setRoomId] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const generateRoomId = () => {
    return uuidv4().split('-')[0]
  }

  const handleCreateRoom = async () => {
    if (!myName.trim()) {
      alert('Please enter your name')
      return
    }

    setIsLoading(true)
    try {
      const newRoomId = generateRoomId()
      const peerId = uuidv4()

      // Create room in database
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: newRoomId, name: `${myName}'s Room` }),
      })

      if (!response.ok) {
        throw new Error('Failed to create room')
      }

      // Set identity in store
      setIdentity(newRoomId, peerId, myName)

      // Navigate to room
      router.push(`/room/${newRoomId}`)
    } catch (err) {
      console.error('Failed to create room:', err)
      alert('Failed to create room')
      setIsLoading(false)
    }
  }

  const handleJoinRoom = async () => {
    if (!myName.trim()) {
      alert('Please enter your name')
      return
    }

    if (!roomId.trim()) {
      alert('Please enter a room ID')
      return
    }

    setIsLoading(true)
    try {
      const peerId = uuidv4()

      // Verify room exists
      const response = await fetch(`/api/rooms?roomId=${roomId}`)
      if (!response.ok) {
        throw new Error('Room not found')
      }

      // Set identity in store
      setIdentity(roomId, peerId, myName)

      // Navigate to room
      router.push(`/room/${roomId}`)
    } catch (err) {
      console.error('Failed to join room:', err)
      alert('Room not found. Please check the room ID.')
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-black font-sans gap-8 p-4">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-2">ZOOM</h1>
        <p className="text-gray-400 text-lg">Secure Video Conferencing</p>
      </div>

      {/* Main card */}
      <div className="bg-gray-900 rounded-lg border border-gray-700 p-8 max-w-md w-full">
        {/* Name input */}
        <div className="mb-6">
          <label className="block text-white text-sm font-semibold mb-2">
            Your Name
          </label>
          <input
            type="text"
            value={myName}
            onChange={(e) => setMyName(e.target.value)}
            placeholder="Enter your name"
            className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && myName.trim()) {
                handleCreateRoom()
              }
            }}
          />
        </div>

        {/* Create room button */}
        <button
          onClick={handleCreateRoom}
          disabled={isLoading || !myName.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors mb-4"
        >
          {isLoading ? 'Loading...' : '+ Create New Room'}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gray-700" />
          <span className="text-gray-400 text-sm">OR</span>
          <div className="flex-1 h-px bg-gray-700" />
        </div>

        {/* Room ID input */}
        <div className="mb-6">
          <label className="block text-white text-sm font-semibold mb-2">
            Room ID
          </label>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter room ID to join"
            className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && myName.trim() && roomId.trim()) {
                handleJoinRoom()
              }
            }}
          />
        </div>

        {/* Join room button */}
        <button
          onClick={handleJoinRoom}
          disabled={isLoading || !myName.trim() || !roomId.trim()}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {isLoading ? 'Loading...' : 'Join Room'}
        </button>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm">
        <p>Built with React, Next.js, and Mediasoup</p>
      </div>
    </div>
  )
}
