'use client'

import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import { Clock, Bell, Plus, Trash2, X } from 'lucide-react'

interface Timer {
  id: string
  name: string
  endTime: number  // timestamp
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

  const loadTimers = useCallback(() => {
    try {
      const saved = localStorage.getItem('drip-calc-timers')
      if (saved) {
        const loadedTimers: Timer[] = JSON.parse(saved)
        // Filter out expired timers
        const activeTimers = loadedTimers.filter((t) => t.endTime > Date.now())
        setTimers(activeTimers)
      }
    } catch (error) {
      console.error('Failed to load timers:', error)
    }
  }, [])

  const saveTimers = useCallback((timers: Timer[]) => {
    try {
      localStorage.setItem('drip-calc-timers', JSON.stringify(timers))
    } catch (error) {
      console.error('Failed to save timers:', error)
    }
  }, [])

  const checkTimers = useCallback(() => {
    const now = Date.now()
    let updated = false

    const updatedTimers = timers.map((timer) => {
      const timeLeft = timer.endTime - now
      const fiveMinutes = 5 * 60 * 1000

      // Notify 5 minutes before
      if (!timer.notified5min && timeLeft <= fiveMinutes && timeLeft > 0) {
        if (Notification.permission === 'granted') {
          new Notification(`${timer.name} まもなく終了`, {
            body: `あと約5分で点滴が終了します（${timer.volume}mL）`,
            icon: '/icon-192.png',
            tag: `timer-${timer.id}-5min`,
          })
        }
        updated = true
        return { ...timer, notified5min: true }
      }

      // Notify at completion
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

    // Remove expired timers
    const activeTimers = updatedTimers.filter((t) => t.endTime > now)

    if (updated || activeTimers.length !== timers.length) {
      setTimers(activeTimers)
      saveTimers(activeTimers)
    }
  }, [timers, saveTimers])

  useEffect(() => {
    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
    }

    // Load timers from localStorage
    loadTimers()

    // Set up interval to check timers
    const interval = setInterval(() => {
      checkTimers()
    }, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [loadTimers, checkTimers])

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('お使いのブラウザは通知機能に対応していません')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    const permission = await Notification.requestPermission()
    setNotificationPermission(permission)

    if (permission === 'granted') {
      // Test notification
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

    const minutes = parseInt(newTimerMinutes)
    if (isNaN(minutes) || minutes <= 0) {
      alert('正しい時間を入力してください')
      return
    }

    if (timers.length >= MAX_TIMERS) {
      alert(`タイマーは最大${MAX_TIMERS}個までです。不要なタイマーを削除してください。`)
      return
    }

    // Request notification permission if not granted
    if (Notification.permission !== 'granted') {
      const granted = await requestNotificationPermission()
      if (!granted) {
        console.log('Notification permission denied, but creating timer anyway')
      }
    }

    const newTimer: Timer = {
      id: Date.now().toString(),
      name: newTimerName.trim(),
      endTime: Date.now() + minutes * 60 * 1000,
      volume: newTimerVolume,
      notified5min: false,
    }

    const updatedTimers = [...timers, newTimer]
    setTimers(updatedTimers)
    saveTimers(updatedTimers)

    console.log('Timer added successfully:', newTimer)

    setNewTimerName('')
    setNewTimerVolume('')
    setNewTimerMinutes('')
    setIsAddingTimer(false)

    const endTimeStr = new Date(newTimer.endTime).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
    if (onToast) {
      onToast(`タイマー「${newTimer.name}」を登録しました`, `終了予定: ${endTimeStr}`)
    }
  }

  // Function to add timer from calculation (exposed via ref)
  const addTimerFromCalculation = useCallback(async (volume: string, totalMinutes: number, name?: string): Promise<string | null> => {
    try {
      if (timers.length >= MAX_TIMERS) {
        alert(`タイマーは最大${MAX_TIMERS}個までです。不要なタイマーを削除してください。`)
        return null
      }

      // Request notification permission if not granted
      if (Notification.permission !== 'granted') {
        const granted = await requestNotificationPermission()
        if (!granted) {
          console.log('Notification permission denied, but creating timer anyway')
        }
      }

      const timerName = name || `点滴 ${volume}mL (${totalMinutes}分)`
      const newTimer: Timer = {
        id: Date.now().toString(),
        name: timerName,
        endTime: Date.now() + totalMinutes * 60 * 1000,
        volume: volume,
        notified5min: false,
      }

      const updatedTimers = [...timers, newTimer]
      setTimers(updatedTimers)
      saveTimers(updatedTimers)

      console.log('Timer created from calculation:', newTimer)
      const endTimeStr = new Date(newTimer.endTime).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
      return endTimeStr
    } catch (error) {
      console.error('Failed to create timer:', error)
      alert('タイマーの作成に失敗しました')
      return null
    }
  }, [timers, saveTimers])

  // Expose addTimerFromCalculation to parent via ref
  useImperativeHandle(ref, () => ({
    addTimerFromCalculation
  }), [addTimerFromCalculation])

  const deleteTimer = (id: string) => {
    const updatedTimers = timers.filter((t) => t.id !== id)
    setTimers(updatedTimers)
    saveTimers(updatedTimers)
  }

  const formatTimeLeft = (endTime: number) => {
    const now = Date.now()
    const diff = endTime - now

    if (diff <= 0) return '終了'

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `残り ${hours}時間${minutes}分`
    }
    return `残り ${minutes}分`
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Clock className="w-5 h-5 text-mint-500" />
          マルチタイマー
        </h3>
        <div className="flex items-center gap-2">
          {notificationPermission !== 'granted' && (
            <button
              onClick={requestNotificationPermission}
              className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full hover:bg-amber-200 transition-colors flex items-center gap-1"
            >
              <Bell className="w-3 h-3" />
              通知を有効化
            </button>
          )}
          <span className="text-xs text-gray-500">{timers.length}/{MAX_TIMERS} 件実行中</span>
        </div>
      </div>

      {timers.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {timers.map((timer) => (
            <div
              key={timer.id}
              className="bg-mint-50 border-2 border-mint-200 rounded-2xl p-3 flex items-center justify-between"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-800">{timer.name}</p>
                <p className="text-sm text-gray-600">
                  {timer.volume}mL · {formatTimeLeft(timer.endTime)}
                </p>
              </div>
              <button
                onClick={() => deleteTimer(timer.id)}
                className="p-2 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setIsAddingTimer(true)}
        disabled={timers.length >= MAX_TIMERS}
        className={`w-full font-medium py-3 px-4 rounded-2xl transition-all tap-highlight-transparent active:scale-95 transform flex items-center justify-center gap-2 ${
          timers.length >= MAX_TIMERS
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-mint-300 hover:bg-mint-400 text-mint-800'
        }`}
      >
        <Plus className="w-5 h-5" />
        {timers.length >= MAX_TIMERS ? `上限${MAX_TIMERS}件に達しています` : '新しいタイマーを追加'}
      </button>

      {/* Add Timer Modal */}
      {isAddingTimer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">タイマーを追加</h3>
              <button
                onClick={() => {
                  setIsAddingTimer(false)
                  setNewTimerName('')
                  setNewTimerVolume('')
                  setNewTimerMinutes('')
                }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  タイマー名
                </label>
                <input
                  type="text"
                  value={newTimerName}
                  onChange={(e) => setNewTimerName(e.target.value)}
                  placeholder="例: ベッド3 田中様"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:border-mint-400 focus:ring-4 focus:ring-mint-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  輸液量 (mL)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={newTimerVolume}
                  onChange={(e) => setNewTimerVolume(e.target.value)}
                  placeholder="500"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:border-mint-400 focus:ring-4 focus:ring-mint-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  終了までの時間 (分)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={newTimerMinutes}
                  onChange={(e) => setNewTimerMinutes(e.target.value)}
                  placeholder="60"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:border-mint-400 focus:ring-4 focus:ring-mint-100 outline-none transition-all"
                />
              </div>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-xl text-sm text-amber-900">
              <p>
                <strong>通知:</strong> 終了5分前と終了時に通知が届きます
              </p>
            </div>

            <button
              onClick={addTimer}
              className="w-full bg-mint-500 hover:bg-mint-600 text-white font-semibold py-3 px-6 rounded-2xl transition-colors tap-highlight-transparent active:scale-95 transform"
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
