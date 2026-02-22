import Badge from '../ui/Badge'
import { securityEvents } from '../../data/mockData'
import { AlertTriangle } from 'lucide-react'

export default function SecurityEvents({ limit }) {
  const rows = limit ? securityEvents.slice(0, limit) : securityEvents
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <h3 className="text-sm font-semibold text-white">Security Events</h3>
        </div>
        <span className="text-xs bg-red-950/50 text-red-400 border border-red-900/50 px-2 py-0.5 rounded-full">{securityEvents.filter(e => e.severity === 'critical' || e.severity === 'high').length} high+</span>
      </div>
      <div className="divide-y divide-gray-800/50">
        {rows.map(e => (
          <div key={e.id} className={`px-5 py-3 hover:bg-gray-800/30 transition-colors ${e.severity === 'critical' ? 'border-l-2 border-red-500' : e.severity === 'high' ? 'border-l-2 border-orange-500' : ''}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-purple-400">{e.rule}</span>
                  <Badge variant={e.severity}>{e.severity}</Badge>
                  <span className="text-xs text-gray-600">{e.host}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed truncate" title={e.msg}>{e.msg}</p>
              </div>
              <span className="text-xs text-gray-600 font-mono shrink-0">{e.ts}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
