import { ExternalLink, Wifi, WifiOff } from 'lucide-react'

function Bar({ pct, color }) {
  const bg =
    pct >= 90 ? 'bg-red-500' :
    pct >= 70 ? 'bg-yellow-500' : color

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${bg}`}
          style={{ width: `${Math.min(pct ?? 0, 100)}%` }}
        />
      </div>
      <span className="text-xs text-gray-400 tabular-nums w-10 text-right">
        {pct != null ? `${pct.toFixed(1)}%` : '—'}
      </span>
    </div>
  )
}

function MetricRow({ label, pct, color }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <Bar pct={pct} color={color} />
    </div>
  )
}

export default function ServerCard({ node, isSelf = false }) {
  const sys   = node.system
  const procs = node.processes?.processes ?? []
  const topProc = procs[0]

  const borderClass = node.online
    ? isSelf ? 'border-blue-700/50' : 'border-gray-800'
    : 'border-red-900/40'

  return (
    <div className={`bg-gray-900 rounded-xl border ${borderClass} p-5 flex flex-col gap-4`}>

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            {node.online
              ? <Wifi className="w-3.5 h-3.5 text-green-400" />
              : <WifiOff className="w-3.5 h-3.5 text-red-400" />
            }
            <span className="text-sm font-semibold text-white">{node.name}</span>
            {isSelf && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-400 border border-blue-800/50">
                this node
              </span>
            )}
          </div>
          {sys && (
            <p className="text-xs text-gray-500 mt-1">
              {sys.os ?? node.os ?? '—'} · {sys.arch ?? '—'}
            </p>
          )}
        </div>

        {/* Open in new tab */}
        {!isSelf && node.url && (
          <a
            href={node.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-gray-800 transition-colors"
            title="Open dashboard"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* ── Offline state ── */}
      {!node.online && (
        <div className="flex-1 flex items-center justify-center py-4">
          <div className="text-center">
            <WifiOff className="w-7 h-7 text-red-800 mx-auto mb-2" />
            <p className="text-xs text-red-500">Unreachable</p>
            {node.error && (
              <p className="text-xs text-gray-600 mt-1 max-w-[180px] truncate" title={node.error}>
                {node.error}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Metrics ── */}
      {node.online && sys && (
        <div className="space-y-3">
          <MetricRow label="CPU"  pct={sys.cpu_percent}  color="bg-blue-500"   />
          <MetricRow label="MEM"  pct={sys.mem_percent}  color="bg-purple-500" />
          <MetricRow label="DISK" pct={sys.disk_percent} color="bg-amber-500"  />
        </div>
      )}

      {/* ── Top process ── */}
      {node.online && topProc && (
        <div className="pt-1 border-t border-gray-800">
          <p className="text-xs text-gray-500">
            Top:{' '}
            <span className="text-gray-300 font-medium">{topProc.name}</span>
            <span className="text-gray-500 ml-1">{topProc.cpu_percent?.toFixed(1)}% CPU</span>
          </p>
        </div>
      )}

      {/* ── Last fetched ── */}
      {node.fetched_at && (
        <p className="text-xs text-gray-700 -mt-1">
          Updated {new Date(node.fetched_at).toLocaleTimeString()}
        </p>
      )}
    </div>
  )
}
