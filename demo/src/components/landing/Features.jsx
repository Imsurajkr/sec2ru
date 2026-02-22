import { Shield, Network, Eye, Terminal, Clock, Zap, GitBranch, Bell } from 'lucide-react'

const FEATURES = [
  { icon: Zap,       color: 'text-yellow-400 bg-yellow-400/10', title: 'eBPF + XDP Filtering',      desc: 'Attach probes at kernel level. Filter and inspect packets at 0.8μs latency — before they reach userspace.' },
  { icon: Eye,       color: 'text-blue-400 bg-blue-400/10',     title: 'Process ↔ Port Mapping',    desc: 'See exactly which process owns which port and every remote IP it talks to. Real-time, zero config.' },
  { icon: Network,   color: 'text-cyan-400 bg-cyan-400/10',     title: 'Service Topology',          desc: 'Auto-discover your service dependency graph from connection data. No instrumentation. No service mesh required.' },
  { icon: GitBranch, color: 'text-purple-400 bg-purple-400/10', title: 'Drift Detection',           desc: '"git diff for your server." Know the moment a new port opens, process appears, or config changes.' },
  { icon: Clock,     color: 'text-green-400 bg-green-400/10',   title: 'Forensic Timeline',         desc: 'Scroll back 90 days. See every process, command, and connection at any point in time. Incident response in seconds.' },
  { icon: Terminal,  color: 'text-orange-400 bg-orange-400/10', title: 'Sysmon / Falco Rules',      desc: 'Catch encoded PowerShell, curl|bash, LOLBins, and unknown processes with a simple YAML rule engine.' },
  { icon: Shield,    color: 'text-red-400 bg-red-400/10',       title: 'CIS Posture Checks',        desc: 'Continuous hardening assessment — firewall, SSH config, MFA, auto-updates — with a human-readable score.' },
  { icon: Bell,      color: 'text-pink-400 bg-pink-400/10',     title: 'Smart Alerts',              desc: 'Slack and email alerts that explain themselves: not just "CPU spike" but the full process + network chain.' },
]

export default function Features() {
  return (
    <section className="py-24 border-t border-gray-800/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Everything below your APM.<br />
            <span className="gradient-text">Nothing above your budget.</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            sec2ru watches the OS layer that Datadog and SigNoz can't see.
            The runtime truth, not just the configured state.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {FEATURES.map(f => (
            <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors group">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${f.color}`}>
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
