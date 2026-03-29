import * as mediasoup from 'mediasoup'

const ANNOUNCED_IP = process.env.ANNOUNCED_IP || '127.0.0.1'

const webRtcTransportOptions: mediasoup.types.WebRtcTransportOptions = {
  listenIps: [
    {
      ip: '0.0.0.0',
      announcedIp: ANNOUNCED_IP,
    },
  ],
  enableUdp: true,
  enableTcp: true,
  preferUdp: true,
  initialAvailableOutgoingBitrate: 1_000_000,
  maxSctpMessageSize: 262144,
}

export async function createWebRtcTransport(
  router: mediasoup.types.Router
): Promise<mediasoup.types.WebRtcTransport> {
  const transport = await router.createWebRtcTransport(webRtcTransportOptions)

  transport.on('dtlsstatechange', (dtlsState) => {
    if (dtlsState === 'failed' || dtlsState === 'closed') {
      console.warn(`Transport ${transport.id} DTLS state: ${dtlsState}`)
      transport.close()
    }
  })

  return transport
}

/** Serialise only the fields the client needs */
export function transportParams(transport: mediasoup.types.WebRtcTransport) {
  return {
    id:             transport.id,
    iceParameters:  transport.iceParameters,
    iceCandidates:  transport.iceCandidates,
    dtlsParameters: transport.dtlsParameters,
    sctpParameters: transport.sctpParameters,
  }
}