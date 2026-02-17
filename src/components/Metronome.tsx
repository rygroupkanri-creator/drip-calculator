'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Volume2, VolumeX, Play, Pause, Vibrate, Clock } from 'lucide-react'

interface MetronomeProps {
  intervalMs: number // Time between beats in milliseconds
  isRunning: boolean
  onToggle: () => void
  onStartTimer?: () => void // Callback to start timer with current calculation
  volume?: string
  totalMinutes?: number
}

export default function Metronome({ intervalMs, isRunning, onToggle, onStartTimer, volume, totalMinutes }: MetronomeProps) {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true)
  const [isVibrationEnabled, setIsVibrationEnabled] = useState(false)
  const [isPulsing, setIsPulsing] = useState(false)
  const [hasVibrationSupport, setHasVibrationSupport] = useState(false)

  const audioContextRef = useRef<AudioContext | null>(null)
  const nextBeatTimeRef = useRef<number>(0)
  const schedulerIdRef = useRef<number | null>(null)

  // Initialize Web Audio Context and check vibration support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      audioContextRef.current = new AudioContextClass()

      // Check if vibration API is supported
      if ('vibrate' in navigator) {
        setHasVibrationSupport(true)
      }
    }
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  // Resume AudioContext on user action (required by browsers)
  const resumeAudioContext = useCallback(async () => {
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      try {
        await audioContextRef.current.resume()
        console.log('AudioContext resumed successfully')
      } catch (error) {
        console.error('Failed to resume AudioContext:', error)
      }
    }
  }, [])

  // Play beat sound using Web Audio API for precision
  const playBeat = useCallback(() => {
    // Play sound
    if (audioContextRef.current && isSoundEnabled) {
      const context = audioContextRef.current

      // Ensure context is running
      if (context.state === 'suspended') {
        context.resume().catch(err => console.error('AudioContext resume error:', err))
      }

      const oscillator = context.createOscillator()
      const gainNode = context.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(context.destination)

      // Short, crisp beep sound (800Hz)
      oscillator.frequency.value = 800
      oscillator.type = 'sine'

      // Quick attack and decay for crisp sound
      gainNode.gain.setValueAtTime(0, context.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.3, context.currentTime + 0.01)
      gainNode.gain.linearRampToValueAtTime(0, context.currentTime + 0.1)

      oscillator.start(context.currentTime)
      oscillator.stop(context.currentTime + 0.1)
    }

    // Vibrate device
    if (isVibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate(50) // Short 50ms vibration
    }
  }, [isSoundEnabled, isVibrationEnabled])

  // Handle toggle with AudioContext resume and initial vibration
  const handleToggle = useCallback(async () => {
    // Resume AudioContext on first user interaction
    await resumeAudioContext()

    // If starting, trigger initial vibration
    if (!isRunning && isVibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate(50)
    }

    onToggle()
  }, [resumeAudioContext, isRunning, isVibrationEnabled, onToggle])

  // Trigger visual pulse
  const triggerPulse = () => {
    setIsPulsing(true)
    setTimeout(() => setIsPulsing(false), 150)
  }

  // High-precision scheduler using requestAnimationFrame
  useEffect(() => {
    if (!isRunning || intervalMs <= 0) {
      if (schedulerIdRef.current) {
        cancelAnimationFrame(schedulerIdRef.current)
        schedulerIdRef.current = null
      }
      return
    }

    const scheduleAheadTime = 0.1 // Schedule 100ms ahead
    nextBeatTimeRef.current = performance.now()

    const scheduler = () => {
      const currentTime = performance.now()

      // Check if it's time for the next beat
      while (nextBeatTimeRef.current <= currentTime + scheduleAheadTime * 1000) {
        const beatTime = nextBeatTimeRef.current

        // Schedule beat at precise time
        setTimeout(() => {
          playBeat()
          triggerPulse()
        }, Math.max(0, beatTime - performance.now()))

        // Calculate next beat time
        nextBeatTimeRef.current += intervalMs
      }

      schedulerIdRef.current = requestAnimationFrame(scheduler)
    }

    schedulerIdRef.current = requestAnimationFrame(scheduler)

    return () => {
      if (schedulerIdRef.current) {
        cancelAnimationFrame(schedulerIdRef.current)
        schedulerIdRef.current = null
      }
    }
  }, [isRunning, intervalMs, playBeat])

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">滴下メトロノーム</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            className={`p-2 rounded-2xl transition-colors tap-highlight-transparent ${
              isSoundEnabled ? 'bg-sakura-100 text-sakura-600' : 'bg-gray-100 text-gray-400'
            }`}
            aria-label={isSoundEnabled ? '音声ガイドをオフ' : '音声ガイドをオン'}
            title="音声"
          >
            {isSoundEnabled ? (
              <Volume2 className="w-5 h-5" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </button>

          {hasVibrationSupport ? (
            <button
              onClick={() => setIsVibrationEnabled(!isVibrationEnabled)}
              className={`p-2 rounded-2xl transition-colors tap-highlight-transparent ${
                isVibrationEnabled ? 'bg-mint-200 text-mint-700' : 'bg-gray-100 text-gray-400'
              }`}
              aria-label={isVibrationEnabled ? 'バイブレーションをオフ' : 'バイブレーションをオン'}
              title="バイブレーション"
            >
              <Vibrate className="w-5 h-5" />
            </button>
          ) : (
            <div className="relative group">
              <button
                className="p-2 rounded-2xl bg-gray-100 text-gray-300 cursor-not-allowed"
                disabled
                title="お使いのブラウザは振動機能に非対応です"
              >
                <Vibrate className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {!hasVibrationSupport && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-800">
          <p>💡 お使いのブラウザは振動機能に非対応です（視覚ガイドをご利用ください）</p>
        </div>
      )}

      {/* Visual Pulse Indicator */}
      <div className="flex items-center justify-center py-8">
        <div className="relative">
          <div
            className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-150 ${
              isPulsing
                ? 'bg-gradient-to-br from-sakura-400 to-sakura-500 scale-110 shadow-xl shadow-sakura-300'
                : 'bg-sakura-100 scale-100'
            }`}
          >
            <div
              className={`w-20 h-20 rounded-full transition-all duration-150 ${
                isPulsing ? 'bg-white shadow-lg' : 'bg-sakura-200'
              }`}
            />
          </div>

          {/* Animated ring on pulse */}
          {isPulsing && (
            <div className="absolute inset-0 w-28 h-28 rounded-full bg-sakura-400 animate-pulse-ring" />
          )}
        </div>
      </div>

      {/* Control Button */}
      <button
        onClick={handleToggle}
        className={`w-full py-4 px-6 rounded-3xl font-semibold text-white transition-all duration-200 tap-highlight-transparent active:scale-95 transform flex items-center justify-center gap-2 ${
          isRunning
            ? 'bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 shadow-lg'
            : 'bg-gradient-to-r from-sakura-400 to-sakura-500 hover:from-sakura-500 hover:to-sakura-600 shadow-lg'
        }`}
      >
        {isRunning ? (
          <>
            <Pause className="w-5 h-5" />
            リズムを停止
          </>
        ) : (
          <>
            <Play className="w-5 h-5" />
            リズムを開始
          </>
        )}
      </button>

      {/* Timer Start Button (shown when stopped and onStartTimer is available) */}
      {!isRunning && onStartTimer && volume && totalMinutes && (
        <button
          onClick={onStartTimer}
          className="w-full py-3 px-6 rounded-3xl font-medium text-mint-700 bg-mint-100 hover:bg-mint-200 border-2 border-mint-300 transition-all duration-200 tap-highlight-transparent active:scale-95 transform flex items-center justify-center gap-2"
        >
          <Clock className="w-5 h-5" />
          このリズムでタイマーを開始
        </button>
      )}

      {isRunning && (
        <div className="bg-mint-50 border-2 border-mint-200 rounded-2xl p-3 text-center">
          <p className="text-sm font-medium text-mint-800">
            メトロノーム作動中 ({(60000 / intervalMs).toFixed(1)} 回/分)
          </p>
        </div>
      )}
    </div>
  )
}
