'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, X } from 'lucide-react'

interface ToastProps {
  message: string
  subMessage?: string
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export default function Toast({ message, subMessage, isVisible, onClose, duration = 3000 }: ToastProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isVisible) {
      // Trigger entrance animation
      requestAnimationFrame(() => setIsAnimating(true))

      const timer = setTimeout(() => {
        setIsAnimating(false)
        setTimeout(onClose, 300) // Wait for exit animation
      }, duration)

      return () => clearTimeout(timer)
    } else {
      setIsAnimating(false)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
      <div
        className={`pointer-events-auto flex items-center gap-3 bg-white border-2 border-sakura-300 rounded-3xl shadow-2xl px-5 py-4 max-w-sm transition-all duration-300 ${
          isAnimating
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 -translate-y-4 scale-95'
        }`}
      >
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-sakura-300 to-sakura-400 rounded-full flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{message}</p>
          {subMessage && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">{subMessage}</p>
          )}
        </div>
        <button
          onClick={() => {
            setIsAnimating(false)
            setTimeout(onClose, 300)
          }}
          className="flex-shrink-0 p-1 hover:bg-greige-200 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  )
}
