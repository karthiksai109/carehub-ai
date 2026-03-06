import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, Mail, Lock, ArrowRight } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@carehub.ai')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    localStorage.setItem('carehub_token', 'demo-token')
    localStorage.setItem('carehub_user', JSON.stringify({ email, role: 'admin', name: 'Dr. Admin' }))
    setTimeout(() => navigate('/'), 500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#0f172a] flex items-center justify-center">
      <div className="bg-white rounded-2xl p-10 max-w-md w-[92%] shadow-2xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary-500 flex items-center justify-center mx-auto mb-4">
          <Activity className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-primary-500 tracking-wide mb-1">CareHub AI</h1>
        <p className="text-[11px] text-muted mb-1">Intelligent Hospital Command Center</p>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-50 border border-accent-200 rounded-full text-[10px] text-accent-500 font-semibold mb-6">
          <span className="w-1.5 h-1.5 bg-accent-500 rounded-full animate-pulse" /> 24/7 AI-Powered
        </div>

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

        <div className="flex items-start gap-2 p-3 bg-accent-50 border border-accent-200 rounded-lg text-[10px] text-accent-700 text-left leading-relaxed mt-5">
          <span className="mt-0.5">🔒</span>
          <span>All data is processed locally with end-to-end encryption. Zero-knowledge architecture ensures complete patient privacy.</span>
        </div>

        <p className="text-muted text-[10px] text-center mt-4">Demo Mode — Use any credentials to explore</p>
      </div>
    </div>
  )
}
