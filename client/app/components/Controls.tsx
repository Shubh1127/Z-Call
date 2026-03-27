'use client'

import { useCallStore } from '@/lib/client/store/useCallStore'

interface ControlsProps {
  onEndCall?: () => void
  onScreenShare?: () => void
}

export function Controls({ onEndCall, onScreenShare }: ControlsProps) {
  const {
    isMicOn,
    isCameraOn,
    isScreenSharing,
    isChatOpen,
    setMicOn,
    setCameraOn,
    setScreenSharing,
    setChatOpen,
  } = useCallStore()

  const handleToggleMic = () => {
    setMicOn(!isMicOn)
  }

  const handleToggleCamera = () => {
    setCameraOn(!isCameraOn)
  }

  const handleToggleScreenShare = () => {
    setScreenSharing(!isScreenSharing)
    onScreenShare?.()
  }

  const handleToggleChat = () => {
    setChatOpen(!isChatOpen)
  }

  const ControlButton = ({
    onClick,
    isActive,
    icon,
    label,
    variant = 'default',
  }: {
    onClick: () => void
    isActive: boolean
    icon: string
    label: string
    variant?: 'default' | 'danger'
  }) => {
    const bgColor =
      variant === 'danger'
        ? 'bg-red-600 hover:bg-red-700'
        : isActive
          ? 'bg-gray-700 hover:bg-gray-600'
          : 'bg-blue-600 hover:bg-blue-700'

    return (
      <button
        onClick={onClick}
        className={`${bgColor} text-white rounded-full p-3 transition-all duration-200 flex flex-col items-center gap-1 min-w-14`}
        title={label}
      >
        <span className="text-xl">{icon}</span>
        <span className="text-xs font-medium hidden sm:inline">{label}</span>
      </button>
    )
  }

  return (
    <div className="flex items-center justify-center gap-3 bg-gray-900 rounded-lg p-4 flex-wrap sm:flex-nowrap">
      {/* Mic toggle */}
      <ControlButton
        onClick={handleToggleMic}
        isActive={isMicOn}
        icon={isMicOn ? '🎤' : '🔇'}
        label="Mic"
      />

      {/* Camera toggle */}
      <ControlButton
        onClick={handleToggleCamera}
        isActive={isCameraOn}
        icon={isCameraOn ? '📹' : '📹'}
        label="Camera"
      />

      {/* Screen share */}
      <ControlButton
        onClick={handleToggleScreenShare}
        isActive={isScreenSharing}
        icon={isScreenSharing ? '🖥️' : '🖥️'}
        label="Share"
      />

      {/* Chat toggle */}
      <ControlButton
        onClick={handleToggleChat}
        isActive={isChatOpen}
        icon={isChatOpen ? '💬' : '💬'}
        label="Chat"
      />

      {/* Divider */}
      <div className="h-8 w-px bg-gray-700 hidden sm:block" />

      {/* End call */}
      <ControlButton
        onClick={onEndCall || (() => {})}
        isActive={false}
        icon="📞"
        label="End"
        variant="danger"
      />
    </div>
  )
}
