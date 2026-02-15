'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Volume2, VolumeX, Play, Pause } from 'lucide-react'

interface MetronomeProps {
  intervalMs: number // Time between beats in milliseconds
  isRunning: boolean
  onToggle: () => void
}

export default function Metronome({ intervalMs, isRunning, onToggle }: MetronomeProps) {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true)
  const [isPulsing, setIsPulsing] = useState(false)

  const audioContextRef = useRef<AudioContext | null>(null)
  const nextBeatTimeRef = useRef<number>(0)
  const schedulerIdRef = useRef<number | null>(null)

  // Initialize Web Audio Context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      audioContextRef.current = new AudioContextClass()
    }
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  // Play beat sound using Web Audio API for precision
  const playBeat = useCallback(() => {
    if (!audioContextRef.current || !isSoundEnabled) return

    const context = audioContextRef.current
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
  }, [isSoundEnabled])

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
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Drip Metronome</h3>
        <button
          onClick={() => setIsSoundEnabled(!isSoundEnabled)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors tap-highlight-transparent"
          aria-label={isSoundEnabled ? 'Mute sound' : 'Enable sound'}
        >
          {isSoundEnabled ? (
            <Volume2 className="w-5 h-5 text-primary-600" />
          ) : (
            <VolumeX className="w-5 h-5 text-gray-400" />
          )}
        </button>
      </div>

      {/* Visual Pulse Indicator */}
      <div className="flex items-center justify-center py-8">
        <div className="relative">
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-150 ${
              isPulsing
                ? 'bg-primary-600 scale-110 shadow-lg shadow-primary-300'
                : 'bg-primary-100 scale-100'
            }`}
          >
            <div
              className={`w-16 h-16 rounded-full transition-all duration-150 ${
                isPulsing ? 'bg-white' : 'bg-primary-200'
              }`}
            />
          </div>

          {/* Animated ring on pulse */}
          {isPulsing && (
            <div className="absolute inset-0 w-24 h-24 rounded-full bg-primary-400 animate-pulse-ring" />
          )}
        </div>
      </div>

      {/* Control Button */}
      <button
        onClick={onToggle}
        className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 tap-highlight-transparent active:scale-95 transform flex items-center justify-center gap-2 ${
          isRunning
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-primary-600 hover:bg-primary-700'
        }`}
      >
        {isRunning ? (
          <>
            <Pause className="w-5 h-5" />
            Stop Metronome
          </>
        ) : (
          <>
            <Play className="w-5 h-5" />
            Start Metronome
          </>
        )}
      </button>

      {isRunning && (
        <p className="text-xs text-center text-gray-500">
          Metronome is running at {(60000 / intervalMs).toFixed(1)} beats per minute
        </p>
      )}
    </div>
  )
}
