import { useState, useEffect } from 'react'
import { Users, BedDouble, Stethoscope, AlertTriangle, HeartPulse, Activity, TrendingUp, Clock, Shield, Brain } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts'

const triageDistribution = [
  { name: 'Critical', value: 3, color: '#c53030' },
  { name: 'Emergency', value: 8, color: '#dd6b20' },
  { name: 'Urgent', value: 15, color: '#b7791f' },
  { name: 'Semi-Urgent', value: 22, color: '#1f7a8c' },
  { name: 'Non-Urgent', value: 12, color: '#2f855a' },
]

const hourlyAdmissions = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  admissions: Math.floor(Math.random() * 8) + 1,
  discharges: Math.floor(Math.random() * 6) + 1,
}))

const bedTrend = Array.from({ length: 12 }, (_, i) => ({
  time: `${i * 2}:00`,
  occupancy: 72 + Math.floor(Math.random() * 15),
}))

const recentAlerts = [
  { id: 1, patient: 'John Miller', type: 'Deterioration', severity: 'critical', msg: 'NEWS2 score 9 — rapid decline in SpO2', time: '2 min ago' },
  { id: 2, patient: 'Sarah Chen', type: 'Drug Interaction', severity: 'high', msg: 'Warfarin + Aspirin — major bleeding risk', time: '8 min ago' },
  { id: 3, patient: 'Robert Lee', type: 'Critical Vital', severity: 'critical', msg: 'Heart rate 142 bpm — tachycardia alert', time: '15 min ago' },
  { id: 4, patient: 'Emily Davis', type: 'Sepsis Risk', severity: 'high', msg: 'qSOFA score 2 — sepsis screening triggered', time: '22 min ago' },
]

const TT = { backgroundColor: '#fff', border: '1px solid #e4ebf3', borderRadius: '8px', color: '#1a202c', boxShadow: '0 4px 16px rgba(20,30,60,.08)' }

export default function Dashboard() {
  const [time, setTime] = useState(new Date())
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t) }, [])

  const stats = [
    { label: 'Total Patients', value: '247', change: '+12 today', icon: Users, color: 'text-primary-500', bg: 'bg-primary-50' },
    { label: 'Bed Occupancy', value: '82%', change: '164/200 beds', icon: BedDouble, color: 'text-accent-500', bg: 'bg-accent-50' },
    { label: 'Triage Queue', value: '6', change: '2 critical', icon: Stethoscope, color: 'text-warning-500', bg: 'bg-warning-50' },
    { label: 'Active Alerts', value: '4', change: '2 life-threatening', icon: AlertTriangle, color: 'text-danger-500', bg: 'bg-danger-50' },
    { label: 'AI Predictions', value: '1,842', change: 'Today', icon: Brain, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Avg Response', value: '4.2m', change: '-18% this week', icon: Clock, color: 'text-primary-500', bg: 'bg-primary-50' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-heading">Hospital Command Center</h1>
          <p className="text-muted text-sm mt-1">Real-time AI-powered hospital intelligence</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-mono text-heading">{time.toLocaleTimeString()}</p>
            <p className="text-xs text-muted">{time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="w-3 h-3 bg-accent-500 rounded-full animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map(s => (
          <div key={s.label} className="card-hover">
            <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-heading">{s.value}</p>
            <p className="text-xs text-muted mt-0.5">{s.label}</p>
            <p className={`text-xs mt-1 ${s.color}`}>{s.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-heading"><Stethoscope className="w-4 h-4 text-primary-500" /> Triage Distribution (24h)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={triageDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {triageDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={TT} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {triageDistribution.map(d => (
              <span key={d.name} className="flex items-center gap-1.5 text-xs text-muted">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} /> {d.name}: {d.value}
              </span>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-heading"><BedDouble className="w-4 h-4 text-accent-500" /> Bed Occupancy Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={bedTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4ebf3" />
              <XAxis dataKey="time" tick={{ fill: '#5a6b82', fontSize: 11 }} />
              <YAxis tick={{ fill: '#5a6b82', fontSize: 11 }} domain={[60, 100]} />
              <Tooltip contentStyle={TT} />
              <Area type="monotone" dataKey="occupancy" stroke="#2f855a" fill="#2f855a" fillOpacity={0.08} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-heading"><TrendingUp className="w-4 h-4 text-warning-500" /> Admissions vs Discharges</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={hourlyAdmissions.slice(0, 12)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4ebf3" />
              <XAxis dataKey="hour" tick={{ fill: '#5a6b82', fontSize: 11 }} />
              <YAxis tick={{ fill: '#5a6b82', fontSize: 11 }} />
              <Tooltip contentStyle={TT} />
              <Bar dataKey="admissions" fill="#1f7a8c" radius={[3, 3, 0, 0]} />
              <Bar dataKey="discharges" fill="#2f855a" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-4 flex items-center gap-2 text-heading">
          <AlertTriangle className="w-4 h-4 text-danger-500" /> Live Clinical Alerts
          <span className="ml-auto badge-critical">4 Active</span>
        </h3>
        <div className="space-y-3">
          {recentAlerts.map(a => (
            <div key={a.id} className={`flex items-start gap-4 p-3 rounded-lg border ${a.severity === 'critical' ? 'border-danger-500/20 bg-danger-50' : 'border-warning-500/20 bg-warning-50'}`}>
              <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${a.severity === 'critical' ? 'bg-danger-500 animate-pulse' : 'bg-warning-500'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-heading">{a.patient}</span>
                  <span className={`badge-${a.severity}`}>{a.type}</span>
                </div>
                <p className="text-sm text-muted mt-0.5">{a.msg}</p>
              </div>
              <span className="text-xs text-muted shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
