import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Activity, Mail, Lock, ArrowRight, User, Phone, Calendar, Heart, BadgeCheck, Stethoscope, ShieldCheck, Users } from 'lucide-react'
import { useAuth, UserRole } from '../context/AuthContext'

const roles: { value: UserRole; label: string; icon: any; desc: string }[] = [
  { value: 'patient', label: 'Patient', icon: User, desc: 'Book appointments, view records, track health' },
  { value: 'doctor', label: 'Doctor', icon: Stethoscope, desc: 'Manage patients, AI triage, clinical tools' },
  { value: 'nurse', label: 'Nurse', icon: Heart, desc: 'Monitor vitals, bed management, patient care' },
  { value: 'admin', label: 'Admin', icon: ShieldCheck, desc: 'Full system access, analytics, operations' },
]

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<UserRole>('patient')
  const [dob, setDob] = useState('')
  const [bloodGroup, setBloodGroup] = useState('')
  const [medicalId, setMedicalId] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)

  const handleSubmit = async () => {
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    if (!agreeTerms) { setError('Please agree to the terms'); return }
    setError('')
    setLoading(true)
    try {
      await register({ firstName, lastName, email, phone, password, role, dob, bloodGroup, medicalId })
      navigate(role === 'patient' ? '/portal' : '/')
    } catch { setError('Registration failed. Try again.') }
    setLoading(false)
  }

  const canProceedStep1 = firstName.trim() && lastName.trim() && email.trim() && phone.trim()
  const canProceedStep2 = password.length >= 6 && password === confirmPassword
  const canSubmit = agreeTerms

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#0f172a] flex items-center justify-center py-8 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-primary-500 px-8 py-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide">Create Your Account</h1>
          <p className="text-primary-100 text-xs mt-1">Join CareHub AI — Intelligent Hospital Platform</p>
        </div>

        {/* Progress */}
        <div className="flex items-center px-8 pt-5 pb-2">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex-1 flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step >= s ? 'bg-primary-500 text-white' : 'bg-gray-100 text-muted'
              }`}>{s}</div>
              {s < 3 && <div className={`flex-1 h-0.5 mx-2 transition-all ${step > s ? 'bg-primary-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
        <div className="flex justify-between px-8 mb-4">
          <span className="text-[10px] text-muted">Personal Info</span>
          <span className="text-[10px] text-muted">Security</span>
          <span className="text-[10px] text-muted">Role & Confirm</span>
        </div>

        <div className="px-8 pb-8">
          {error && (
            <div className="mb-4 p-3 bg-danger-50 border border-danger-200 rounded-lg text-danger-500 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted mb-1.5 block font-medium">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input value={firstName} onChange={e => setFirstName(e.target.value)}
                      className="input-field pl-10" placeholder="John" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted mb-1.5 block font-medium">Last Name</label>
                  <input value={lastName} onChange={e => setLastName(e.target.value)}
                    className="input-field" placeholder="Doe" />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted mb-1.5 block font-medium">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="input-field pl-10" placeholder="john.doe@email.com" />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted mb-1.5 block font-medium">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    className="input-field pl-10" placeholder="+1 (555) 000-0000" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted mb-1.5 block font-medium">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input type="date" value={dob} onChange={e => setDob(e.target.value)}
                      className="input-field pl-10" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted mb-1.5 block font-medium">Blood Group</label>
                  <select value={bloodGroup} onChange={e => setBloodGroup(e.target.value)} className="input-field">
                    <option value="">Select</option>
                    {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={() => setStep(2)} disabled={!canProceedStep1}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-sm disabled:opacity-40">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2: Password */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted mb-1.5 block font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    className="input-field pl-10" placeholder="Minimum 6 characters" />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted mb-1.5 block font-medium">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    className="input-field pl-10" placeholder="Re-enter password" />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-danger-500 text-[10px] mt-1">Passwords do not match</p>
                )}
              </div>
              {/* Password strength */}
              <div className="space-y-1.5">
                <p className="text-[10px] text-muted font-medium">Password strength</p>
                <div className="flex gap-1.5">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`flex-1 h-1.5 rounded-full ${
                      password.length >= i * 3 ? (password.length >= 10 ? 'bg-accent-500' : password.length >= 7 ? 'bg-warning-500' : 'bg-danger-500') : 'bg-gray-200'
                    }`} />
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-ghost flex-1 py-3 text-sm">Back</button>
                <button onClick={() => setStep(3)} disabled={!canProceedStep2}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 text-sm disabled:opacity-40">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Role & Confirm */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted mb-2 block font-medium">I am registering as a</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {roles.map(r => (
                    <button key={r.value} onClick={() => setRole(r.value)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        role === r.value ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500/30' : 'border-border hover:border-primary-200'
                      }`}>
                      <r.icon className={`w-5 h-5 mb-1.5 ${role === r.value ? 'text-primary-500' : 'text-muted'}`} />
                      <p className={`text-sm font-semibold ${role === r.value ? 'text-primary-500' : 'text-heading'}`}>{r.label}</p>
                      <p className="text-[10px] text-muted leading-tight mt-0.5">{r.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {(role === 'doctor' || role === 'nurse') && (
                <div>
                  <label className="text-xs text-muted mb-1.5 block font-medium">Medical License / Staff ID</label>
                  <div className="relative">
                    <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input value={medicalId} onChange={e => setMedicalId(e.target.value)}
                      className="input-field pl-10" placeholder="e.g. MD-2026-XXXXX" />
                  </div>
                </div>
              )}

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500" />
                <span className="text-xs text-muted leading-relaxed">
                  I agree to the <span className="text-primary-500 font-medium">Terms of Service</span> and <span className="text-primary-500 font-medium">Privacy Policy</span>. I understand my health data will be processed securely.
                </span>
              </label>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-ghost flex-1 py-3 text-sm">Back</button>
                <button onClick={handleSubmit} disabled={!canSubmit || loading}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 text-sm disabled:opacity-40">
                  {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            </div>
          )}

          <p className="text-center text-xs text-muted mt-5">
            Already have an account? <Link to="/login" className="text-primary-500 font-semibold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
