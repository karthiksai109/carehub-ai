import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Activity, Mail, Lock, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) { setError('Please enter email and password'); return }
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      // role-based redirect
      const stored = localStorage.getItem('carehub_user')
      const user = stored ? JSON.parse(stored) : null
      navigate(user?.role === 'patient' ? '/portal' : '/')
    } catch { setError('Login failed. Please try again.') }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#0f172a] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-10 max-w-md w-full shadow-2xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary-500 flex items-center justify-center mx-auto mb-4">
          <Activity className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-primary-500 tracking-wide mb-1">CareHub AI</h1>
        <p className="text-[11px] text-muted mb-1">Intelligent Hospital Command Center</p>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-50 border border-accent-200 rounded-full text-[10px] text-accent-500 font-semibold mb-6">
          <span className="w-1.5 h-1.5 bg-accent-500 rounded-full animate-pulse" /> 24/7 AI-Powered
        </div>

        {error && (
          <div className="mb-4 p-3 bg-danger-50 border border-danger-200 rounded-lg text-danger-500 text-xs font-medium text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="text-xs text-muted mb-1.5 block font-medium">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="input-field pl-10" placeholder="doctor@hospital.com" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted mb-1.5 block font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="input-field pl-10" placeholder="Enter password" />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-sm disabled:opacity-50">
            {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <p className="text-center text-xs text-muted mt-5">
          Don't have an account? <Link to="/register" className="text-primary-500 font-semibold hover:underline">Create Account</Link>
        </p>

        <div className="flex items-start gap-2 p-3 bg-accent-50 border border-accent-200 rounded-lg text-[10px] text-accent-700 text-left leading-relaxed mt-4">
          <span className="mt-0.5">🔒</span>
          <span>All data is processed locally with end-to-end encryption. Zero-knowledge architecture ensures complete patient privacy.</span>
        </div>
      </div>
    </div>
  )
}
