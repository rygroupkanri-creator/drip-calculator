'use client'

import { useState, useCallback, useMemo } from 'react'
import { Droplets, Clock, Calculator as CalcIcon, Sparkles } from 'lucide-react'
import DisclaimerModal from './DisclaimerModal'
import Metronome from './Metronome'
import PresetManager from './PresetManager'
import MultiTimer from './MultiTimer'

export default function Calculator() {
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false)
  const [volume, setVolume] = useState<string>('') // mL
  const [hours, setHours] = useState<string>('') // hours
  const [minutes, setMinutes] = useState<string>('') // minutes
  const [dropFactor, setDropFactor] = useState<20 | 60>(20)
  const [isMetronomeRunning, setIsMetronomeRunning] = useState(false)

  // Core calculation logic
  const calculations = useMemo(() => {
    const volumeNum = parseFloat(volume)
    const hoursNum = parseFloat(hours) || 0
    const minutesNum = parseFloat(minutes) || 0

    // Validate inputs
    if (!volumeNum || volumeNum <= 0 || (hoursNum === 0 && minutesNum === 0)) {
      return null
    }

    // Calculate total time in minutes
    const totalMinutes = hoursNum * 60 + minutesNum

    if (totalMinutes <= 0) {
      return null
    }

    // Formula: (Volume [mL] * Drop Factor [drops/mL]) / Total Time [minutes]
    const dropsPerMinute = (volumeNum * dropFactor) / totalMinutes

    // Calculate seconds per drop (interval for metronome)
    const secondsPerDrop = 60 / dropsPerMinute

    // Convert to milliseconds for high precision
    const msPerDrop = secondsPerDrop * 1000

    return {
      dropsPerMinute: Math.round(dropsPerMinute),
      secondsPerDrop: secondsPerDrop.toFixed(2),
      msPerDrop: Math.round(msPerDrop),
    }
  }, [volume, hours, minutes, dropFactor])

  const handleToggleMetronome = useCallback(() => {
    setIsMetronomeRunning((prev) => !prev)
  }, [])

  const handleDisclaimerAccept = useCallback(() => {
    setHasAcceptedDisclaimer(true)
  }, [])

  const handleNumberInput = useCallback(
    (value: string, setter: (value: string) => void, allowDecimal = true) => {
      // Allow only numbers and optional decimal point
      const regex = allowDecimal ? /^\d*\.?\d*$/ : /^\d*$/
      if (regex.test(value) || value === '') {
        setter(value)
      }
    },
    []
  )

  const handleLoadPreset = useCallback(
    (preset: { volume: string; hours: string; minutes: string; dropFactor: 20 | 60 }) => {
      setVolume(preset.volume)
      setHours(preset.hours)
      setMinutes(preset.minutes)
      setDropFactor(preset.dropFactor)
    },
    []
  )

  return (
    <>
      <DisclaimerModal onAccept={handleDisclaimerAccept} />

      {hasAcceptedDisclaimer && (
        <div className="flex-1 container mx-auto px-4 py-6 max-w-2xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-3 py-6">
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Droplets className="w-10 h-10 text-sakura-500" />
              <div>
                <div className="flex items-center gap-2 justify-center">
                  <h1 className="text-4xl font-bold text-gray-800">
                    点滴滴下計算機
                  </h1>
                  <span className="bg-gradient-to-r from-sakura-400 to-sakura-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                    <Sparkles className="w-3 h-3" />
                    Ver.2.0
                  </span>
                </div>
              </div>
            </div>
            <p className="text-gray-600 text-lg">
              高精度な滴下数計算とリズムガイド
            </p>
            <p className="text-sm text-gray-500">
              R.Y. Group 公式アプリ
            </p>
          </div>

          {/* Calculator Form */}
          <div className="bg-white rounded-3xl shadow-lg p-6 space-y-6 border-2 border-greige-300">
            {/* Volume Input */}
            <div className="space-y-2">
              <label
                htmlFor="volume"
                className="block text-sm font-semibold text-gray-700 uppercase tracking-wide"
              >
                総輸液量 (mL)
              </label>
              <div className="relative">
                <input
                  id="volume"
                  type="text"
                  inputMode="decimal"
                  value={volume}
                  onChange={(e) => handleNumberInput(e.target.value, setVolume)}
                  placeholder="輸液量を入力"
                  className="w-full px-6 py-4 text-2xl font-semibold border-2 border-greige-400 rounded-3xl focus:border-sakura-400 focus:ring-4 focus:ring-sakura-100 outline-none transition-all tap-highlight-transparent bg-greige-50"
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                  mL
                </div>
              </div>
            </div>

            {/* Duration Inputs */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                <Clock className="w-4 h-4 inline mr-1" />
                予定時間
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={hours}
                    onChange={(e) => handleNumberInput(e.target.value, setHours, false)}
                    placeholder="時間"
                    className="w-full px-6 py-4 text-2xl font-semibold border-2 border-greige-400 rounded-3xl focus:border-sakura-400 focus:ring-4 focus:ring-sakura-100 outline-none transition-all tap-highlight-transparent bg-greige-50"
                  />
                  <p className="text-xs text-gray-500 mt-1 text-center">時間</p>
                </div>
                <div>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={minutes}
                    onChange={(e) => handleNumberInput(e.target.value, setMinutes, false)}
                    placeholder="分"
                    className="w-full px-6 py-4 text-2xl font-semibold border-2 border-greige-400 rounded-3xl focus:border-sakura-400 focus:ring-4 focus:ring-sakura-100 outline-none transition-all tap-highlight-transparent bg-greige-50"
                  />
                  <p className="text-xs text-gray-500 mt-1 text-center">分</p>
                </div>
              </div>
            </div>

            {/* Drop Factor Toggle */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                滴下セット (滴/mL)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setDropFactor(20)}
                  className={`py-4 px-6 text-xl font-bold rounded-3xl transition-all tap-highlight-transparent active:scale-95 transform ${
                    dropFactor === 20
                      ? 'bg-gradient-to-r from-mint-400 to-mint-500 text-white shadow-lg'
                      : 'bg-greige-200 text-gray-600 hover:bg-greige-300'
                  }`}
                >
                  20滴
                </button>
                <button
                  onClick={() => setDropFactor(60)}
                  className={`py-4 px-6 text-xl font-bold rounded-3xl transition-all tap-highlight-transparent active:scale-95 transform ${
                    dropFactor === 60
                      ? 'bg-gradient-to-r from-mint-400 to-mint-500 text-white shadow-lg'
                      : 'bg-greige-200 text-gray-600 hover:bg-greige-300'
                  }`}
                >
                  60滴
                </button>
              </div>
            </div>
          </div>

          {/* PresetManager */}
          <PresetManager
            currentVolume={volume}
            currentHours={hours}
            currentMinutes={minutes}
            currentDropFactor={dropFactor}
            onLoadPreset={handleLoadPreset}
          />

          {/* Results Display */}
          {calculations && (
            <div className="bg-gradient-to-br from-sakura-400 to-sakura-500 rounded-3xl shadow-xl p-6 text-white space-y-4 border-2 border-sakura-300">
              <div className="flex items-center gap-2 mb-2">
                <CalcIcon className="w-6 h-6" />
                <h2 className="text-xl font-bold">計算結果</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-5 border border-white/30">
                  <p className="text-sm text-white/90 mb-1 font-medium">滴下数</p>
                  <p className="text-5xl font-bold">{calculations.dropsPerMinute}</p>
                  <p className="text-xs text-white/80 mt-2">滴/分</p>
                </div>

                <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-5 border border-white/30">
                  <p className="text-sm text-white/90 mb-1 font-medium">1滴の間隔</p>
                  <p className="text-5xl font-bold">{calculations.secondsPerDrop}</p>
                  <p className="text-xs text-white/80 mt-2">秒</p>
                </div>
              </div>

              <div className="bg-white/10 rounded-2xl p-4 text-sm border border-white/20">
                <p className="text-white/95 leading-relaxed">
                  <strong>設定:</strong> {volume} mLを{' '}
                  {hours && parseInt(hours) > 0 && `${hours}時間`}
                  {minutes && parseInt(minutes) > 0 && `${minutes}分`}
                  で投与（{dropFactor}滴/mL）
                </p>
              </div>
            </div>
          )}

          {/* MultiTimer */}
          <MultiTimer />

          {/* Metronome */}
          {calculations && (
            <Metronome
              intervalMs={calculations.msPerDrop}
              isRunning={isMetronomeRunning}
              onToggle={handleToggleMetronome}
            />
          )}

          {/* Footer */}
          <footer className="text-center py-8 space-y-3 mt-8">
            <div className="bg-white rounded-3xl shadow-lg p-6 border-2 border-greige-300">
              <p className="text-sm text-gray-700 mb-2 font-medium">
                Produced by{' '}
                <a
                  href="#"
                  className="text-sakura-500 font-bold hover:text-sakura-600 transition-colors"
                >
                  R.Y. Group
                </a>
              </p>
              <p className="text-xs text-gray-500">
                医療技術専門職を募集しています
              </p>
              <div className="mt-4 pt-4 border-t border-greige-300">
                <p className="text-xs text-gray-400">
                  Ver.2.0 Official Release | © 2026 R.Y. Group
                </p>
              </div>
            </div>
          </footer>
        </div>
      )}
    </>
  )
}
