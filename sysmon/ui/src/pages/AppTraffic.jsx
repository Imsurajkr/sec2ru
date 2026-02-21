import { useCallback, useMemo, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Globe, Server, Terminal, Monitor, Cpu, ArrowLeft } from 'lucide-react'
import { usePolling } from '../hooks/usePolling'
import { getAppSummary } from '../api/network'
import { catBadge, CATEGORIES } from '../utils/classify'

const REFRESH_MS = 15_000

// Icon per category
const CAT_ICON = {
  browser:  Globe,
  'dev-tool': Monitor,
  terminal: Terminal,
  infra:    Server,
  system:   Cpu,
}

// Filter chip button
function Chip({ label, active, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
        active ? color : 'bg-gray-900 text-gray-500 border-gray-700 hover:border-gray-600'
      }`}
    >
      {label}
    </button>
  )
}

function AppCard({ app, onDrillDown }) {
  const cat   = catBadge(app.category)
  const Icon  = CAT_ICON[app.category] ?? Cpu
  const hasSusp = app.suspicious_ports?.length > 0

  return (
    <div
      className={`bg-gray-900 rounded-xl border p-5 space-y-4 cursor-pointer hover:border-gray-600 transition-colors ${
        hasSusp ? 'border-red-900/50' : 'border-gray-800'
      }`}
      onClick={onDrillDown}
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gray-800">
            <Icon className="w-4 h-4 text-gray-300" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{app.process_name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{app.pids?.length} PID(s)</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <span className={`text-xs px-2 py-0.5 rounded-full border ${cat.color}`}>
            {cat.label}
          </span>
          {hasSusp && (
            <span className="text-xs px-2 py-0.5 rounded-full border bg-red-950/50 text-red-400 border-red-900/50">
              ⚠ suspicious port
            </span>
          )}
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-800/50 rounded-lg p-2.5 text-center">
          <p className="text-lg font-bold text-white tabular-nums">{app.unique_remotes}</p>
          <p className="text-xs text-gray-500 mt-0.5">unique remotes</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-2.5 text-center">
          <p className="text-lg font-bold text-white tabular-nums">{app.conn_count}</p>
          <p className="text-xs text-gray-500 mt-0.5">connections</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-2.5 text-center">
          <p className="text-lg font-bold text-white tabular-nums">
            {app.listen_ports?.length ?? 0}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">listening</p>
        </div>
      </div>

      {/* ── Listen ports ── */}
      {app.listen_ports?.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-1.5">Listening on</p>
          <div className="flex flex-wrap gap-1.5">
            {app.listen_ports.slice(0, 6).map((p, i) => (
              <span key={i} className="text-xs font-mono bg-blue-950/40 text-blue-300 border border-blue-900/40 rounded px-1.5 py-0.5">
                {p}
              </span>
            ))}
            {app.listen_ports.length > 6 && (
              <span className="text-xs text-gray-500">+{app.listen_ports.length - 6}</span>
            )}
          </div>
        </div>
      )}

      {/* ── Suspicious ports warning ── */}
      {hasSusp && (
        <div className="bg-red-950/30 border border-red-900/40 rounded-lg px-3 py-2">
          <p className="text-xs text-red-400 font-medium">Suspicious outbound:</p>
          <p className="text-xs text-red-300 font-mono mt-0.5">
            {app.suspicious_ports.join(', ')}
          </p>
        </div>
      )}
    </div>
  )
}

export default function AppTraffic() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [window,   setWindow]   = useState('30m')
  const [catFilter, setCatFilter] = useState('all')
  const [nameFilter, setNameFilter] = useState(searchParams.get('name') ?? '')

  const fetchSummary = useCallback(() => getAppSummary(window), [window])
  const { data: apps, loading } = usePolling(fetchSummary, REFRESH_MS)

  const filtered = useMemo(() => {
    if (!apps) return []
    return apps.filter(a => {
      if (catFilter !== 'all' && a.category !== catFilter) return false
      if (nameFilter && !a.process_name.toLowerCase().includes(nameFilter.toLowerCase())) return false
      return true
    })
  }, [apps, catFilter, nameFilter])

  // Count per category for chips
  const catCounts = useMemo(() => {
    const m = { all: apps?.length ?? 0 }
    apps?.forEach(a => { m[a.category] = (m[a.category] ?? 0) + 1 })
    return m
  }, [apps])

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          {nameFilter ? (
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => { setNameFilter(''); navigate('/app-traffic') }}
                className="text-gray-500 hover:text-gray-300 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h1 className="text-xl font-semibold text-white">
                Traffic for <span className="text-blue-400">{nameFilter}</span>
              </h1>
            </div>
          ) : (
            <h1 className="text-xl font-semibold text-white">App Traffic</h1>
          )}
          <p className="text-sm text-gray-500 mt-0.5">
            Per-process network activity · refresh every 15s
          </p>
        </div>

        {/* Time window selector */}
        <div className="flex gap-1.5">
          {['15m','30m','1h','6h'].map(w => (
            <button
              key={w}
              onClick={() => setWindow(w)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                window === w
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-600'
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* ── Category filter chips ── */}
      <div className="flex flex-wrap gap-2">
        <Chip
          label={`All (${catCounts.all ?? 0})`}
          active={catFilter === 'all'}
          color="bg-gray-700 text-white border-gray-600"
          onClick={() => setCatFilter('all')}
        />
        {Object.entries(CATEGORIES).map(([key, meta]) =>
          catCounts[key] ? (
            <Chip
              key={key}
              label={`${meta.label} (${catCounts[key]})`}
              active={catFilter === key}
              color={meta.color}
              onClick={() => setCatFilter(catFilter === key ? 'all' : key)}
            />
          ) : null
        )}
      </div>

      {/* ── Loading skeleton ── */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-900 rounded-xl border border-gray-800 p-5 h-52 animate-pulse" />
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && filtered.length === 0 && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 px-6 py-14 text-center">
          <p className="text-gray-400">No apps found matching your filters</p>
        </div>
      )}

      {/* ── Cards grid ── */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(app => (
            <AppCard
              key={app.process_name}
              app={app}
              onDrillDown={() =>
                navigate(`/connections?name=${encodeURIComponent(app.process_name)}`)
              }
            />
          ))}
        </div>
      )}

    </div>
  )
}
