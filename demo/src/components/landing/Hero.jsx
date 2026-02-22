import { useState, useEffect } from 'react'
import { Shield, Zap, Eye, Terminal, ArrowRight, Github } from 'lucide-react'

const TERMINAL_LINES = [
  '$ sec2ru start --mode agent',
  '✓ eBPF probe attached to eth0',
  '✓ XDP filter loaded — 0.8μs latency',
  '✓ Agent collecting: CPU | MEM | DISK | NET',
  '✓ 14,872 packets blocked in last 60s',
  '⚡ Suspicious: python3 → 185.220.101.45:4444',
  '⚡ Rule fired: SUSPICIOUS_OUTBOUND [CRITICAL]',
  '✓ Hub sync: 4 nodes online',
  '▋',
]

export default function Hero({ onEnterDemo }) {
  const [lines, setLines] = useState([])

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      if (i < TERMINAL_LINES.length) {
        const line = TERMINAL_LINES[i]
        i++
        setLines(prev => [...prev, line])
      } else {
        clearInterval(interval)
      }
    }, 400)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative overflow-hidden min-h-screen flex items-center">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-cyan-600/8 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* Left — copy */}
        <div className="space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-brand-900/40 border border-brand-500/30 rounded-full px-4 py-1.5 text-xs text-brand-400">
            <Zap className="w-3 h-3" />
            eBPF + XDP · Sub-microsecond packet filtering
          </div>

          <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
            <span className="text-white">Infrastructure</span><br />
            <span className="gradient-text">intelligence</span><br />
            <span className="text-white">you can trust.</span>
          </h1>

          <p className="text-lg text-gray-400 leading-relaxed max-w-xl">
            sec2ru gives you complete visibility over every process, port, connection,
            and network packet — powered by eBPF and XDP. No instrumentation.
            No YAML hell. One binary.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-8">
            {[
              ['0.8μs', 'XDP filter latency'],
              ['~12 MB', 'single binary'],
              ['Zero', 'code changes needed'],
            ].map(([val, label]) => (
              <div key={label}>
                <p className="text-2xl font-bold text-white">{val}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onEnterDemo}
              className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105 hover:shadow-lg hover:shadow-brand-500/25"
            >
              <Eye className="w-4 h-4" />
              View live demo
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="https://github.com/imsurajkr/sec2ru"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all border border-gray-700"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
          </div>
        </div>

        {/* Right — terminal */}
        <div className="glow-border bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          {/* Terminal titlebar */}
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 border-b border-gray-700">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="ml-2 text-xs text-gray-400 font-mono">sec2ru terminal</span>
          </div>
          <div className="p-5 font-mono text-sm min-h-[280px] space-y-1">
            {lines.map((line, i) => (
              <div
                key={i}
                className={`${
                  line.startsWith('⚡') ? 'text-red-400' :
                  line.startsWith('✓') ? 'text-green-400' :
                  line.startsWith('$') ? 'text-brand-400' :
                  line === '▋'         ? 'text-green-400 cursor-blink' :
                  'text-gray-300'
                }`}
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
