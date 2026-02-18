'use client'

import { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react'
import { Clock, Bell, Plus, Trash2, X } from 'lucide-react'

interface Timer {
  id: string
  name: string
  startTime: number
  endTime: number
  volume: string
  notified5min: boolean
}

const MAX_TIMERS = 7

export interface MultiTimerRef {
  addTimerFromCalculation: (volume: string, totalMinutes: number, name?: string) => Promise<string | null>
}

interface MultiTimerProps {
  onToast?: (message: string, subMessage?: string) => void
}

const MultiTimer = forwardRef<MultiTimerRef, MultiTimerProps>(({ onToast }, ref) => {
  const [timers, setTimers] = useState<Timer[]>([])
  const [isAddingTimer, setIsAddingTimer] = useState(false)
  const [newTimerName, setNewTimerName] = useState('')
  const [newTimerVolume, setNewTimerVolume] = useState('')
  const [newTimerMinutes, setNewTimerMinutes] = useState('')
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')
  const [, setTick] = useState(0) // Force re-render for countdown

  const timersRef = useRef<Timer[]>(timers)
  useEffect(() => {
    timersRef.current = timers
  }, [timers])

  const saveTimersToStorage = useCallback((t: Timer[]) => {
    try {
      localStorage.setItem('drip-calc-timers', JSON.stringify(t))
    } catch (error) {
      console.error('Failed to save timers:', error)
    }
  }, [])

  const loadTimers = useCallback(() => {
    try {
      const saved = localStorage.getItem('drip-calc-timers')
      if (saved) {
        const loaded: Timer[] = JSON.parse(saved)
        // Migration: add startTime for old timers that don't have it
        const active = loaded
          .filter((t) => t.endTime > Date.now())
          .map((t) => ({
            ...t,
            startTime: t.startTime || (t.endTime - 60 * 60 * 1000),
          }))
        setTimers(active)
      }
    } catch (error) {
      console.error('Failed to load timers:', error)
    }
  }, [])

  // Real-time countdown tick (every 1 second)
  useEffect(() => {
    const tickInterval = setInterval(() => {
      setTick((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(tickInterval)
  }, [])

  // Check timers for notifications (every 10 seconds)
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
    }
    loadTimers()

    const interval = setInterval(() => {
      setTimers((prev) => {
        const now = Date.now()
        let changed = false
        const updated = prev.map((timer) => {
          const timeLeft = timer.endTime - now
          const fiveMin = 5 * 60 * 1000

          if (!timer.notified5min && timeLeft <= fiveMin && timeLeft > 0) {
            if (Notification.permission === 'granted') {
              new Notification(`${timer.name} まもなく終了`, {
                body: `あと約5分で点滴が終了します（${timer.volume}mL）`,
                icon: '/icon-192.png',
                tag: `timer-${timer.id}-5min`,
              })
            }
            changed = true
            return { ...timer, notified5min: true }
          }
          if (timeLeft <= 0 && timer.notified5min) {
            if (Notification.permission === 'granted') {
              new Notification(`${timer.name} 終了`, {
                body: `点滴が終了しました（${timer.volume}mL）`,
                icon: '/icon-192.png',
                tag: `timer-${timer.id}-done`,
                requireInteraction: true,
              })
            }
          }
          return timer
        })

        const active = updated.filter((t) => t.endTime > now)
        if (changed || active.length !== prev.length) {
          saveTimersToStorage(active)
          return active
        }
        return prev
      })
    }, 10000)

    return () => clearInterval(interval)
  }, [loadTimers, saveTimersToStorage])

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('お使いのブラウザは通知機能に対応していません')
      return false
    }
    if (Notification.permission === 'granted') return true

    const permission = await Notification.requestPermission()
    setNotificationPermission(permission)
    if (permission === 'granted') {
      new Notification('通知が有効になりました', {
        body: '点滴終了5分前にお知らせします',
        icon: '/icon-192.png',
      })
      return true
    } else {
      alert('通知を有効にするには、ブラウザの設定を変更してください')
      return false
    }
  }

  const addTimer = async () => {
    if (!newTimerName.trim() || !newTimerVolume || !newTimerMinutes) {
      alert('すべての項目を入力してください')
      return
    }
    const mins = parseInt(newTimerMinutes)
    if (isNaN(mins) || mins <= 0) {
      alert('正しい時間を入力してください')
      return
    }
    if (timers.length >= MAX_TIMERS) {
      alert(`タイマーは最大${MAX_TIMERS}個までです。不要なタイマーを削除してください。`)
      return
    }

    if (Notification.permission !== 'granted') {
      await requestNotificationPermission()
    }

    const now = Date.now()
    const newTimer: Timer = {
      id: now.toString(),
      name: newTimerName.trim(),
      startTime: now,
      endTime: now + mins * 60 * 1000,
      volume: newTimerVolume,
      notified5min: false,
    }

    const updated = [...timers, newTimer]
    setTimers(updated)
    saveTimersToStorage(updated)

    setNewTimerName('')
    setNewTimerVolume('')
    setNewTimerMinutes('')
    setIsAddingTimer(false)

    const endTimeStr = new Date(newTimer.endTime).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
    if (onToast) {
      onToast(`タイマー「${newTimer.name}」を登録しました`, `終了予定: ${endTimeStr}`)
    }
  }

  const addTimerFromCalculation = useCallback(async (
    volume: string,
    totalMinutes: number,
    name?: string
  ): Promise<string | null> => {
    try {
      const current = timersRef.current
      if (current.length >= MAX_TIMERS) {
        alert(`タイマーは最大${MAX_TIMERS}個までです。不要なタイマーを削除してください。`)
        return null
      }

      if (Notification.permission !== 'granted') {
        await requestNotificationPermission()
      }

      const now = Date.now()
      const timerName = name || `点滴 ${volume}mL (${totalMinutes}分)`
      const newTimer: Timer = {
        id: now.toString(),
        name: timerName,
        startTime: now,
        endTime: now + totalMinutes * 60 * 1000,
        volume,
        notified5min: false,
      }

      const updated = [...current, newTimer]
      setTimers(updated)
      saveTimersToStorage(updated)

      const endTimeStr = new Date(newTimer.endTime).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
      return endTimeStr
    } catch (error) {
      console.error('Failed to create timer:', error)
      return null
    }
  }, [saveTimersToStorage])

  useImperativeHandle(ref, () => ({
    addTimerFromCalculation,
  }), [addTimerFromCalculation])

  const deleteTimer = (id: string) => {
    const updated = timers.filter((t) => t.id !== id)
    setTimers(updated)
    saveTimersToStorage(updated)
  }

  const getProgress = (timer: Timer) => {
    const total = timer.endTime - timer.startTime
    const elapsed = Date.now() - timer.startTime
    return Math.min(Math.max(elapsed / total, 0), 1)
  }

  const formatEndTime = (endTime: number) => {
    return new Date(endTime).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
  }

  const formatCountdown = (endTime: number) => {
    const diff = endTime - Date.now()
    if (diff <= 0) return '終了'
    const h = Math.floor(diff / (1000 * 60 * 60))
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const s = Math.floor((diff % (1000 * 60)) / 1000)
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-3">
      {timers.length > 0 && (
        <div className="space-y-3">
          {timers.map((timer) => {
            const progress = getProgress(timer)
            const isNearEnd = progress > 0.9
            return (
              <div
                key={timer.id}
                className={`bg-white rounded-2xl shadow-sm border p-4 transition-colors ${
                  isNearEnd ? 'border-red-200 bg-red-50/30' : 'border-gray-100'
                }`}
              >
                {/* Top row: name + delete */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{timer.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{timer.volume}mL</p>
                  </div>
                  <button
                    onClick={() => deleteTimer(timer.id)}
                    className="p-1.5 -mr-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* End time — prominent display */}
                <div className="flex items-baseline justify-between mb-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-gray-800 tabular-nums">
                      {formatEndTime(timer.endTime)}
                    </span>
                    <span className="text-xs text-gray-500">終了</span>
                  </div>
                  <span className={`text-sm font-mono tabular-nums ${
                    isNearEnd ? 'text-red-500 font-semibold' : 'text-gray-500'
                  }`}>
                    残 {formatCountdown(timer.endTime)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                      isNearEnd
                        ? 'bg-gradient-to-r from-red-400 to-red-500'
                        : 'bg-gradient-to-r from-mint-400 to-mint-500'
                    }`}
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {timers.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 text-center py-10">
          <Clock className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p className="text-sm text-gray-400">タイマーはまだ登録されていません</p>
        </div>
      )}

      {/* Notification banner */}
      {notificationPermission !== 'granted' && (
        <button
          onClick={requestNotificationPermission}
          className="w-full text-sm bg-amber-50 text-amber-700 px-4 py-2.5 rounded-xl hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
        >
          <Bell className="w-4 h-4" />
          <span className="whitespace-nowrap">通知を有効にする（終了5分前にお知らせ）</span>
        </button>
      )}

      {/* Add timer button */}
      <button
        onClick={() => setIsAddingTimer(true)}
        disabled={timers.length >= MAX_TIMERS}
        className={`w-full font-medium py-3 px-4 rounded-2xl transition-all tap-highlight-transparent active:scale-[0.98] transform flex items-center justify-center gap-2 text-sm ${
          timers.length >= MAX_TIMERS
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-mint-300 hover:bg-mint-400 text-mint-800'
        }`}
      >
        <Plus className="w-4 h-4" />
        <span className="whitespace-nowrap">
          {timers.length >= MAX_TIMERS ? `上限${MAX_TIMERS}件に達しています` : '手動でタイマーを追加'}
        </span>
      </button>

      <p className="text-center text-xs text-gray-400">{timers.length}/{MAX_TIMERS} 件</p>

      {/* Add Timer Modal */}
      {isAddingTimer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-sm w-full p-5 space-y-4 mb-safe">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">タイマーを追加</h3>
              <button
                onClick={() => {
                  setIsAddingTimer(false)
                  setNewTimerName('')
                  setNewTimerVolume('')
                  setNewTimerMinutes('')
                }}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">タイマー名</label>
                <input
                  type="text"
                  value={newTimerName}
                  onChange={(e) => setNewTimerName(e.target.value)}
                  placeholder="例: ベッド3 田中様"
                  className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">輸液量 (mL)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={newTimerVolume}
                    onChange={(e) => setNewTimerVolume(e.target.value)}
                    placeholder="500"
                    className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">時間 (分)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={newTimerMinutes}
                    onChange={(e) => setNewTimerMinutes(e.target.value)}
                    placeholder="60"
                    className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={addTimer}
              className="w-full bg-mint-500 hover:bg-mint-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors tap-highlight-transparent active:scale-[0.98] transform text-sm"
            >
              タイマーを開始
            </button>
          </div>
        </div>
      )}
    </div>
  )
})

MultiTimer.displayName = 'MultiTimer'

export default MultiTimer
