'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'

interface DisclaimerModalProps {
  onAccept: () => void
}

export default function DisclaimerModal({ onAccept }: DisclaimerModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Check if user has already accepted the disclaimer
    const hasAccepted = localStorage.getItem('drip-calculator-disclaimer-accepted')
    if (!hasAccepted) {
      setIsOpen(true)
    } else {
      onAccept()
    }
  }, [onAccept])

  const handleAccept = () => {
    localStorage.setItem('drip-calculator-disclaimer-accepted', 'true')
    setIsOpen(false)
    onAccept()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            Important Disclaimer
          </h2>
          <p className="text-gray-600 leading-relaxed">
            This drip rate calculator is a <strong>support tool</strong> designed to assist healthcare professionals.
          </p>
        </div>

        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
          <p className="text-sm text-amber-900">
            <strong>Final verification must always be done visually by a qualified professional.</strong> This tool does not replace clinical judgment or proper medical procedures.
          </p>
        </div>

        <button
          onClick={handleAccept}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 tap-highlight-transparent active:scale-95 transform"
        >
          I Understand & Agree
        </button>

        <p className="text-xs text-gray-500 text-center">
          By clicking "I Understand & Agree", you acknowledge that you have read and understood this disclaimer.
        </p>
      </div>
    </div>
  )
}
