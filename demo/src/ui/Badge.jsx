export default function Badge({ children, variant = 'default' }) {
  const styles = {
    critical: 'bg-red-950/60 text-red-400 border-red-900/50',
    high:     'bg-orange-950/60 text-orange-400 border-orange-900/50',
    medium:   'bg-yellow-950/60 text-yellow-400 border-yellow-900/50',
    low:      'bg-gray-800 text-gray-400 border-gray-700',
    browser:  'bg-blue-950/60 text-blue-300 border-blue-900/50',
    unknown:  'bg-red-950/60 text-red-300 border-red-900/50',
    default:  'bg-gray-800 text-gray-400 border-gray-700',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${styles[variant] ?? styles.default}`}>
      {children}
    </span>
  )
}
