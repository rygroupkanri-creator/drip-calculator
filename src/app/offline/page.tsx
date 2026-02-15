import { WifiOff } from 'lucide-react'

export default function Offline() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <WifiOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">You're Offline</h1>
        <p className="text-gray-600">
          Please check your internet connection and try again.
        </p>
      </div>
    </div>
  )
}
