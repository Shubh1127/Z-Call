import * as mediasoup from 'mediasoup'
import { getNextWorker } from './worker'

// One router per room
const routers = new Map<string, mediasoup.types.Router>()

const mediaCodecs: mediasoup.types.RtpCodecCapability[] = [
  {
    kind: 'audio',
    mimeType: 'audio/opus',
    clockRate: 48000,
    channels: 2,
    preferredPayloadType: 111,
  },
  {
    kind: 'video',
    mimeType: 'video/VP8',
    clockRate: 90000,
    preferredPayloadType: 96,
    parameters: {},
  },
  {
    kind: 'video',
    mimeType: 'video/VP9',
    clockRate: 90000,
    preferredPayloadType: 98,
    parameters: { 'profile-id': 2 },
  },
  {
    kind: 'video',
    mimeType: 'video/h264',
    clockRate: 90000,
    preferredPayloadType: 100,
    parameters: {
      'packetization-mode': 1,
      'profile-level-id': '4d0032',
      'level-asymmetry-allowed': 1,
    },
  },
]

export async function getOrCreateRouter(
  roomId: string
): Promise<mediasoup.types.Router> {
  if (!routers.has(roomId)) {
    const worker = getNextWorker()
    const router = await worker.createRouter({ mediaCodecs })
    routers.set(roomId, router)
    console.log(`  → Router created for room: ${roomId}`)
  }
  return routers.get(roomId)!
}

export function closeRouter(roomId: string): void {
  const router = routers.get(roomId)
  if (router) {
    router.close()
    routers.delete(roomId)
    console.log(`  → Router closed for room: ${roomId}`)
  }
}