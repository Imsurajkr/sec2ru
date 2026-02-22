import { useNavigate } from 'react-router'
import { Network } from 'lucide-react'
import Badge from '../ui/Badge'
import { processes } from '../../data/mockData'

export default function ProcessTable() {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Processes</h3>
        <span className="text-xs text-gray-500">{processes.length} running</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-800">
              {['PID','Name','CPU %','MEM %','User','Conns','Status'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {processes.map(p => (
              <tr key={p.pid} className="hover:bg-gray-800/30 transition-colors group">
                <td className="px-4 py-2.5 text-gray-500 tabular-nums">{p.pid}</td>
                <td className="px-4 py-2.5 text-gray-200 font-medium font-mono">{p.name}</td>
                <td className={`px-4 py-2.5 tabular-nums font-medium ${p.cpu > 10 ? 'text-red-400' : p.cpu > 5 ? 'text-yellow-400' : 'text-green-400'}`}>{p.cpu}%</td>
                <td className="px-4 py-2.5 text-gray-400 tabular-nums">{p.mem}%</td>
                <td className="px-4 py-2.5 text-gray-500">{p.user}</td>
                <td className="px-4 py-2.5">
                  <span className="inline-flex items-center gap-1 text-blue-300 bg-blue-950/40 border border-blue-900/40 rounded-full px-2 py-0.5">
                    <Network className="w-2.5 h-2.5" />{p.connections}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <Badge variant={p.status === 'suspect' ? 'critical' : 'default'}>{p.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
