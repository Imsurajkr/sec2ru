import { useCallback, useState } from 'react'
import { Search, ArrowDownUp } from 'lucide-react'
import client from '../api/client'
import { usePolling } from '../hooks/usePolling'
import { useNavigate } from 'react-router-dom'
import { Network } from 'lucide-react'

const fmtMB = (b) => b ? `${(b / 1_048_576).toFixed(1)} MB` : '—'

const SORTABLE = [
  { key: 'cpu_percent', label: 'CPU %' },
  { key: 'mem_percent', label: 'Mem %' },
  { key: 'mem_rss_bytes', label: 'RSS' },
]


export default function Processes() {
  const navigate = useNavigate()
  const [sortBy, setSortBy] = useState('cpu_percent')
  const [search, setSearch] = useState('')

  const fetchProcs = useCallback(() =>
    client.get('/processes').then(r => r.data), [])
  const { data, loading } = usePolling(fetchProcs, 3000)

  const rows = (data?.processes ?? [])
    .filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (b[sortBy] ?? 0) - (a[sortBy] ?? 0))

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Processes</h1>
          <p className="text-sm text-gray-500 mt-0.5">Top 25 · auto-refresh every 3s</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter by name…"
            className="bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors w-52"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium w-14">PID</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Name</th>
              {SORTABLE.map(col => (
                <th
                  key={col.key}
                  onClick={() => setSortBy(col.key)}
                  className={`text-right px-4 py-3 text-xs font-medium cursor-pointer select-none transition-colors whitespace-nowrap ${sortBy === col.key ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {sortBy === col.key && <ArrowDownUp className="w-3 h-3" />}
                  </span>
                </th>
              ))}
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium w-24">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {loading && (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-500 text-sm">
                  Loading…
                </td>
              </tr>
            )}
            {rows.map(p => (
              <tr key={p.pid} className="hover:bg-gray-800/30 transition-colors">
                <td className="px-4 py-2.5 text-gray-500 tabular-nums text-xs">{p.pid}</td>
                <td className="px-4 py-2.5 text-gray-200 font-medium max-w-xs truncate">
                  {p.name}
                </td>
                <td className="px-4 py-2.5">
                  <button
                    onClick={() => navigate(
                      `/connections?pid=${p.pid}&name=${encodeURIComponent(p.name)}`
                    )}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-400 transition-colors"
                    title="View connections"
                  >
                    <Network className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">conns</span>
                  </button>
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">
                  <span className={
                    p.cpu_percent > 50 ? 'text-red-400' :
                      p.cpu_percent > 20 ? 'text-yellow-400' : 'text-gray-300'
                  }>
                    {p.cpu_percent?.toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right text-gray-300 tabular-nums">
                  {p.mem_percent?.toFixed(1)}%
                </td>
                <td className="px-4 py-2.5 text-right text-gray-400 tabular-nums">
                  {fmtMB(p.mem_rss_bytes)}
                </td>
                <td className="px-4 py-2.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'running'
                      ? 'bg-green-950 text-green-400 border border-green-900/50'
                      : 'bg-gray-800 text-gray-500'
                    }`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
