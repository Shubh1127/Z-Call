// lib/models/Message.ts
import mongoose, { Schema, Document } from 'mongoose'

export interface IMessage extends Document {
  roomId: string
  sender: string
  peerId: string
  content: string
  timestamp: Date
}

const MessageSchema = new Schema<IMessage>({
  roomId:    { type: String, required: true },
  sender:    { type: String, required: true },
  peerId:    { type: String, required: true },
  content:   { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
})

export const Message = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema)