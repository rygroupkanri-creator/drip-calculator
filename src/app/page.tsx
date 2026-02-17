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
    <main className="min-h-screen flex flex-col pb-20">
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
        {/* Calculator Tab */}
        <div className={activeTab === 'calculator' ? 'block' : 'hidden'}>
          <Calculator multiTimerRef={multiTimerRef} onToast={showToast} />
        </div>

        {/* Timers Tab */}
        <div className={activeTab === 'timers' ? 'block' : 'hidden'}>
          <div className="container mx-auto px-4 py-6 max-w-2xl">
            <div className="text-center space-y-3 py-6 mb-6">
              <div className="flex items-center justify-center gap-3">
                <Clock className="w-10 h-10 text-mint-500" />
                <h1 className="text-4xl font-bold text-gray-800">タイマー一覧</h1>
              </div>
              <p className="text-gray-600 text-lg">
                登録中のタイマーと履歴
              </p>
            </div>
            <MultiTimer ref={multiTimerRef} onToast={showToast} />
          </div>
        </div>

        {/* Voice Memo Tab */}
        <div className={activeTab === 'voice' ? 'block' : 'hidden'}>
          <div className="container mx-auto px-4 py-6 max-w-2xl">
            <div className="text-center space-y-3 py-6 mb-6">
              <div className="flex items-center justify-center gap-3">
                <Mic className="w-10 h-10 text-sakura-400" />
                <h1 className="text-4xl font-bold text-gray-800">音声メモ</h1>
              </div>
              <p className="text-gray-600 text-lg">
                電子カルテ入力の下書きに
              </p>
            </div>
            <VoiceMemo onToast={showToast} />
          </div>
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-greige-300 shadow-lg z-50">
        <div className="container mx-auto max-w-2xl">
          <div className="grid grid-cols-3">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`py-4 px-2 flex flex-col items-center justify-center gap-1 transition-all duration-200 tap-highlight-transparent ${
                activeTab === 'calculator'
                  ? 'bg-gradient-to-t from-sakura-100 to-white text-sakura-600 border-t-4 border-sakura-500'
                  : 'text-gray-500 hover:bg-greige-100'
              }`}
            >
              <CalcIcon className="w-6 h-6" />
              <span className="text-xs font-semibold">計算・リズム</span>
            </button>

            <button
              onClick={() => setActiveTab('timers')}
              className={`py-4 px-2 flex flex-col items-center justify-center gap-1 transition-all duration-200 tap-highlight-transparent ${
                activeTab === 'timers'
                  ? 'bg-gradient-to-t from-mint-100 to-white text-mint-600 border-t-4 border-mint-500'
                  : 'text-gray-500 hover:bg-greige-100'
              }`}
            >
              <Clock className="w-6 h-6" />
              <span className="text-xs font-semibold">タイマー</span>
            </button>

            <button
              onClick={() => setActiveTab('voice')}
              className={`py-4 px-2 flex flex-col items-center justify-center gap-1 transition-all duration-200 tap-highlight-transparent ${
                activeTab === 'voice'
                  ? 'bg-gradient-to-t from-sakura-100 to-white text-sakura-600 border-t-4 border-sakura-400'
                  : 'text-gray-500 hover:bg-greige-100'
              }`}
            >
              <Mic className="w-6 h-6" />
              <span className="text-xs font-semibold">音声メモ</span>
            </button>
          </div>
        </div>
      </nav>
    </main>
  )
}
