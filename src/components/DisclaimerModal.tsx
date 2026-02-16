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
            ご利用前の確認
          </h2>
          <p className="text-gray-600 leading-relaxed">
            本アプリは滴下計算を<strong>補助するためのツール</strong>です。
          </p>
        </div>

        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
          <p className="text-sm text-amber-900 leading-relaxed">
            <strong>最終的な設定は、必ず医療従事者による目視と確認で行ってください。</strong>計算結果によって生じた事象について、本アプリは責任を負いかねます。
          </p>
        </div>

        <button
          onClick={handleAccept}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 tap-highlight-transparent active:scale-95 transform"
        >
          承諾して利用を開始する
        </button>

        <p className="text-xs text-gray-500 text-center">
          ボタンをクリックすることで、上記の内容を理解し承諾したものとみなします。
        </p>
      </div>
    </div>
  )
}
