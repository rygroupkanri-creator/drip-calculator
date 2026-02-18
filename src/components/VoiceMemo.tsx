'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Mic, MicOff, Copy, Trash2, FileText, Pencil, Check, AlertTriangle, AlertCircle } from 'lucide-react'

// --- Data types ---

type Priority = 'normal' | 'important' | 'urgent'

interface Memo {
  id: string
  text: string
  timestamp: string   // e.g. "2026/02/18 11:30"
  priority: Priority
}

// Migration: old format
interface LegacyMemo {
  id: string
  text: string
  createdAt: number
}

const STORAGE_KEY = 'drip-calc-voice-memos'
const MAX_MEMOS = 50

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; border: string; bg: string }> = {
  normal:    { label: '通常', color: 'bg-gray-300',   border: 'border-l-gray-300',   bg: 'bg-gray-50' },
  important: { label: '重要', color: 'bg-amber-400',  border: 'border-l-amber-400',  bg: 'bg-amber-50/40' },
  urgent:    { label: '至急', color: 'bg-red-500',    border: 'border-l-red-500',    bg: 'bg-red-50/40' },
}

// --- Web Speech API types ---

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

// --- Helpers ---

function formatTimestamp(date: Date): string {
  const y = date.getFullYear()
  const mo = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const mi = String(date.getMinutes()).padStart(2, '0')
  return `${y}/${mo}/${d} ${h}:${mi}`
}

function migrateMemo(raw: Memo | LegacyMemo): Memo {
  if ('timestamp' in raw && 'priority' in raw) {
    return raw as Memo
  }
  const legacy = raw as LegacyMemo
  return {
    id: legacy.id,
    text: legacy.text,
    timestamp: formatTimestamp(new Date(legacy.createdAt)),
    priority: 'normal',
  }
}

// --- Component ---

