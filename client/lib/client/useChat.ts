'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useSocket } from './useSocket'
import { useCallStore } from './store/useCallStore'
import type { IncomingChatMessage, ChatMessagePayload } from '../socket/types'

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useChat() {
  const { emit, on } = useSocket()
  const listenerRegistered = useRef(false)

  const {
    roomId,
    peerId,
    myName,
    addMessage,
    isChatOpen,
    unreadCount,
    messages,
    setChatOpen,
    clearUnread,
  } = useCallStore()

  // ── Listen for incoming chat messages ────────────────────────────────────
  useEffect(() => {
    // Register only once per mount
    if (listenerRegistered.current) return
    listenerRegistered.current = true

    const cleanup = on('chat-message', (msg: IncomingChatMessage) => {
      addMessage({
        peerId:    msg.peerId,
        sender:    msg.sender,
        content:   msg.content,
        timestamp: msg.timestamp,
      })
    })

    return () => {
      cleanup()
      listenerRegistered.current = false
    }
  }, [on, addMessage])

  // ── Clear unread when chat is opened ────────────────────────────────────
  useEffect(() => {
    if (isChatOpen) clearUnread()
  }, [isChatOpen, clearUnread])

  // ── Send a message ───────────────────────────────────────────────────────
  const sendMessage = useCallback(
    (content: string) => {
      const trimmed = content.trim()
      if (!trimmed || !roomId || !peerId) return

      const payload: ChatMessagePayload = {
        roomId,
        peerId,
        sender:  myName,
        content: trimmed,
      }

      emit('chat-message', payload)
    },
    [emit, roomId, peerId, myName]
  )

  // ── Toggle chat panel ────────────────────────────────────────────────────
  const toggleChat = useCallback(() => {
    setChatOpen(!isChatOpen)
  }, [isChatOpen, setChatOpen])

  return {
    messages,
    sendMessage,
    isChatOpen,
    toggleChat,
    unreadCount,
  }
}