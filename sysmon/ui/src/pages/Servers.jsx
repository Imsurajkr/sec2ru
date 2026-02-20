import { useCallback, useState } from 'react'
import { Server, RefreshCw } from 'lucide-react'
import client from '../api/client'
import { usePolling } from '../hooks/usePolling'
import ServerCard from '../components/ServerCard'

export default function Servers() {
  const [lastRefresh, setLastRefresh] = useState(null)

  // ── Self node (always first card) ──────────────────────────────────
  const fetchSelf = useCallback(() =>
    client.get('/self').then(r => r.data), [])
  const { data: self } = usePolling(fetchSelf, 5000)

  // ── Peer nodes (concurrent fetch via hub) ──────────────────────────
  const [peers, setPeers]   = useState([])
  const [loading, setLoading] = useState(true)

  usePolling(
    useCallback(async () => {
      const res = await client.get('/nodes')
      setPeers(res.data ?? [])
      setLastRefresh(new Date())
      setLoading(false)
      return res.data
    }, []),
    5000,
  )

  const allNodes = [
    ...(self ? [self] : []),
    ...peers,
  ]

  const onlineCount  = allNodes.filter(n => n.online).length
  const offlineCount = allNodes.length - onlineCount

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Servers</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Home lab overview · auto-refresh every 5s
          </p>
        </div>
        {lastRefresh && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <RefreshCw className="w-3 h-3" />
            {lastRefresh.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* ── Summary badges ── */}
      {allNodes.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2">
            <Server className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300">
              {allNodes.length} node{allNodes.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-green-950/50 border border-green-900/40 rounded-lg px-3 py-2">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
            <span className="text-sm text-green-400">{onlineCount} online</span>
          </div>
          {offlineCount > 0 && (
            <div className="flex items-center gap-1.5 bg-red-950/50 border border-red-900/40 rounded-lg px-3 py-2">
              <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
              <span className="text-sm text-red-400">{offlineCount} offline</span>
            </div>
          )}
        </div>
      )}

      {/* ── Loading state ── */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-900 rounded-xl border border-gray-800 p-5 h-52 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* ── No peers configured ── */}
      {!loading && allNodes.length <= 1 && peers.length === 0 && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 px-6 py-12 text-center max-w-md">
          <Server className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-300 font-medium">No peer nodes configured</p>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">
            Add nodes to <code className="text-blue-400 text-xs">config.yaml</code> under{' '}
            <code className="text-blue-400 text-xs">peers:</code> and restart the agent.
          </p>
          <div className="mt-4 bg-gray-800 rounded-lg p-3 text-left text-xs text-gray-400 font-mono">
            peers:<br />
            &nbsp;&nbsp;- name: "nas-server"<br />
            &nbsp;&nbsp;&nbsp;&nbsp;url: "http://192.168.1.10:7070"<br />
            &nbsp;&nbsp;&nbsp;&nbsp;token: ""
          </div>
        </div>
      )}

      {/* ── Node cards grid ── */}
      {!loading && allNodes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {allNodes.map((node) => (
            <ServerCard
              key={node.name}
              node={node}
              isSelf={!!node.is_self}
            />
          ))}
        </div>
      )}

    </div>
  )
}
