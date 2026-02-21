import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ShieldCheck, AlertCircle } from 'lucide-react'

export default function Login() {
  const { login }   = useAuth()
  const navigate    = useNavigate()
  const [form, setForm]       = useState({ username: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(form.username, form.password)
      navigate('/dashboard', { replace: true })
    } catch {
      setError('Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <ShieldCheck className="w-7 h-7 text-blue-400" />
          <span className="text-xl font-semibold text-white">sec2ru</span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 rounded-2xl border border-gray-800 p-8 space-y-5"
        >
          <div>
            <h1 className="text-lg font-semibold text-white">Sign in</h1>
            <p className="text-sm text-gray-500 mt-1">Monitor your systems</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-950/50 border border-red-900/50 rounded-lg px-3 py-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Username</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="admin"
                required
                autoFocus
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg py-2.5 text-sm font-medium transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
