import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db/connect'
import { Room } from '@/lib/models/Room'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { roomId, name } = body

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 })
    }

    await connectDB()

    // Check if room already exists
    const existing = await Room.findOne({ roomId })
    if (existing) {
      return NextResponse.json({
        roomId: existing.roomId,
        name: existing.name,
        exists: true,
      })
    }

    // Create new room
    const room = await Room.create({
      roomId,
      name: name || `Room ${roomId}`,
      isActive: true,
    })

    return NextResponse.json({
      roomId: room.roomId,
      name: room.name,
      created: true,
    })
  } catch (error: unknown) {
    console.log("🚨 SHUBHAM Error in /api/rooms POST handler:", error)
    console.error('Create room error:', error)
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const roomId = searchParams.get('roomId')

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 })
    }

    await connectDB()

    const room = await Room.findOne({ roomId })
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    return NextResponse.json({
      roomId: room.roomId,
      name: room.name,
      isActive: room.isActive,
      createdAt: room.createdAt,
    })
  } catch (error: unknown) {
    console.error('Get room error:', error)
    return NextResponse.json(
      { error: 'Failed to get room' },
      { status: 500 }
    )
  }
}
