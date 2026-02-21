// Category metadata for UI colours, icons, labels
export const CATEGORIES = {
  browser:  { label: 'Browser',      color: 'bg-blue-900/50 text-blue-300 border-blue-800/50'   },
  'dev-tool':{ label: 'Dev Tools',   color: 'bg-purple-900/50 text-purple-300 border-purple-800/50' },
  infra:    { label: 'Infra',        color: 'bg-cyan-900/50 text-cyan-300 border-cyan-800/50'   },
  terminal: { label: 'Terminal',     color: 'bg-green-900/50 text-green-300 border-green-800/50'},
  system:   { label: 'System',       color: 'bg-gray-800 text-gray-400 border-gray-700'         },
  mail:     { label: 'Mail',         color: 'bg-yellow-900/50 text-yellow-300 border-yellow-800/50'},
  comms:    { label: 'Comms',        color: 'bg-pink-900/50 text-pink-300 border-pink-800/50'   },
  media:    { label: 'Media',        color: 'bg-orange-900/50 text-orange-300 border-orange-800/50'},
  other:    { label: 'Other',        color: 'bg-gray-800 text-gray-500 border-gray-700'         },
}

export function catBadge(category) {
  return CATEGORIES[category] ?? CATEGORIES.other
}

// Severity colour for connection state
export function stateColor(status) {
  switch ((status ?? '').toUpperCase()) {
    case 'ESTABLISHED': return 'text-green-400'
    case 'LISTEN':      return 'text-blue-400'
    case 'TIME_WAIT':   return 'text-yellow-400'
    case 'CLOSE_WAIT':  return 'text-orange-400'
    case 'SYN_SENT':    return 'text-purple-400'
    default:            return 'text-gray-400'
  }
}

// All distinct states for a filter dropdown
export const CONN_STATES = [
  'ESTABLISHED','LISTEN','TIME_WAIT','CLOSE_WAIT','SYN_SENT','CLOSED'
]

// Extract port from "ip:port" string
export function extractPort(addr) {
  if (!addr) return ''
  const parts = addr.split(':')
  return parts[parts.length - 1]
}

// Format bytes into KB/MB/GB
export function fmtBytes(n) {
  if (!n || n === 0) return '0 B'
  const units = ['B','KB','MB','GB','TB']
  const i = Math.floor(Math.log(n) / Math.log(1024))
  return `${(n / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}
