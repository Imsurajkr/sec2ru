import { ArrowRight } from 'lucide-react'

const STEPS = [
  { n:'01', title:'Drop the binary',    desc:'Copy sec2ru to any Linux or Windows server. No dependencies, no Docker required.',     code:'scp sec2ru user@server:~/' },
  { n:'02', title:'Start the agent',    desc:'The agent auto-discovers your OS, attaches eBPF probes, and starts collecting data.',  code:'./sec2ru --config config.yaml' },
  { n:'03', title:'Open the dashboard', desc:'Visit :7070 in your browser — or open the Windows desktop app. Instant visibility.',   code:'open http://localhost:7070' },
  { n:'04', title:'Get alerted',        desc:'Configure Slack/email in one line. sec2ru tells you the moment something unexpected happens.', code:'slack_webhook: "https://hooks.slack.com/..."' },
]

export default function HowItWorks({ onEnterDemo }) {
  return (
    <section className="py-24 border-t border-gray-800/50 bg-gray-900/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Up in 30 seconds.</h2>
          <p className="text-gray-400 text-lg">No YAML stacks. No Helm charts. No Grafana datasources to configure.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-12">
          {STEPS.map((s, i) => (
            <div key={s.n} className="relative">
              {i < STEPS.length - 1 && (
                <ArrowRight className="hidden xl:block absolute -right-2 top-6 w-4 h-4 text-gray-700 z-10" />
              )}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 h-full">
                <span className="text-4xl font-bold text-gray-800 font-mono">{s.n}</span>
                <h3 className="text-sm font-semibold text-white mt-3 mb-2">{s.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-3">{s.desc}</p>
                <code className="text-xs text-green-400 font-mono bg-gray-800 rounded px-2 py-1 block">{s.code}</code>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={onEnterDemo}
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105"
          >
            See the dashboard in action
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
