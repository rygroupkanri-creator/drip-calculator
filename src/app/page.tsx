'use client'

import { useState, useRef, useCallback } from 'react'
import { Calculator as CalcIcon, Clock, Mic } from 'lucide-react'
import Calculator from '@/components/Calculator'
import MultiTimer, { MultiTimerRef } from '@/components/MultiTimer'
import VoiceMemo from '@/components/VoiceMemo'
import Toast from '@/components/Toast'

type Tab = 'calculator' | 'timers' | 'voice'

interface ToastData {
  message: string
  subMessage?: string
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('calculator')
  const multiTimerRef = useRef<MultiTimerRef>(null)
  const [toast, setToast] = useState<ToastData | null>(null)
  const [toastVisible, setToastVisible] = useState(false)

  const showToast = useCallback((message: string, subMessage?: string) => {
    setToast({ message, subMessage })
    setToastVisible(true)
  }, [])

  const hideToast = useCallback(() => {
    setToastVisible(false)
    setTimeout(() => setToast(null), 300)
  }, [])

  return (
    <main className="min-h-screen flex flex-col pb-nav">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          subMessage={toast.subMessage}
          isVisible={toastVisible}
          onClose={hideToast}
        />
      )}

      {/* Tab Content — Always mounted to preserve state */}
      <div className="flex-1 relative">
        <div className={activeTab === 'calculator' ? 'block' : 'hidden'}>
          <Calculator multiTimerRef={multiTimerRef} onToast={showToast} />
        </div>

        <div className={activeTab === 'timers' ? 'block' : 'hidden'}>
          <div className="container mx-auto px-4 pt-4 pb-6 max-w-2xl">
            <div className="text-center py-4 mb-4">
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-7 h-7 text-mint-500" />
                <h1 className="text-2xl font-bold text-gray-800">タイマー一覧</h1>
              </div>
              <p className="text-gray-500 text-sm mt-1">登録中のタイマーと履歴</p>
            </div>
            <MultiTimer ref={multiTimerRef} onToast={showToast} />
          </div>
        </div>

        <div className={activeTab === 'voice' ? 'block' : 'hidden'}>
          <div className="container mx-auto px-4 pt-4 pb-6 max-w-2xl">
            <div className="text-center py-4 mb-4">
              <div className="flex items-center justify-center gap-2">
                <Mic className="w-7 h-7 text-sakura-400" />
                <h1 className="text-2xl font-bold text-gray-800">音声メモ</h1>
              </div>
              <p className="text-gray-500 text-sm mt-1">電子カルテ入力の下書きに</p>
            </div>
            <VoiceMemo onToast={showToast} />
          </div>
        </div>
      </div>

      {/* Fixed Bottom Navigation — iOS-style slim design */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-50 pb-safe">
        <div className="container mx-auto max-w-2xl">
          <div className="grid grid-cols-3 h-[56px]">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors duration-150 tap-highlight-transparent ${
                activeTab === 'calculator'
                  ? 'text-sakura-500'
                  : 'text-gray-400 active:text-gray-600'
              }`}
            >
              <CalcIcon className="w-5 h-5" />
              <span className="text-[10px] font-medium whitespace-nowrap">計算</span>
            </button>

            <button
              onClick={() => setActiveTab('timers')}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors duration-150 tap-highlight-transparent ${
                activeTab === 'timers'
                  ? 'text-mint-500'
                  : 'text-gray-400 active:text-gray-600'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span className="text-[10px] font-medium whitespace-nowrap">タイマー</span>
            </button>

            <button
              onClick={() => setActiveTab('voice')}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors duration-150 tap-highlight-transparent ${
                activeTab === 'voice'
                  ? 'text-sakura-500'
                  : 'text-gray-400 active:text-gray-600'
              }`}
            >
              <Mic className="w-5 h-5" />
              <span className="text-[10px] font-medium whitespace-nowrap">メモ</span>
            </button>
          </div>
        </div>
      </nav>
    </main>
  )
}
