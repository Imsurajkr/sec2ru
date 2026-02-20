import { useCallback } from 'react'
import { Zap, CheckCircle } from 'lucide-react'
import client from '../api/client'
import { usePolling } from '../hooks/usePolling'

export default function Spikes() {
  const fetchSpikes = useCallback(() =>
    client.get('/spikes').then(r => r.data), [])
  const { data, loading } = usePolling(fetchSpikes, 15_000)

  const sorted = [...(data ?? [])].sort((a, b) => b.ts - a.ts)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-white">Spike Events</h1>
        <p className="text-sm text-gray-500 mt-0.5">Anomalies detected in the last 24 hours</p>
      </div>

      {loading && <p className="text-gray-500 text-sm">Loading…</p>}

      {!loading && sorted.length === 0 && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 px-6 py-14 text-center">
          <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-3" />
          <p className="text-gray-300 font-medium">No spikes in the last 24 hours</p>
          <p className="text-gray-600 text-sm mt-1">Your system is running smoothly</p>
        </div>
      )}

      <div className="space-y-3">
        {sorted.map((spike) => (
          <div
            key={spike.ts}
            className="bg-gray-900 rounded-xl border border-red-900/30 p-5"
          >
            {/* Row 1 — time + reason */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm font-medium text-red-400">{spike.reason}</span>
              </div>
              <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                {new Date(spike.ts).toLocaleString()}
              </span>
            </div>

            {/* Row 2 — metric values at spike moment */}
            <div className="flex gap-8 text-sm mb-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">CPU at spike</p>
                <p className="text-red-400 font-semibold text-lg leading-none">
                  {spike.cpu_percent?.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Memory at spike</p>
                <p className="text-yellow-400 font-semibold text-lg leading-none">
                  {spike.mem_percent?.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Row 3 — top processes at that moment */}
            {spike.top_processes?.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Top processes at this moment</p>
                <div className="grid grid-cols-3 gap-2">
                  {spike.top_processes.map((p) => (
                    <div key={p.pid} className="bg-gray-800 rounded-lg px-3 py-2.5">
                      <p className="text-xs text-gray-200 font-medium truncate">{p.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {p.cpu_percent?.toFixed(1)}% CPU · {p.mem_percent?.toFixed(1)}% Mem
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
