import mongoose, { Schema, Document } from 'mongoose'

export interface IRoom extends Document {
  name: string
  roomId: string
  createdAt: Date
  isActive: boolean
}

const RoomSchema = new Schema<IRoom>({
  name:      { type: String, required: true },
  roomId:    { type: String, required: true, unique: true },
  isActive:  { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
})

export const Room = mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema)