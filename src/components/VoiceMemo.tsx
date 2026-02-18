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
  abort: () => void
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
  const isStoppingRef = useRef(false)
  const currentTextRef = useRef('')

  // Keep ref in sync with state for use in callbacks
  useEffect(() => {
    currentTextRef.current = currentText
  }, [currentText])

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

  const saveCurrentMemo = useCallback((text: string, currentMemos: Memo[]) => {
    const finalText = text.trim()
    if (finalText) {
      const newMemo: Memo = {
        id: Date.now().toString(),
        text: finalText,
        createdAt: Date.now(),
      }
      const updated = [newMemo, ...currentMemos].slice(0, MAX_MEMOS)
      saveMemos(updated)
      if (onToast) {
        onToast('音声メモを保存しました')
      }
    }
  }, [saveMemos, onToast])

  const startRecording = useCallback(() => {
    const win = window as WindowWithSpeech
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition
    if (!SpeechRecognitionClass) return

    isStoppingRef.current = false

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
      // On error, clean up
      isStoppingRef.current = true
      recognitionRef.current = null
      setIsRecording(false)
    }

    recognition.onend = () => {
      // Only auto-restart if NOT intentionally stopping
      if (!isStoppingRef.current && recognitionRef.current) {
        try {
          recognitionRef.current.start()
        } catch {
          // Failed to restart — clean up
          recognitionRef.current = null
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
    // Set stopping flag FIRST to prevent onend from restarting
    isStoppingRef.current = true

    if (recognitionRef.current) {
      const ref = recognitionRef.current
      recognitionRef.current = null
      try {
        ref.abort() // Use abort() instead of stop() for immediate halt
      } catch {
        // Ignore errors during abort
      }
    }

    setIsRecording(false)

    // Save memo using ref to get latest text
    saveCurrentMemo(currentTextRef.current, memos)
    setCurrentText('')
    setInterimText('')
  }, [memos, saveCurrentMemo])

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
      <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
        <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2 mb-3">
          <Mic className="w-5 h-5 text-sakura-400" />
          音声メモ
        </h3>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <p>お使いのブラウザは Web Speech API に対応していません。</p>
          <p className="mt-1">Google Chrome の最新版をご利用ください。</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Recording Card */}
      <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 space-y-4">
        <div>
          <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <Mic className="w-5 h-5 text-sakura-400" />
            音声入力
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            話した内容をリアルタイムでテキスト化
          </p>
        </div>

        {/* Live Transcript Area */}
        <div className={`min-h-[100px] rounded-xl p-4 border-2 transition-colors ${
          isRecording
            ? 'bg-red-50/50 border-red-200'
            : 'bg-gray-50 border-gray-100'
        }`}>
          {isRecording ? (
            <div className="space-y-1">
              {currentText && (
                <p className="text-gray-800 text-sm leading-relaxed">{currentText}</p>
              )}
              {interimText && (
                <p className="text-sakura-400 text-sm leading-relaxed">{interimText}</p>
              )}
              {!currentText && !interimText && (
                <p className="text-gray-400 text-xs text-center pt-6">マイクに向かって話してください...</p>
              )}
            </div>
          ) : (
            <p className="text-gray-400 text-xs text-center pt-6">
              録音ボタンを押して開始
            </p>
          )}
        </div>

        {/* Control Button — pulsing red when recording */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-full py-3.5 px-6 rounded-2xl font-semibold text-white transition-all duration-200 tap-highlight-transparent active:scale-[0.98] transform flex items-center justify-center gap-2 text-sm ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 animate-recording-pulse'
              : 'bg-gradient-to-r from-sakura-400 to-sakura-500 hover:from-sakura-500 hover:to-sakura-600 shadow-sm'
          }`}
        >
          {isRecording ? (
            <>
              <MicOff className="w-5 h-5" />
              <span className="whitespace-nowrap">録音を停止して保存</span>
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              <span className="whitespace-nowrap">録音開始</span>
            </>
          )}
        </button>
      </div>

      {/* Saved Memos List */}
      <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-mint-500" />
            保存済みメモ
          </h3>
          <span className="text-xs text-gray-400">{memos.length} 件</span>
        </div>

        {memos.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-gray-400">保存されたメモはありません</p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[400px] overflow-y-auto">
            {memos.map((memo) => (
              <div
                key={memo.id}
                className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 space-y-2"
              >
                <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                  {memo.text}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">
                    {formatDate(memo.createdAt)}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => copyToClipboard(memo.text)}
                      className="px-2.5 py-1 text-[11px] font-medium bg-sakura-50 text-sakura-600 hover:bg-sakura-100 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span className="whitespace-nowrap">コピー</span>
                    </button>
                    <button
                      onClick={() => deleteMemo(memo.id)}
                      className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
