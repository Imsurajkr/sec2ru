import Badge from '../ui/Badge'
import { blockedPackets } from '../../data/mockData'

export default function PacketTable({ limit }) {
  const rows = limit ? blockedPackets.slice(0, limit) : blockedPackets
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Blocked Packets</h3>
          <p className="text-xs text-gray-500 mt-0.5">eBPF/XDP · last 60s</p>
        </div>
        <span className="text-xs bg-red-950/50 text-red-400 border border-red-900/50 px-2 py-0.5 rounded-full">{blockedPackets.length} blocked</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-800">
              {['Time','Src IP','Dst Port','Proto','Reason','Severity'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {rows.map(p => (
              <tr key={p.id} className="hover:bg-gray-800/30 transition-colors">
                <td className="px-4 py-2.5 text-gray-500 font-mono">{p.ts}</td>
                <td className="px-4 py-2.5 text-gray-300 font-mono">{p.src}</td>
                <td className="px-4 py-2.5 text-gray-400 font-mono">{p.port}</td>
                <td className="px-4 py-2.5 text-gray-500 uppercase">{p.proto}</td>
                <td className="px-4 py-2.5 text-gray-400 max-w-[180px] truncate" title={p.reason}>{p.reason}</td>
                <td className="px-4 py-2.5"><Badge variant={p.severity}>{p.severity}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
