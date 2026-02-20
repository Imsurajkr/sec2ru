import { useCallback } from 'react'
import client from '../api/client'
import { usePolling } from '../hooks/usePolling'

const fmtUptime = (secs) => {
  if (!secs) return '—'
  const d = Math.floor(secs / 86400)
  const h = Math.floor((secs % 86400) / 3600)
  const m = Math.floor((secs % 3600) / 60)
  return [d && `${d}d`, h && `${h}h`, `${m}m`].filter(Boolean).join(' ')
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-gray-800 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm text-gray-200 font-medium">{value ?? '—'}</span>
    </div>
  )
}

export default function Info() {
  const fetchInfo = useCallback(() => client.get('/info').then(r => r.data), [])
  const { data: info, loading } = usePolling(fetchInfo, 60_000)

  return (
    <div className="space-y-5 max-w-lg">
      <div>
        <h1 className="text-xl font-semibold text-white">System Info</h1>
        <p className="text-sm text-gray-500 mt-0.5">Node and OS details</p>
      </div>

      {loading && <p className="text-gray-500 text-sm">Loading…</p>}

      {info && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 px-5">
          <Row label="Node Name"    value={info.node_name} />
          <Row label="Hostname"     value={info.hostname}  />
          <Row label="OS"           value={info.os}        />
          <Row label="Platform"     value={info.platform}  />
          <Row label="Architecture" value={info.arch}      />
          <Row label="Uptime"       value={fmtUptime(info.uptime_sec)} />
        </div>
      )}
    </div>
  )
}
