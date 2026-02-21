import { useCallback, useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, Filter, ArrowRight } from 'lucide-react'
import { usePolling } from '../hooks/usePolling'
import { getConnections } from '../api/network'
import { stateColor, CONN_STATES, extractPort } from '../utils/classify'

const REFRESH_MS = 5000

export default function Connections() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Pre-fill filter if linked from Processes page (?pid=xxx&name=xxx)
  const [pidFilter,    setPidFilter]    = useState(searchParams.get('pid')   ?? '')
  const [nameFilter,   setNameFilter]   = useState(searchParams.get('name')  ?? '')
  const [stateFilter,  setStateFilter]  = useState(searchParams.get('state') ?? '')
  const [portFilter,   setPortFilter]   = useState(searchParams.get('port')  ?? '')
  const [remoteFilter, setRemoteFilter] = useState('')

  // Fetch all latest snapshots (last 10m)
  const fetchConns = useCallback(() => getConnections(), [])
  const { data: snaps, loading } = usePolling(fetchConns, REFRESH_MS)

  // Flatten all connections from all snapshots into one list (deduplicated)
  const allConns = useMemo(() => {
    if (!snaps || snaps.length === 0) return []
    // Use latest snapshot only for live view
    const latest = snaps[snaps.length - 1]
    return latest?.connections ?? []
  }, [snaps])

  // Apply filters
  const filtered = useMemo(() => {
    return allConns.filter(c => {
      if (pidFilter    && !String(c.pid).includes(pidFilter))                           return false
      if (nameFilter   && !c.process_name?.toLowerCase().includes(nameFilter.toLowerCase())) return false
      if (stateFilter  && c.status !== stateFilter)                                     return false
      if (portFilter   && extractPort(c.local_addr) !== portFilter &&
                          extractPort(c.remote_addr) !== portFilter)                    return false
      if (remoteFilter && !c.remote_addr?.includes(remoteFilter))                       return false
      return true
    })
  }, [allConns, pidFilter, nameFilter, stateFilter, portFilter, remoteFilter])

  // Group by process name for the "unique remotes" pill
  const remotesPerProc = useMemo(() => {
    const map = {}
    allConns.forEach(c => {
      if (!map[c.process_name]) map[c.process_name] = new Set()
      if (c.remote_addr && c.remote_addr !== '*:*') {
        map[c.process_name].add(c.remote_addr)
      }
    })
    return map
  }, [allConns])

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-white">Connections</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Live port ↔ process map · refresh every 5s
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
          {filtered.length} connections shown
        </div>
      </div>

      {/* ── Filters bar ── */}
      <div className="flex flex-wrap gap-2">
        {/* Name filter */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input
            value={nameFilter}
            onChange={e => setNameFilter(e.target.value)}
            placeholder="Process name…"
            className="bg-gray-900 border border-gray-700 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 w-44"
          />
        </div>

        {/* PID filter */}
        <input
          value={pidFilter}
          onChange={e => setPidFilter(e.target.value)}
          placeholder="PID…"
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 w-24"
        />

        {/* Port filter */}
        <div className="relative">
          <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input
            value={portFilter}
            onChange={e => setPortFilter(e.target.value)}
            placeholder="Port…"
            className="bg-gray-900 border border-gray-700 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 w-24"
          />
        </div>

        {/* Remote IP filter */}
        <input
          value={remoteFilter}
          onChange={e => setRemoteFilter(e.target.value)}
          placeholder="Remote IP…"
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 w-36"
        />

        {/* State dropdown */}
        <select
          value={stateFilter}
          onChange={e => setStateFilter(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">All states</option>
          {CONN_STATES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Reset */}
        {(pidFilter || nameFilter || stateFilter || portFilter || remoteFilter) && (
          <button
            onClick={() => { setPidFilter(''); setNameFilter(''); setStateFilter(''); setPortFilter(''); setRemoteFilter('') }}
            className="px-3 py-2 text-xs text-red-400 border border-red-900/50 bg-red-950/30 rounded-lg hover:bg-red-950/60 transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-4 py-3 text-gray-500 font-medium w-10">PID</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Process</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Proto</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Local</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Remote</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium w-28">State</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Remotes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {loading && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-500">
                  Collecting connection data…
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-500">
                  No connections match your filters
                </td>
              </tr>
            )}
            {filtered.map((c, i) => {
              const remoteCount = remotesPerProc[c.process_name]?.size ?? 0
              return (
                <tr key={i} className="hover:bg-gray-800/30 transition-colors group">
                  <td className="px-4 py-2.5 text-gray-500 tabular-nums">{c.pid}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-200 font-medium">{c.process_name}</span>
                      {/* Link to App Traffic */}
                      <button
                        onClick={() => navigate(`/app-traffic?name=${encodeURIComponent(c.process_name)}`)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400 hover:text-blue-300"
                        title="View app traffic"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-xs uppercase text-gray-400 font-mono">{c.type}</span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-400 font-mono">{c.local_addr}</td>
                  <td className="px-4 py-2.5 text-gray-300 font-mono">
                    {c.remote_addr === '*:*' || c.remote_addr === '0.0.0.0:0'
                      ? <span className="text-gray-600">—</span>
                      : c.remote_addr
                    }
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`font-medium ${stateColor(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    {remoteCount > 0 && (
                      <span className="inline-flex items-center justify-center bg-blue-950/60 text-blue-300 text-xs border border-blue-900/50 rounded-full w-7 h-5 font-medium tabular-nums">
                        {remoteCount}
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