export default function VoiceMemo({ onToast }: VoiceMemoProps) {
  const [memos, setMemos] = useState<Memo[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [currentText, setCurrentText] = useState('')
  const [interimText, setInterimText] = useState('')
  const [isSupported, setIsSupported] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [recordingStartTime, setRecordingStartTime] = useState<Date | null>(null)

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const isStoppingRef = useRef(false)
  const currentTextRef = useRef('')
  const memosRef = useRef<Memo[]>(memos)
  const recordingStartRef = useRef<Date | null>(null)

  // Keep refs in sync
  useEffect(() => { currentTextRef.current = currentText }, [currentText])
  useEffect(() => { memosRef.current = memos }, [memos])
  useEffect(() => { recordingStartRef.current = recordingStartTime }, [recordingStartTime])

  // Load memos from localStorage (with migration) + recover draft
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as (Memo | LegacyMemo)[]
        const migrated = parsed.map(migrateMemo)
        setMemos(migrated)
      }
      // Recover any unsaved draft from a previous session
      const draft = localStorage.getItem('drip-calc-voice-draft')
      if (draft && draft.trim()) {
        const newMemo: Memo = {
          id: Date.now().toString(),
          text: draft.trim(),
          timestamp: formatTimestamp(new Date()),
          priority: 'normal',
        }
        setMemos((prev) => {
          const updated = [newMemo, ...prev].slice(0, MAX_MEMOS)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
          return updated
        })
        localStorage.removeItem('drip-calc-voice-draft')
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

  const persistMemos = useCallback((updated: Memo[]) => {
    setMemos(updated)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch (e) {
      console.error('Failed to save memos:', e)
    }
  }, [])

  // --- Recording ---

  const startRecording = useCallback(() => {
    const win = window as WindowWithSpeech
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition
    if (!SpeechRecognitionClass) return

    isStoppingRef.current = false
    const now = new Date()
    setRecordingStartTime(now)

    const recognition = new SpeechRecognitionClass()
    recognition.lang = 'ja-JP'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ''
      let finalStr = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalStr += transcript
        } else {
          interim += transcript
        }
      }
      if (finalStr) {
        setCurrentText((prev) => {
          const newText = prev + finalStr
          // Also update ref immediately for reliable access
          currentTextRef.current = newText
          // Auto-save draft to localStorage on every final result
          try {
            localStorage.setItem('drip-calc-voice-draft', newText)
          } catch { /* ignore */ }
          return newText
        })
      }
      setInterimText(interim)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error)
      if (event.error === 'not-allowed') {
        alert('マイクへのアクセスが拒否されました。ブラウザ設定でマイクの使用を許可してください。')
      }
      isStoppingRef.current = true
      recognitionRef.current = null
      setIsRecording(false)
    }

    recognition.onend = () => {
      if (!isStoppingRef.current && recognitionRef.current) {
        // Auto-restart for continuous recording
        try {
          recognitionRef.current.start()
        } catch {
          // Restart failed — save whatever we have
          const text = currentTextRef.current.trim()
          if (text) {
            const ts = recordingStartRef.current
              ? formatTimestamp(recordingStartRef.current)
              : formatTimestamp(new Date())
            const newMemo: Memo = {
              id: Date.now().toString(),
              text,
              timestamp: ts,
              priority: 'normal',
            }
            const latest = memosRef.current
            const updated = [newMemo, ...latest].slice(0, MAX_MEMOS)
            persistMemos(updated)
          }
          recognitionRef.current = null
          setIsRecording(false)
          setCurrentText('')
          setInterimText('')
          // Clean up draft
          try { localStorage.removeItem('drip-calc-voice-draft') } catch { /* ignore */ }
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
    isStoppingRef.current = true

    if (recognitionRef.current) {
      const ref = recognitionRef.current
      recognitionRef.current = null
      try { ref.abort() } catch { /* ignore */ }
    }

    setIsRecording(false)

    // Use refs to get the absolute latest values (avoids stale closure)
    const text = currentTextRef.current.trim()
    if (text) {
      const ts = recordingStartRef.current
        ? formatTimestamp(recordingStartRef.current)
        : formatTimestamp(new Date())
      const newMemo: Memo = {
        id: Date.now().toString(),
        text,
        timestamp: ts,
        priority: 'normal',
      }
      const latest = memosRef.current
      const updated = [newMemo, ...latest].slice(0, MAX_MEMOS)
      persistMemos(updated)
      if (onToast) {
        onToast('音声メモを保存しました')
      }
    }

    setCurrentText('')
    setInterimText('')
    setRecordingStartTime(null)
    // Clean up draft
    try { localStorage.removeItem('drip-calc-voice-draft') } catch { /* ignore */ }
  }, [persistMemos, onToast])

  // --- Memo actions ---

  const deleteMemo = useCallback((id: string) => {
    const updated = memosRef.current.filter((m) => m.id !== id)
    persistMemos(updated)
  }, [persistMemos])

  const updatePriority = useCallback((id: string, priority: Priority) => {
    const updated = memosRef.current.map((m) =>
      m.id === id ? { ...m, priority } : m
    )
    persistMemos(updated)
  }, [persistMemos])

  const startEdit = useCallback((memo: Memo) => {
    setEditingId(memo.id)
    setEditText(memo.text)
  }, [])

  const saveEdit = useCallback(() => {
    if (!editingId) return
    const trimmed = editText.trim()
    if (!trimmed) return
    const updated = memosRef.current.map((m) =>
      m.id === editingId ? { ...m, text: trimmed } : m
    )
    persistMemos(updated)
    setEditingId(null)
    setEditText('')
    if (onToast) onToast('メモを更新しました')
  }, [editingId, editText, persistMemos, onToast])

  const cancelEdit = useCallback(() => {
    setEditingId(null)
    setEditText('')
  }, [])

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      if (onToast) onToast('クリップボードにコピーしました')
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      if (onToast) onToast('クリップボードにコピーしました')
    }
  }, [onToast])

  // --- Render ---

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

        {/* Live Transcript */}
        <div className={`min-h-[100px] rounded-xl p-4 border-2 transition-colors ${
          isRecording ? 'bg-red-50/50 border-red-200' : 'bg-gray-50 border-gray-100'
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

        {/* Record / Stop Button */}
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
          <span className="text-xs text-gray-400">{memos.length}/{MAX_MEMOS} 件</span>
        </div>

        {memos.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-gray-400">保存されたメモはありません</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[450px] overflow-y-auto">
            {memos.map((memo) => {
              const pCfg = PRIORITY_CONFIG[memo.priority]
              const isEditing = editingId === memo.id

              return (
                <div
                  key={memo.id}
                  className={`rounded-xl border border-gray-100 overflow-hidden flex ${pCfg.bg}`}
                >
                  {/* Left priority indicator */}
                  <div className={`w-1 shrink-0 ${pCfg.color}`} />

                  {/* Content */}
                  <div className="flex-1 p-3 min-w-0 space-y-2">
                    {/* Text / Edit area */}
                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={3}
                          className="w-full text-sm text-gray-800 leading-relaxed p-2 border border-gray-200 rounded-lg focus:border-sakura-400 focus:ring-1 focus:ring-sakura-100 outline-none resize-none bg-white"
                          autoFocus
                        />
                        <div className="flex gap-1.5 justify-end">
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1 text-[11px] text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            キャンセル
                          </button>
                          <button
                            onClick={saveEdit}
                            className="px-3 py-1 text-[11px] font-medium bg-mint-400 text-white hover:bg-mint-500 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            保存
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                        {memo.text}
                      </p>
                    )}

                    {/* Bottom row: timestamp + priority + actions */}
                    {!isEditing && (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[10px] text-gray-400 whitespace-nowrap tabular-nums">
                            {memo.timestamp}
                          </span>
                          {/* Priority selector */}
                          <div className="flex gap-0.5">
                            <button
                              onClick={() => updatePriority(memo.id, 'normal')}
                              className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                                memo.priority === 'normal'
                                  ? 'bg-gray-300 text-white'
                                  : 'text-gray-300 hover:bg-gray-100'
                              }`}
                              title="通常"
                            >
                              <span className="text-[9px] font-bold">N</span>
                            </button>
                            <button
                              onClick={() => updatePriority(memo.id, 'important')}
                              className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                                memo.priority === 'important'
                                  ? 'bg-amber-400 text-white'
                                  : 'text-amber-300 hover:bg-amber-50'
                              }`}
                              title="重要"
                            >
                              <AlertTriangle className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => updatePriority(memo.id, 'urgent')}
                              className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                                memo.priority === 'urgent'
                                  ? 'bg-red-500 text-white'
                                  : 'text-red-300 hover:bg-red-50'
                              }`}
                              title="至急"
                            >
                              <AlertCircle className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-0.5 shrink-0">
                          <button
                            onClick={() => startEdit(memo)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="編集"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => copyToClipboard(memo.text)}
                            className="p-1.5 text-gray-400 hover:text-sakura-600 hover:bg-sakura-50 rounded-lg transition-colors"
                            title="コピー"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteMemo(memo.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="削除"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
