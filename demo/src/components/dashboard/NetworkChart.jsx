import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { networkHistory } from '../../data/mockData'

const fmt = (v) => v > 1_000_000 ? `${(v/1_000_000).toFixed(1)}MB` : `${(v/1_000).toFixed(0)}KB`

export default function NetworkChart() {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Network Traffic</h3>
          <p className="text-xs text-gray-500">Bytes/sec · RX + TX · last 60s</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={networkHistory} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="rxGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#34d399" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="txGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#818cf8" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="t" tick={{ fontSize: 10, fill: '#6b7280' }} />
          <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} tickFormatter={fmt} />
          <Tooltip
            formatter={(v) => fmt(v)}
            contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '8px', fontSize: 11 }}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
          <Area type="monotone" dataKey="rx" name="RX" stroke="#34d399" fill="url(#rxGrad)" strokeWidth={2} dot={false} />
          <Area type="monotone" dataKey="tx" name="TX" stroke="#818cf8" fill="url(#txGrad)" strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
