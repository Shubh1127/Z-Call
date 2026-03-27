import * as mediasoup from 'mediasoup'
import os from 'os'

const workers: mediasoup.types.Worker[] = []
let workerIndex = 0

/**
 * Spawn one mediasoup Worker per CPU core (max 4).
 * Each Worker runs in its own thread and handles RTP/RTCP.
 */
export async function initMediasoupWorkers(): Promise<void> {
  const numCores = Math.min(os.cpus().length, 4)

  for (let i = 0; i < numCores; i++) {
    const worker = await mediasoup.createWorker({
      logLevel: 'warn',
      logTags: ['rtp', 'srtp', 'rtcp'],
      rtcMinPort: 10000,
      rtcMaxPort: 10999,
    })

    worker.on('died', (error) => {
      console.error(`❌ mediasoup Worker[${i}] died:`, error)
      // In production you might want to respawn
      process.exit(1)
    })

    workers.push(worker)
    console.log(`  → Worker[${i}] PID: ${worker.pid}`)
  }
}

/**
 * Round-robin across workers so load is distributed evenly.
 */
export function getNextWorker(): mediasoup.types.Worker {
  if (workers.length === 0) throw new Error('Workers not initialized yet')
  const worker = workers[workerIndex % workers.length]
  workerIndex++
  return worker
}