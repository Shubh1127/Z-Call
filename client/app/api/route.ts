// app/api/rooms/route.ts
import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import { Room } from '@/lib/models/Room'
import { v4 as uuidv4 } from 'uuid'

// Create room
export async function POST(req: Request) {
  await connectDB()
  const { name } = await req.json()
  const room = await Room.create({ name, roomId: uuidv4() })
  return NextResponse.json(room)
}

// List rooms
export async function GET() {
  await connectDB()
  const rooms = await Room.find({ isActive: true }).sort({ createdAt: -1 })
  return NextResponse.json(rooms)
}