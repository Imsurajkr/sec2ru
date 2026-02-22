import { useState } from 'react'
import Sidebar           from '../components/dashboard/Sidebar'
import TopBar            from '../components/dashboard/TopBar'
import MetricCard        from '../components/dashboard/MetricCard'
import CpuChart          from '../components/dashboard/CpuChart'
import NetworkChart      from '../components/dashboard/NetworkChart'
import PacketTable       from '../components/dashboard/PacketTable'
import ProcessTable      from '../components/dashboard/ProcessTable'
import ConnectionsTable  from '../components/dashboard/ConnectionsTable'
import SecurityEvents    from '../components/dashboard/SecurityEvents'
import { metrics, nodes } from '../data/mockData'
import { Activity, Cpu, HardDrive, MemoryStick, Network, Shield, Wifi } from 'lucide-react'

const TABS = ['Overview','Processes','Connections','Packets','Security','Servers']

export default function Dashboard({ onBack }) {
  const [tab,     setTab]     = useState('Overview')
  const [sideTab, setSideTab] = useState('Overview')

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <Sidebar active={sideTab} onNav={(t) => { setSideTab(t); setTab(t) }} onBack={onBack} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />

        {/* Demo banner */}
        <div className="bg-brand-900/40 border-b border-brand-500/20 px-6 py-2 flex items-center gap-2">
          <span className="text-xs text-brand-400 font-medium">🎯 DEMO MODE</span>
          <span className="text-xs text-gray-400">— All data is simulated. No backend running.</span>
          <button onClick={onBack} className="ml-auto text-xs text-gray-500 hover:text-white underline">← Back to landing</button>
        </div>

        {/* Tab bar */}
        <div className="border-b border-gray-800 px-6 flex gap-1 bg-gray-950">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setSideTab(t) }}
              className={`px-4 py-3 text-sm transition-colors border-b-2 ${
                tab === t
                  ? 'text-white border-brand-500'
                  : 'text-gray-500 border-transparent hover:text-gray-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {tab === 'Overview' && (
            <>
              {/* Metric cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                <MetricCard icon={Cpu}        label="CPU"             value={`${metrics.cpu.value}%`}          trend={metrics.cpu.trend}         color="blue"   />
                <MetricCard icon={MemoryStick} label="Memory"         value={`${metrics.memory.value}%`}       trend={metrics.memory.trend}      color="purple" />
                <MetricCard icon={HardDrive}  label="Disk"            value={`${metrics.disk.value}%`}         trend={metrics.disk.trend}        color="amber"  />
                <MetricCard icon={Shield}     label="Pkts Blocked"    value={metrics.blocked.value.toLocaleString()} trend={metrics.blocked.trend} color="red" />
                <MetricCard icon={Network}    label="Connections"     value={metrics.connections.value}        trend={metrics.connections.trend} color="cyan"   />
                <MetricCard icon={Activity}   label="Security Events" value={metrics.secEvents.value}          trend={metrics.secEvents.trend}   color="orange" />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <CpuChart />
                <NetworkChart />
              </div>

              {/* Bottom row */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <SecurityEvents limit={4} />
                <PacketTable limit={5} />
              </div>
            </>
          )}

          {tab === 'Processes'   && <ProcessTable />}
          {tab === 'Connections' && <ConnectionsTable />}
          {tab === 'Packets'     && <PacketTable />}
          {tab === 'Security'    && <SecurityEvents />}
          {tab === 'Servers'     && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {nodes.map(n => (
                <div key={n.name} className={`bg-gray-900 rounded-xl border p-5 space-y-4 ${n.online ? 'border-gray-800' : 'border-red-900/40'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Wifi className={`w-3.5 h-3.5 ${n.online ? 'text-green-400' : 'text-red-400'}`} />
                        <span className="text-sm font-semibold text-white">{n.name}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{n.os} · {n.ip}</p>
                    </div>
                    {n.alerts > 0 && <span className="text-xs bg-red-950/50 text-red-400 border border-red-900/50 px-2 py-0.5 rounded-full">{n.alerts} alerts</span>}
                  </div>
                  {n.online && (
                    <div className="space-y-2">
                      {[['CPU', n.cpu, 'bg-blue-500'],['MEM', n.mem, 'bg-purple-500'],['DISK', n.disk, 'bg-amber-500']].map(([lbl, val, col]) => (
                        <div key={lbl} className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-8">{lbl}</span>
                          <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${val >= 90 ? 'bg-red-500' : val >= 70 ? 'bg-yellow-500' : col}`} style={{ width: `${val}%` }} />
                          </div>
                          <span className="text-xs text-gray-400 w-10 text-right tabular-nums">{val}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {!n.online && (
                    <div className="text-center py-4">
                      <p className="text-xs text-red-400">Unreachable</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
