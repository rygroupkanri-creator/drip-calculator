'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Mic, MicOff, Copy, Trash2, FileText } from 'lucide-react'

interface Memo {
  id: string
  text: string
  createdAt: number
}

const STORAGE_KEY = 'drip-calc-voice-memos'
const MAX_MEMOS = 30

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance
}

interface WindowWithSpeech extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor
  webkitSpeechRecognition?: SpeechRecognitionConstructor
}

interface VoiceMemoProps {
  onToast?: (message: string, subMessage?: string) => void
}

export default function VoiceMemo({ onToast }: VoiceMemoProps) {
  const [memos, setMemos] = useState<Memo[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [currentText, setCurrentText] = useState('')
  const [interimText, setInterimText] = useState('')
  const [isSupported, setIsSupported] = useState(true)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)

  // Load memos from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setMemos(JSON.parse(saved))
      }
    } catch (e) {
      console.error('Failed to load memos:', e)
    }
  }, [])

  // Check browser support
  useEffect(() => {
    const win = window as WindowWithSpeech
    if (!win.SpeechRecognition && !win.webkitSpeechRecognition) {
      setIsSupported(false)
    }
  }, [])

  const saveMemos = useCallback((updated: Memo[]) => {
    setMemos(updated)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch (e) {
      console.error('Failed to save memos:', e)
    }
  }, [])

  const startRecording = useCallback(() => {
    const win = window as WindowWithSpeech
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition
    if (!SpeechRecognitionClass) return

    const recognition = new SpeechRecognitionClass()
    recognition.lang = 'ja-JP'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          final += transcript
        } else {
          interim += transcript
        }
      }
      if (final) {
        setCurrentText((prev) => prev + final)
      }
      setInterimText(interim)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error)
      if (event.error === 'not-allowed') {
        alert('マイクへのアクセスが拒否されました。ブラウザ設定でマイクの使用を許可してください。')
      }
      setIsRecording(false)
    }

    recognition.onend = () => {
      // Auto restart if still recording (browser sometimes stops)
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start()
        } catch {
          setIsRecording(false)
        }
      }
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsRecording(true)
    setCurrentText('')
    setInterimText('')
  }, [])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      const ref = recognitionRef.current
      recognitionRef.current = null // Prevent auto-restart
      ref.stop()
    }
    setIsRecording(false)

    // Save memo if there's text
    const finalText = currentText.trim()
    if (finalText) {
      const newMemo: Memo = {
        id: Date.now().toString(),
        text: finalText,
        createdAt: Date.now(),
      }
      const updated = [newMemo, ...memos].slice(0, MAX_MEMOS)
      saveMemos(updated)
      if (onToast) {
        onToast('音声メモを保存しました')
      }
    }
    setCurrentText('')
    setInterimText('')
  }, [currentText, memos, saveMemos, onToast])

  const deleteMemo = useCallback((id: string) => {
    const updated = memos.filter((m) => m.id !== id)
    saveMemos(updated)
  }, [memos, saveMemos])

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      if (onToast) {
        onToast('クリップボードにコピーしました')
      }
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      if (onToast) {
        onToast('クリップボードにコピーしました')
      }
    }
  }, [onToast])

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp)
    const month = d.getMonth() + 1
    const day = d.getDate()
    const hours = d.getHours().toString().padStart(2, '0')
    const minutes = d.getMinutes().toString().padStart(2, '0')
    return `${month}/${day} ${hours}:${minutes}`
  }

  if (!isSupported) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Mic className="w-5 h-5 text-sakura-400" />
          音声メモ
        </h3>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
          <p>お使いのブラウザは Web Speech API に対応していません。</p>
          <p className="mt-1">Google Chrome の最新版をご利用ください。</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Recording Card */}
      <div className="bg-white rounded-3xl shadow-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Mic className="w-5 h-5 text-sakura-400" />
          音声メモ
        </h3>
        <p className="text-sm text-gray-500">
          話した内容をリアルタイムでテキスト化します
        </p>

        {/* Live Transcript Area */}
        <div className={`min-h-[120px] rounded-2xl p-4 border-2 transition-colors ${
          isRecording
            ? 'bg-sakura-50 border-sakura-300'
            : 'bg-greige-50 border-greige-300'
        }`}>
          {isRecording ? (
            <div className="space-y-1">
              {currentText && (
                <p className="text-gray-800 leading-relaxed">{currentText}</p>
              )}
              {interimText && (
                <p className="text-sakura-400 leading-relaxed">{interimText}</p>
              )}
              {!currentText && !interimText && (
                <p className="text-gray-400 text-sm">マイクに向かって話してください...</p>
              )}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center pt-8">
              「録音開始」ボタンを押してください
            </p>
          )}
        </div>

        {/* Recording Indicator */}
        {isRecording && (
          <div className="flex items-center justify-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-medium text-red-600">録音中...</span>
          </div>
        )}

        {/* Control Buttons */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-full py-4 px-6 rounded-3xl font-semibold text-white transition-all duration-200 tap-highlight-transparent active:scale-95 transform flex items-center justify-center gap-2 shadow-lg ${
            isRecording
              ? 'bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600'
              : 'bg-gradient-to-r from-sakura-400 to-sakura-500 hover:from-sakura-500 hover:to-sakura-600'
          }`}
        >
          {isRecording ? (
            <>
              <MicOff className="w-5 h-5" />
              録音を停止して保存
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              録音開始
            </>
          )}
        </button>
      </div>

      {/* Saved Memos List */}
      <div className="bg-white rounded-3xl shadow-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-mint-500" />
            保存済みメモ
          </h3>
          <span className="text-xs text-gray-500">{memos.length} 件</span>
        </div>

        {memos.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">保存されたメモはありません</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {memos.map((memo) => (
              <div
                key={memo.id}
                className="bg-greige-100 border-2 border-greige-300 rounded-2xl p-4 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-gray-800 text-sm leading-relaxed flex-1 whitespace-pre-wrap">
                    {memo.text}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {formatDate(memo.createdAt)}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => copyToClipboard(memo.text)}
                      className="px-3 py-1.5 text-xs font-medium bg-sakura-100 text-sakura-700 hover:bg-sakura-200 rounded-xl transition-colors flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      コピー
                    </button>
                    <button
                      onClick={() => deleteMemo(memo.id)}
                      className="p-1.5 text-red-500 hover:bg-red-100 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
