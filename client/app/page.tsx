'use client'

import { useState,useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCallStore } from '@/lib/client/store/useCallStore'
import { v4 as uuidv4 } from 'uuid'
import {Video,User} from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const { setIdentity } = useCallStore()
  const [current,setCurrent]=useState<Date>(new Date());
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
 useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(new Date());
    }, 60000); // update every minute

    return () => clearInterval(interval);
  }, []);

  const time = current.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const date = current.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  
  return (
    <div className="p-4">
      
      {/*Navbar */}
      <div className='flex justify-between items-center px-8 gap-3 hover:border-gray-500 w-full mb-8 cursor-pointer '>
        <div className='flex items-center gap-3 hover:bg-gray-700 rounded-lg py-2 px-2'>
        <span><Video /></span>
        <h1 className=' text-2xl font-bold'> Orbit</h1>
        </div>
        <div className='flex gap-6 items-center'>
        <div className=''>
          {time} | {date}
        </div>
        {/*User Info */}
        <div className='flex items-center gap-2 border rounded-full py-1 px-3'>
          <div>User</div>
          <span className='border rounded-full p-1'>
          <User/>
          </span>
        </div>
        </div>
      </div>
      {/* Header */}
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-2 w-">Video calls and meetings for everyone</h1>
        <p className="text-gray-400 text-lg">Connect, collaborate, and communicate with Orbit</p>
      </div>

      {/* Main card */}
      <div className="flex justify-center items-center  w-full p-8 gap-4 mt-10">
        {/* Name input */}
        {/* <div className="mb-6">
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
        </div> */}

        {/* Create room button */}
        <button
          onClick={handleCreateRoom}
          disabled={isLoading || !myName.trim()}
          className=" hover:bg-blue-700  text-white font-semibold py-3  "
        >
          {isLoading ? 'Loading...' : <span className='flex items-center bg-blue-500 gap-2 rounded-full w-max p-3 '><Video /> new meeting</span>}
        </button>

        {/* Divider */}
        {/* <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gray-700" />
          <span className="text-gray-400 text-sm">OR</span>
          <div className="flex-1 h-px bg-gray-700" />
        </div> */}

        {/* Room ID input */}
        <div className="">
          {/* <label className="block text-white text-sm font-semibold mb-2">
            Room ID
          </label> */}
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter room ID to join"
            className="w-max bg-gray-800 text-white rounded-2xl p-3  focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="w-max px-3 rounded-4xl bg-green-600 hover:bg-green-700 disabled:bg-transparent disabled:border disabled:border-gray-600 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {isLoading ? 'Loading...' : 'Join '}
        </button>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm">
        <p>Built with React, Next.js, and Mediasoup</p>
      </div>
    </div>
  )
}
