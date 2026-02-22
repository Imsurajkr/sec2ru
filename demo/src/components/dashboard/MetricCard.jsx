import { TrendingUp, TrendingDown } from 'lucide-react'

const COLOR = {
  blue:   'text-blue-400 bg-blue-400/10',
  purple: 'text-purple-400 bg-purple-400/10',
  amber:  'text-amber-400 bg-amber-400/10',
  red:    'text-red-400 bg-red-400/10',
  cyan:   'text-cyan-400 bg-cyan-400/10',
  orange: 'text-orange-400 bg-orange-400/10',
}

export default function MetricCard({ icon: Icon, label, value, trend, color = 'blue' }) {
  const up = trend > 0
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-lg ${COLOR[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className={`flex items-center gap-0.5 text-xs ${up ? 'text-green-400' : 'text-red-400'}`}>
          {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(trend)}
        </div>
      </div>
      <p className="text-2xl font-bold text-white mt-3 tabular-nums">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}
