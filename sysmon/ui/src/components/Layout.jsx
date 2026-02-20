import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Server } from 'lucide-react'
import { LayoutDashboard, List, Zap, Info, LogOut, Activity } from 'lucide-react'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/processes', icon: List,            label: 'Processes' },
  { to: '/spikes',    icon: Zap,             label: 'Spikes'    },
  { to: '/info',      icon: Info,            label: 'System Info'},
  { to: '/servers',   icon: Server,          label: 'Servers' },
]

export default function Layout({ children }) {
  const { logout } = useAuth()

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="w-56 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-800">
          <Activity className="w-5 h-5 text-blue-400" />
          <span className="text-white font-semibold text-sm tracking-wide">SysMon</span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-800">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
