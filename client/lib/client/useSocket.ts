'use client'

import { useEffect, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useCallStore } from './store/useCallStore'

// ─── Singleton socket instance ────────────────────────────────────────────────
// Kept outside React so it survives re-renders and is shared across hooks.
let socketInstance: Socket | null = null

function getSocket(): Socket {
  if (!socketInstance) {
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      (typeof window !== 'undefined' ? window.location.origin : '')

    socketInstance = io(socketUrl, {
      transports: ['polling', 'websocket'],
      withCredentials: true,
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })
  }
  return socketInstance
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSocket() {
  const socket = getSocket()
  const setConnected = useCallStore((s) => s.setConnected)
  const setJoinError  = useCallStore((s) => s.setJoinError)

  useEffect(() => {
    if (!socket.connected) {
      socket.connect()
    }

    function onConnect() {
      console.log('🔌 Socket connected:', socket.id)
      setConnected(true)
      setJoinError(null)
    }

    function onDisconnect(reason: string) {
      console.warn('🔌 Socket disconnected:', reason)
      setConnected(false)
    }

    function onConnectError(err: Error) {
      console.error('🔌 Socket connection error:', err.message)
      setJoinError('Connection failed. Retrying...')
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('connect_error', onConnectError)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('connect_error', onConnectError)
    }
  }, [socket, setConnected, setJoinError])

  /** Type-safe emit with acknowledgement (returns a Promise) */
  const emitWithAck = useCallback(
    <T = unknown>(event: string, payload?: object): Promise<T> => {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error(`Timeout: ${event}`)), 10_000)
        socket.emit(event, payload, (response: T) => {
          clearTimeout(timeout)
          resolve(response)
        })
      })
    },
    [socket]
  )

  /** Fire-and-forget emit */
  const emit = useCallback((event: string, payload?: object) => {
    socket.emit(event, payload)
  }, [socket])

  /** Subscribe to a socket event, auto-cleans up on unmount */
  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    socket.on(event, handler)
    return () => {
      socket.off(event, handler)
    }
  }, [socket])

  /** Disconnect and destroy singleton (call on app unmount / leave) */
  const disconnect = useCallback(() => {
    socketInstance?.disconnect()
    socketInstance = null
  }, [])

  return {
    socket,
    emitWithAck,
    emit,
    on,
    disconnect,
  }
}