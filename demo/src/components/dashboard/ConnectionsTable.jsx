import Badge from '../../ui/Badge'
import { connections } from '../../data/mockData'

const stateColor = s => ({ ESTABLISHED:'text-green-400', LISTEN:'text-blue-400', TIME_WAIT:'text-yellow-400' })[s] ?? 'text-gray-400'

export default function ConnectionsTable() {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Active Connections</h3>
        <span className="text-xs text-gray-500">{connections.length} shown</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-800">
              {['Process','Proto','Local','Remote','State','Category'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {connections.map((c, i) => (
              <tr key={i} className={`hover:bg-gray-800/30 transition-colors ${c.category === 'unknown' ? 'bg-red-950/10' : ''}`}>
                <td className="px-4 py-2.5 text-gray-200 font-mono font-medium">{c.process}</td>
                <td className="px-4 py-2.5 text-gray-500 uppercase">{c.proto}</td>
                <td className="px-4 py-2.5 text-gray-400 font-mono text-xs">{c.laddr}</td>
                <td className={`px-4 py-2.5 font-mono text-xs ${c.category === 'unknown' ? 'text-red-400' : 'text-gray-300'}`}>
                  {c.raddr === '*:*' ? <span className="text-gray-600">—</span> : c.raddr}
                </td>
                <td className={`px-4 py-2.5 font-medium ${stateColor(c.status)}`}>{c.status}</td>
                <td className="px-4 py-2.5">
                  <Badge variant={c.category === 'unknown' ? 'critical' : 'default'}>{c.category}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
