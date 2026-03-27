// lib/models/Peer.ts
import mongoose, { Schema, Document } from 'mongoose'

export interface IPeer extends Document {
  peerId: string
  name: string
  roomId: string
  joinedAt: Date
  socketId: string
}

const PeerSchema = new Schema<IPeer>({
  peerId:   { type: String, required: true },
  name:     { type: String, required: true },
  roomId:   { type: String, required: true },
  socketId: { type: String, required: true },
  joinedAt: { type: Date, default: Date.now },
})

export const Peer = mongoose.models.Peer || mongoose.model<IPeer>('Peer', PeerSchema)