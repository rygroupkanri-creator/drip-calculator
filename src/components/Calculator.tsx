'use client'

import { useState, useCallback, useMemo } from 'react'
import { Droplets, Clock, Calculator as CalcIcon } from 'lucide-react'
import DisclaimerModal from './DisclaimerModal'
import Metronome from './Metronome'

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

  return (
    <>
      <DisclaimerModal onAccept={handleDisclaimerAccept} />

      {hasAcceptedDisclaimer && (
        <div className="flex-1 container mx-auto px-4 py-6 max-w-2xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2 py-4">
            <div className="flex items-center justify-center gap-3">
              <Droplets className="w-8 h-8 text-primary-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                点滴滴下計算機
              </h1>
            </div>
            <p className="text-gray-600">
              高精度な滴下数計算とリズムガイド
            </p>
          </div>

          {/* Calculator Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
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
                  className="w-full px-6 py-4 text-2xl font-semibold border-2 border-gray-300 rounded-xl focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none transition-all tap-highlight-transparent"
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
                    className="w-full px-6 py-4 text-2xl font-semibold border-2 border-gray-300 rounded-xl focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none transition-all tap-highlight-transparent"
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
                    className="w-full px-6 py-4 text-2xl font-semibold border-2 border-gray-300 rounded-xl focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none transition-all tap-highlight-transparent"
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
                  className={`py-4 px-6 text-xl font-bold rounded-xl transition-all tap-highlight-transparent active:scale-95 transform ${
                    dropFactor === 20
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  20滴
                </button>
                <button
                  onClick={() => setDropFactor(60)}
                  className={`py-4 px-6 text-xl font-bold rounded-xl transition-all tap-highlight-transparent active:scale-95 transform ${
                    dropFactor === 60
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  60滴
                </button>
              </div>
            </div>
          </div>

          {/* Results Display */}
          {calculations && (
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl shadow-lg p-6 text-white space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <CalcIcon className="w-5 h-5" />
                <h2 className="text-lg font-semibold">計算結果</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-sm text-primary-100 mb-1">滴下数</p>
                  <p className="text-4xl font-bold">{calculations.dropsPerMinute}</p>
                  <p className="text-xs text-primary-200 mt-1">滴/分</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-sm text-primary-100 mb-1">1滴の間隔</p>
                  <p className="text-4xl font-bold">{calculations.secondsPerDrop}</p>
                  <p className="text-xs text-primary-200 mt-1">秒</p>
                </div>
              </div>

              <div className="bg-primary-800/50 rounded-lg p-3 text-sm">
                <p className="text-primary-100">
                  <strong>設定:</strong> {volume} mLを{' '}
                  {hours && parseInt(hours) > 0 && `${hours}時間`}
                  {minutes && parseInt(minutes) > 0 && `${minutes}分`}
                  で投与（{dropFactor}滴/mL）
                </p>
              </div>
            </div>
          )}

          {/* Metronome */}
          {calculations && (
            <Metronome
              intervalMs={calculations.msPerDrop}
              isRunning={isMetronomeRunning}
              onToggle={handleToggleMetronome}
            />
          )}

          {/* Footer */}
          <footer className="text-center py-6 space-y-2">
            <p className="text-sm text-gray-600">
              Produced by{' '}
              <a
                href="#"
                className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
              >
                R.Y. Group
              </a>
            </p>
            <p className="text-xs text-gray-500">
              医療技術専門職を募集しています
            </p>
          </footer>
        </div>
      )}
    </>
  )
}
