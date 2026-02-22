import { Check, ArrowRight } from 'lucide-react'

const PLANS = [
  {
    name: 'Solo',
    price: 'Free',
    sub: 'forever',
    highlight: false,
    features: ['1 machine', '24h history', 'Basic dashboard', 'Process + port mapping', 'Community support'],
    cta: 'Get started free',
  },
  {
    name: 'Pro',
    price: '$12',
    sub: '/month',
    highlight: true,
    features: ['5 machines', '90-day forensic timeline', 'Slack + email alerts', 'Drift detection', 'App traffic analysis', 'Security audit rules', 'CIS posture score'],
    cta: 'Start free trial',
  },
  {
    name: 'Team',
    price: '$29',
    sub: '/month',
    highlight: false,
    features: ['Unlimited machines', 'Service topology map', 'Cloud connector (AWS/GCP)', 'Multi-user + RBAC', 'Compliance PDF reports', 'Priority support', 'MSP white-label'],
    cta: 'Talk to us',
  },
]

export default function Pricing({ onEnterDemo }) {
  return (
    <section className="py-24 border-t border-gray-800/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            CrowdStrike visibility.<br />
            <span className="gradient-text">Not CrowdStrike pricing.</span>
          </h2>
          <p className="text-gray-400 text-lg">Enterprise EDR costs $60–$100/endpoint/month. sec2ru: $12/month for 5 machines.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map(p => (
            <div
              key={p.name}
              className={`rounded-2xl border p-6 flex flex-col ${
                p.highlight
                  ? 'bg-brand-900/30 border-brand-500/50 glow-border'
                  : 'bg-gray-900 border-gray-800'
              }`}
            >
              {p.highlight && (
                <div className="text-xs text-brand-400 font-medium mb-3 bg-brand-900/40 border border-brand-500/30 rounded-full px-3 py-1 inline-block self-start">
                  Most popular
                </div>
              )}
              <h3 className="text-lg font-bold text-white">{p.name}</h3>
              <div className="flex items-baseline gap-1 mt-2 mb-6">
                <span className="text-4xl font-bold text-white">{p.price}</span>
                <span className="text-gray-400 text-sm">{p.sub}</span>
              </div>

              <ul className="space-y-2.5 flex-1 mb-8">
                {p.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-300">{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={onEnterDemo}
                className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                  p.highlight
                    ? 'bg-brand-500 hover:bg-brand-600 text-white hover:scale-105'
                    : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
                }`}
              >
                {p.cta}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
