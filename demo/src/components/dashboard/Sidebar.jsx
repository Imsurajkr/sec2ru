import { LayoutDashboard, Network, Activity, Shield, Server, Cpu, ArrowLeft, Zap } from 'lucide-react'

const NAV = [
  { id:'Overview',     icon: LayoutDashboard, label: 'Overview'    },
  { id:'Processes',    icon: Cpu,             label: 'Processes'   },
  { id:'Connections',  icon: Network,         label: 'Connections' },
  { id:'Packets',      icon: Zap,             label: 'Packets'     },
  { id:'Security',     icon: Shield,          label: 'Security'    },
  { id:'Servers',      icon: Server,          label: 'Servers'     },
]

export default function Sidebar({ active, onNav, onBack }) {
  return (
    <aside className="w-16 xl:w-52 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center shrink-0">
          <Shield className="w-4 h-4 text-brand-400" />
        </div>
        <span className="hidden xl:block font-bold text-white text-sm">sec2ru</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(n => (
          <button
            key={n.id}
            onClick={() => onNav(n.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              active === n.id
                ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
            }`}
          >
            <n.icon className="w-4 h-4 shrink-0" />
            <span className="hidden xl:block">{n.label}</span>
          </button>
        ))}
      </nav>

      {/* Back */}
      <div className="p-3 border-t border-gray-800">
        <button
          onClick={onBack}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-gray-600 hover:text-gray-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span className="hidden xl:block">Back to site</span>
        </button>
      </div>
    </aside>
  )
}
