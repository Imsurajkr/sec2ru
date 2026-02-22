import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
import { cpuHistory } from '../../data/mockData'

export default function CpuChart() {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">CPU Usage</h3>
          <p className="text-xs text-gray-500">Last 60 seconds · spike detected at t=36s</p>
        </div>
        <span className="text-xs bg-red-950/50 text-red-400 border border-red-900/50 px-2 py-0.5 rounded-full">1 spike</span>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={cpuHistory} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#38bdf8" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="t" tick={{ fontSize: 10, fill: '#6b7280' }} />
          <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} domain={[0, 100]} />
          <Tooltip
            contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '8px', fontSize: 11 }}
            labelStyle={{ color: '#9ca3af' }}
          />
          <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'spike', fill: '#ef4444', fontSize: 10 }} />
          <Area type="monotone" dataKey="value" stroke="#38bdf8" fill="url(#cpuGrad)" strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
