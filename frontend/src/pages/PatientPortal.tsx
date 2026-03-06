import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  Calendar, FileText, HeartPulse, Pill, Clock, Phone,
  AlertTriangle, ChevronRight, Plus, Activity, User, Bell
} from 'lucide-react'

const upcomingAppointments = [
  { id: '1', doctor: 'Dr. Sarah Smith', specialty: 'Cardiology', date: '2026-03-10', time: '10:30 AM', type: 'Follow-up', status: 'confirmed' },
  { id: '2', doctor: 'Dr. James Patel', specialty: 'General Medicine', date: '2026-03-15', time: '2:00 PM', type: 'Check-up', status: 'pending' },
  { id: '3', doctor: 'Dr. Lisa Chen', specialty: 'Dermatology', date: '2026-03-22', time: '11:00 AM', type: 'Consultation', status: 'confirmed' },
]

const recentVitals = {
  heartRate: 78, spo2: 98, bp: '120/80', temp: 36.8, weight: 72, lastChecked: '2 hours ago'
}

const medications = [
  { name: 'Metformin 500mg', dosage: 'Twice daily', refillDate: '2026-03-20', status: 'active' },
  { name: 'Lisinopril 10mg', dosage: 'Once daily', refillDate: '2026-04-01', status: 'active' },
  { name: 'Vitamin D3 1000IU', dosage: 'Once daily', refillDate: '2026-03-25', status: 'active' },
]

const recentRecords = [
  { id: '1', type: 'Lab Report', name: 'Complete Blood Count (CBC)', date: '2026-02-28', status: 'ready' },
  { id: '2', type: 'Imaging', name: 'Chest X-Ray', date: '2026-02-20', status: 'ready' },
  { id: '3', type: 'Lab Report', name: 'Lipid Panel', date: '2026-02-15', status: 'ready' },
  { id: '4', type: 'Prescription', name: 'Medication Renewal', date: '2026-02-10', status: 'ready' },
]

