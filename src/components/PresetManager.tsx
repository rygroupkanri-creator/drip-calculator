'use client'

import { useState, useEffect } from 'react'
import { Save, FolderOpen, Trash2, X } from 'lucide-react'

interface Preset {
  id: string
  name: string
  volume: string
  hours: string
  minutes: string
  dropFactor: 20 | 60
  createdAt: number
}

interface PresetManagerProps {
  currentVolume: string
  currentHours: string
  currentMinutes: string
  currentDropFactor: 20 | 60
  onLoadPreset: (preset: Preset) => void
}

export default function PresetManager({
  currentVolume,
  currentHours,
  currentMinutes,
  currentDropFactor,
  onLoadPreset,
}: PresetManagerProps) {
  const [presets, setPresets] = useState<Preset[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [presetName, setPresetName] = useState('')

  useEffect(() => {
    loadPresets()
  }, [])

  const loadPresets = () => {
    try {
      const saved = localStorage.getItem('drip-calc-presets')
      if (saved) {
        setPresets(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Failed to load presets:', error)
    }
  }

  const savePreset = () => {
    if (!presetName.trim()) {
      alert('プリセット名を入力してください')
      return
    }

    if (!currentVolume || (!currentHours && !currentMinutes)) {
      alert('保存する設定を入力してください')
      return
    }

    if (presets.length >= 7) {
      alert('プリセットは最大7つまでです。削除してから追加してください。')
      return
    }

    const newPreset: Preset = {
      id: Date.now().toString(),
      name: presetName.trim(),
      volume: currentVolume,
      hours: currentHours,
      minutes: currentMinutes,
      dropFactor: currentDropFactor,
      createdAt: Date.now(),
    }

    const updatedPresets = [...presets, newPreset]
    setPresets(updatedPresets)
    localStorage.setItem('drip-calc-presets', JSON.stringify(updatedPresets))
    setPresetName('')
    setIsSaving(false)
    alert(`「${newPreset.name}」を保存しました`)
  }

  const deletePreset = (id: string) => {
    if (!confirm('このプリセットを削除しますか？')) return

    const updatedPresets = presets.filter((p) => p.id !== id)
    setPresets(updatedPresets)
    localStorage.setItem('drip-calc-presets', JSON.stringify(updatedPresets))
  }

  const loadPreset = (preset: Preset) => {
    onLoadPreset(preset)
    setIsOpen(false)
    alert(`「${preset.name}」を読み込みました`)
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-sakura-400" />
          マイ・プリセット
        </h3>
        <div className="text-xs text-gray-500">
          {presets.length}/7 保存中
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setIsSaving(true)}
          disabled={presets.length >= 7}
          className={`flex-1 py-3 px-4 rounded-2xl font-medium transition-all tap-highlight-transparent active:scale-95 transform flex items-center justify-center gap-2 ${
            presets.length >= 7
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-sakura-200 text-sakura-700 hover:bg-sakura-300'
          }`}
        >
          <Save className="w-4 h-4" />
          現在の設定を保存
        </button>

        <button
          onClick={() => setIsOpen(true)}
          disabled={presets.length === 0}
          className={`flex-1 py-3 px-4 rounded-2xl font-medium transition-all tap-highlight-transparent active:scale-95 transform flex items-center justify-center gap-2 ${
            presets.length === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-mint-200 text-mint-700 hover:bg-mint-300'
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          プリセット一覧
        </button>
      </div>

      {/* Save Modal */}
      {isSaving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">プリセットを保存</h3>
              <button
                onClick={() => {
                  setIsSaving(false)
                  setPresetName('')
                }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                プリセット名
              </label>
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="例: 午前中の標準輸液"
                maxLength={20}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:border-sakura-400 focus:ring-4 focus:ring-sakura-100 outline-none transition-all"
              />
              <p className="text-xs text-gray-500">{presetName.length}/20文字</p>
            </div>

            <div className="bg-greige-300 rounded-2xl p-4 text-sm space-y-1">
              <p className="text-gray-700">
                <strong>保存される設定:</strong>
              </p>
              <p>輸液量: {currentVolume || '未入力'} mL</p>
              <p>
                予定時間: {currentHours || '0'}時間 {currentMinutes || '0'}分
              </p>
              <p>滴下セット: {currentDropFactor}滴/mL</p>
            </div>

            <button
              onClick={savePreset}
              className="w-full bg-sakura-400 hover:bg-sakura-500 text-white font-semibold py-3 px-6 rounded-2xl transition-colors tap-highlight-transparent active:scale-95 transform"
            >
              保存する
            </button>
          </div>
        </div>
      )}

      {/* Load Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between sticky top-0 bg-white pb-2">
              <h3 className="text-xl font-bold text-gray-800">保存済みプリセット</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  className="bg-greige-200 rounded-2xl p-4 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{preset.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {preset.volume}mL / {preset.hours || '0'}時間
                        {preset.minutes || '0'}分 / {preset.dropFactor}滴
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => loadPreset(preset)}
                      className="flex-1 bg-mint-400 hover:bg-mint-500 text-white py-2 px-4 rounded-xl transition-colors text-sm font-medium"
                    >
                      読み込む
                    </button>
                    <button
                      onClick={() => deletePreset(preset.id)}
                      className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
