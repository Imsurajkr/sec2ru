import { useCallback, useState } from 'react'
import { Cpu, MemoryStick, HardDrive, Network, Zap } from 'lucide-react'
import client      from '../api/client'
import { usePolling } from '../hooks/usePolling'
import StatCard    from '../components/StatCard'
import MetricChart from '../components/MetricChart'

const fmtBytes = (b) => {
  if (!b) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(b) / Math.log(1024))
  return `${(b / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

const colorFor = (pct) => {
  if (pct >= 90) return 'text-red-400'
  if (pct >= 70) return 'text-yellow-400'
  return 'text-green-400'
}

export default function Dashboard() {
  // ── live stat cards (every 3s) ─────────────────────────────────────
  const fetchLive = useCallback(() => client.get('/live').then(r => r.data), [])
  const { data: live } = usePolling(fetchLive, 3000)

  // ── time-series for charts (every 10s) ─────────────────────────────
  const [metrics, setMetrics] = useState([])
  usePolling(
    useCallback(async () => {
      const res = await client.get('/metrics?window=30m')
      setMetrics(res.data ?? [])
    }, []),
    10_000,
  )

  // ── spike reference lines (every 15s) ──────────────────────────────
  const [spikes, setSpikes] = useState([])
  usePolling(
    useCallback(async () => {
      const since = Date.now() - 30 * 60 * 1000
      const res = await client.get(`/spikes?since=${since}&until=${Date.now()}`)
      setSpikes(res.data ?? [])
    }, []),
    15_000,
  )

  const sys   = live?.system
  const procs = live?.processes?.processes ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Live overview · refreshes every 3s</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="CPU"
          value={sys?.cpu_percent?.toFixed(1) ?? '—'}
          unit="%"
          icon={Cpu}
          color={colorFor(sys?.cpu_percent ?? 0)}
          sub={procs[0] ? `Top: ${procs[0].name}` : undefined}
        />
        <StatCard
          label="Memory"
          value={sys?.mem_percent?.toFixed(1) ?? '—'}
          unit="%"
          icon={MemoryStick}
          color={colorFor(sys?.mem_percent ?? 0)}
          sub={sys ? `${fmtBytes(sys.mem_used)} / ${fmtBytes(sys.mem_total)}` : undefined}
        />
        <StatCard
          label="Disk"
          value={sys?.disk_percent?.toFixed(1) ?? '—'}
          unit="%"
          icon={HardDrive}
          color={colorFor(sys?.disk_percent ?? 0)}
          sub={sys ? `${fmtBytes(sys.disk_used)} / ${fmtBytes(sys.disk_total)}` : undefined}
        />
        <StatCard
          label="Network I/O"
          value={sys ? fmtBytes(sys.net_bytes_recv + sys.net_bytes_sent) : '—'}
          icon={Network}
          color="text-blue-400"
          sub="total since boot"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <MetricChart
          title="CPU & Memory — last 30 min"
          data={metrics}
          lines={[
            { key: 'cpu_percent', color: '#3b82f6', label: 'CPU'    },
            { key: 'mem_percent', color: '#a855f7', label: 'Memory' },
          ]}
          spikes={spikes}
        />
        <MetricChart
          title="Disk Usage — last 30 min"
          data={metrics}
          lines={[
            { key: 'disk_percent', color: '#f59e0b', label: 'Disk' },
          ]}
          spikes={spikes}
        />
      </div>

      {/* Recent spikes inline */}
      {spikes.length > 0 && (
        <div className="bg-gray-900 rounded-xl border border-red-900/30 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-red-400" />
            <h3 className="text-sm font-medium text-gray-300">
              Recent Spikes — last 30 min
            </h3>
          </div>
          <div className="space-y-2">
            {[...spikes].reverse().slice(0, 5).map((s) => (
              <div
                key={s.ts}
                className="flex items-center gap-4 text-sm bg-gray-800/50 rounded-lg px-4 py-3"
              >
                <span className="text-gray-500 text-xs whitespace-nowrap">
                  {new Date(s.ts).toLocaleTimeString()}
                </span>
                <span className="text-red-400 flex-1">{s.reason}</span>
                <span className="text-gray-400 text-xs">
                  cpu {s.cpu_percent?.toFixed(1)}%
                </span>
                <span className="text-gray-500 text-xs hidden md:block">
                  {s.top_processes?.map(p => p.name).join(', ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