export default function PatientPortal() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'records' | 'medications'>('overview')

  const tabs = [
    { key: 'overview', label: 'Overview', icon: Activity },
    { key: 'appointments', label: 'Appointments', icon: Calendar },
    { key: 'records', label: 'Medical Records', icon: FileText },
    { key: 'medications', label: 'Medications', icon: Pill },
  ] as const

  return (
    <div className="min-h-screen bg-page">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-primary-500 text-lg leading-tight">CareHub AI</h1>
              <p className="text-[10px] text-muted uppercase tracking-widest">Patient Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-muted hover:text-heading transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2.5 px-3 py-2 bg-gray-50 border border-border rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-xs font-bold text-white">
                {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'P'}
              </div>
              <div>
                <p className="text-xs font-semibold text-heading">{user?.name || 'Patient'}</p>
                <p className="text-[10px] text-muted">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Welcome */}
        <div className="card mb-6 bg-gradient-to-r from-primary-500 to-primary-700 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Welcome back, {user?.name?.split(' ')[0] || 'Patient'}</h2>
              <p className="text-primary-100 text-sm mt-1">Here's your health summary for today</p>
            </div>
            <div className="flex gap-3">
              <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <Phone className="w-4 h-4" /> Emergency: 911
              </button>
              <button className="bg-white text-primary-500 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-50 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" /> Book Appointment
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all border flex items-center gap-2 ${
                activeTab === t.key
                  ? 'border-primary-500/40 bg-primary-50 text-primary-500'
                  : 'border-border bg-white text-muted hover:border-primary-200'
              }`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Vitals Summary */}
            <div>
              <h3 className="font-semibold text-heading mb-3 flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-danger-500" /> Latest Vitals
                <span className="text-[10px] text-muted font-normal ml-auto">{recentVitals.lastChecked}</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { label: 'Heart Rate', value: `${recentVitals.heartRate}`, unit: 'bpm', color: 'text-danger-500' },
                  { label: 'SpO2', value: `${recentVitals.spo2}`, unit: '%', color: 'text-primary-500' },
                  { label: 'Blood Pressure', value: recentVitals.bp, unit: 'mmHg', color: 'text-accent-500' },
                  { label: 'Temperature', value: `${recentVitals.temp}`, unit: '°C', color: 'text-warning-500' },
                  { label: 'Weight', value: `${recentVitals.weight}`, unit: 'kg', color: 'text-primary-600' },
                ].map(v => (
                  <div key={v.label} className="card text-center">
                    <p className="text-xs text-muted mb-1">{v.label}</p>
                    <p className={`text-2xl font-bold ${v.color}`}>{v.value}</p>
                    <p className="text-[10px] text-muted">{v.unit}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div>
              <h3 className="font-semibold text-heading mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary-500" /> Upcoming Appointments
              </h3>
              <div className="space-y-2.5">
                {upcomingAppointments.slice(0, 2).map(a => (
                  <div key={a.id} className="card flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-heading">{a.doctor}</p>
                        <p className="text-xs text-muted">{a.specialty} — {a.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-heading">{a.date}</p>
                      <p className="text-xs text-muted">{a.time}</p>
                    </div>
                    <span className={`badge ${a.status === 'confirmed' ? 'bg-accent-50 text-accent-500 border border-accent-200' : 'bg-warning-50 text-warning-500 border border-warning-200'}`}>
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Medications */}
            <div>
              <h3 className="font-semibold text-heading mb-3 flex items-center gap-2">
                <Pill className="w-4 h-4 text-accent-500" /> Current Medications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {medications.map(m => (
                  <div key={m.name} className="card">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-semibold text-heading">{m.name}</p>
                      <span className="badge bg-accent-50 text-accent-500 border border-accent-200">{m.status}</span>
                    </div>
                    <p className="text-xs text-muted">{m.dosage}</p>
                    <p className="text-[10px] text-muted mt-1">Refill by: {m.refillDate}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-heading">All Appointments</h3>
              <button className="btn-primary flex items-center gap-2 text-sm"><Plus className="w-4 h-4" /> Book New</button>
            </div>
            <div className="space-y-2.5">
              {upcomingAppointments.map(a => (
                <div key={a.id} className="card flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                    <Calendar className="w-6 h-6 text-primary-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-heading">{a.doctor}</p>
                      <span className={`badge text-[10px] ${a.status === 'confirmed' ? 'bg-accent-50 text-accent-500 border border-accent-200' : 'bg-warning-50 text-warning-500 border border-warning-200'}`}>{a.status}</span>
                    </div>
                    <p className="text-xs text-muted mt-0.5">{a.specialty} — {a.type}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-heading">{a.date}</p>
                    <p className="text-xs text-muted flex items-center gap-1 justify-end"><Clock className="w-3 h-3" /> {a.time}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Medical Records Tab */}
        {activeTab === 'records' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-heading">Medical Records</h3>
            <div className="space-y-2.5">
              {recentRecords.map(r => (
                <div key={r.id} className="card flex items-center gap-4 cursor-pointer hover:border-primary-200 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-primary-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-heading">{r.name}</p>
                    <p className="text-xs text-muted">{r.type} — {r.date}</p>
                  </div>
                  <span className="badge bg-accent-50 text-accent-500 border border-accent-200">{r.status}</span>
                  <ChevronRight className="w-4 h-4 text-muted shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Medications Tab */}
        {activeTab === 'medications' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-heading">Current Medications</h3>
            <div className="space-y-2.5">
              {medications.map(m => (
                <div key={m.name} className="card flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent-50 flex items-center justify-center shrink-0">
                    <Pill className="w-5 h-5 text-accent-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-heading">{m.name}</p>
                    <p className="text-xs text-muted">{m.dosage}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="badge bg-accent-50 text-accent-500 border border-accent-200">{m.status}</span>
                    <p className="text-[10px] text-muted mt-1">Refill: {m.refillDate}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="card border-warning-200 bg-warning-50">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-warning-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-warning-500">Medication Reminder</p>
                  <p className="text-xs text-muted mt-0.5">Metformin 500mg refill is due in 14 days. Contact your pharmacy or request a refill through the portal.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
