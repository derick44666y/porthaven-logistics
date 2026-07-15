import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as apiLogin, signup as apiSignup } from '@/api'

export default function AuthPage({ mode: initialMode }: { mode: 'login' | 'signup' }) {
  const [tab, setTab] = useState<'login' | 'signup'>(initialMode)
  const [name, setName] = useState('')
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
      if (tab === 'login') {
        const data = await apiLogin(email, password)
        navigate(data.user.role === 'ADMIN' ? '/admin' : '/dashboard')
      } else {
        if (!name.trim()) { setError('Please enter your full name.'); setLoading(false); return }
        if (password.length < 6) { setError('Password must be at least 6 characters.'); setLoading(false); return }
        const data = await apiSignup(name.trim(), email, password)
        navigate('/dashboard')
      }
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
          {/* Tabs */}
          <div className="grid grid-cols-2 border-b border-slate-100">
            <button onClick={() => setTab('login')} className={`py-3.5 text-sm font-semibold transition-colors ${tab === 'login' ? 'bg-navy text-white' : 'text-slate-500 hover:text-navy'}`}>Sign In</button>
            <button onClick={() => setTab('signup')} className={`py-3.5 text-sm font-semibold transition-colors ${tab === 'signup' ? 'bg-navy text-white' : 'text-slate-500 hover:text-navy'}`}>Create Account</button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
            <h2 className="font-display text-2xl font-bold text-navy">
              {tab === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>

            {tab === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Sarah Johnson" required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-sky" />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-sky" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={tab === 'signup' ? 'Min. 6 characters' : '••••••••'} required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-sky" />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-ember hover:bg-orange-400 disabled:opacity-60 text-white py-3.5 rounded-xl font-bold text-base transition-colors shadow-sm mt-2">
              {loading ? 'Please wait...' : tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-4">
          {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => setTab(tab === 'login' ? 'signup' : 'login')} className="text-sky font-semibold hover:text-sky-muted">
            {tab === 'login' ? 'Sign up free' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}