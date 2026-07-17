import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as apiLogin } from '@/api'

export default function AuthPage({ onAuthChange }: { onAuthChange?: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await apiLogin(email, password)
      onAuthChange?.()
      navigate(data.user.role === 'ADMIN' ? '/admin' : '/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/">
            <div className="h-16 w-16 bg-gradient-to-br from-sky to-navy-light rounded-lg flex items-center justify-center text-white font-display font-bold text-2xl mx-auto mb-3">
              PH
            </div>
            <div>
              <span className="font-display text-2xl font-bold text-navy">PORT</span>
              <span className="font-display text-2xl font-bold text-sky">HAVEN</span>
            </div>
            <div className="text-xs text-slate-400 tracking-widest uppercase mt-0.5">Delivering Trust. Delivering More.</div>
          </a>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
            <h2 className="font-display text-2xl font-bold text-navy">
              Staff sign in
            </h2>
            <p className="text-sm text-slate-500">Accounts are created by an administrator.</p>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-sky" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-sky" />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-ember hover:bg-orange-400 disabled:opacity-60 text-white py-3.5 rounded-xl font-bold text-base transition-colors shadow-sm mt-2">
              {loading ? 'Please wait...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
