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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
      <div className="bg-greige rounded-3xl shadow-2xl max-w-md w-full p-8 space-y-5 animate-in fade-in zoom-in duration-300 border-4 border-sakura-200">
        <div className="flex items-center justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center shadow-lg">
            <AlertTriangle className="w-10 h-10 text-amber-600" />
          </div>
        </div>

        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold text-gray-800">
            ご利用前の確認
          </h2>
          <p className="text-gray-700 leading-relaxed text-lg">
            本アプリは滴下計算を<strong className="text-sakura-600">補助するためのツール</strong>です。
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-l-4 border-amber-400 p-5 rounded-2xl shadow-md">
          <p className="text-sm text-amber-900 leading-relaxed">
            <strong>最終的な設定は、必ず医療従事者による目視と確認で行ってください。</strong>計算結果によって生じた事象について、本アプリは責任を負いかねます。
          </p>
        </div>

        <button
          onClick={handleAccept}
          className="w-full bg-gradient-to-r from-sakura-400 to-sakura-500 hover:from-sakura-500 hover:to-sakura-600 text-white font-bold py-5 px-6 rounded-3xl transition-all duration-200 tap-highlight-transparent active:scale-95 transform shadow-lg"
        >
          承諾して利用を開始する
        </button>

        <p className="text-xs text-gray-500 text-center leading-relaxed">
          ボタンをクリックすることで、上記の内容を理解し承諾したものとみなします。
        </p>
      </div>
    </div>
  )
}
