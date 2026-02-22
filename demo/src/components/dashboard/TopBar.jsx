import { Bell, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function TopBar() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <header className="border-b border-gray-800 px-6 py-3 flex items-center justify-between bg-gray-950">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">Node:</span>
        <span className="text-sm text-white font-medium">dev-laptop</span>
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
        <span className="text-xs text-gray-500">192.168.1.100</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <RefreshCw className="w-3 h-3" />
          {time.toLocaleTimeString()}
        </div>
        <button className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
        </button>
      </div>
    </header>
  )
}
