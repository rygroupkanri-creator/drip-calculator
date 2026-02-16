import { WifiOff } from 'lucide-react'

export default function Offline() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <WifiOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">オフラインです</h1>
        <p className="text-gray-600">
          インターネット接続を確認してから、もう一度お試しください。
        </p>
      </div>
    </div>
  )
}
