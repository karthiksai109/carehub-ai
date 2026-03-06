import { BarChart3, TrendingUp, Users, Activity, Clock, Shield, Stethoscope, HeartPulse } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, RadialBarChart, RadialBar } from 'recharts'

const TT = { backgroundColor: '#fff', border: '1px solid #e4ebf3', borderRadius: '8px', color: '#1a202c', boxShadow: '0 4px 16px rgba(20,30,60,.08)' }

const weeklyTriage = [
  { day: 'Mon', critical: 2, emergency: 5, urgent: 12, semi_urgent: 18, non_urgent: 8 },
  { day: 'Tue', critical: 3, emergency: 7, urgent: 10, semi_urgent: 15, non_urgent: 10 },
  { day: 'Wed', critical: 1, emergency: 4, urgent: 14, semi_urgent: 20, non_urgent: 12 },
  { day: 'Thu', critical: 4, emergency: 6, urgent: 11, semi_urgent: 16, non_urgent: 9 },
  { day: 'Fri', critical: 2, emergency: 8, urgent: 15, semi_urgent: 22, non_urgent: 11 },
  { day: 'Sat', critical: 5, emergency: 9, urgent: 13, semi_urgent: 14, non_urgent: 7 },
  { day: 'Sun', critical: 3, emergency: 6, urgent: 10, semi_urgent: 12, non_urgent: 6 },
]

const deptLoad = [
  { name: 'Emergency', patients: 42, color: '#c53030' },
  { name: 'Cardiology', patients: 28, color: '#b7791f' },
  { name: 'General Med', patients: 65, color: '#1f7a8c' },
  { name: 'Orthopedics', patients: 18, color: '#2f855a' },
  { name: 'Neurology', patients: 15, color: '#165c6e' },
  { name: 'Pediatrics', patients: 12, color: '#276e4b' },
]

const riskDistribution = [
  { name: 'Critical', value: 8, fill: '#c53030' },
  { name: 'High', value: 22, fill: '#dd6b20' },
  { name: 'Medium', value: 45, fill: '#b7791f' },
  { name: 'Low', value: 87, fill: '#1f7a8c' },
  { name: 'Minimal', value: 85, fill: '#2f855a' },
]

const aiMetrics = [
  { name: 'Triage Accuracy', value: 94.2 },
  { name: 'Prediction Rate', value: 91.8 },
  { name: 'Alert Precision', value: 88.5 },
  { name: 'Avg Response', value: 96.1 },
]

const monthlyTrend = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  admissions: Math.floor(Math.random() * 15) + 20,
  discharges: Math.floor(Math.random() * 14) + 18,
  ai_interventions: Math.floor(Math.random() * 10) + 5,
}))

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-heading"><BarChart3 className="w-6 h-6 text-primary-500" /> Analytics & Insights</h1>
        <p className="text-muted text-sm mt-1">Hospital performance metrics and AI system analytics</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Avg Length of Stay', value: '3.2 days', change: '-0.4 vs last month', icon: Clock, color: 'text-primary-500', positive: true },
          { label: 'AI Triage Accuracy', value: '94.2%', change: '+2.1% vs last month', icon: Stethoscope, color: 'text-accent-500', positive: true },
          { label: 'Readmission Rate', value: '4.8%', change: '-1.2% vs last month', icon: TrendingUp, color: 'text-warning-500', positive: true },
          { label: 'Mortality Rate', value: '0.8%', change: '-0.3% vs last month', icon: HeartPulse, color: 'text-danger-500', positive: true },
        ].map(k => (
          <div key={k.label} className="card-hover">
            <div className="flex items-center justify-between mb-2">
              <k.icon className={`w-5 h-5 ${k.color}`} />
              <span className={`text-xs ${k.positive ? 'text-accent-500' : 'text-danger-500'}`}>{k.change}</span>
            </div>
            <p className="text-2xl font-bold">{k.value}</p>
            <p className="text-xs text-muted mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly triage */}
        <div className="card">
          <h3 className="font-semibold mb-4">Weekly Triage Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyTriage}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4ebf3" />
              <XAxis dataKey="day" tick={{ fill: '#5a6b82', fontSize: 11 }} />
              <YAxis tick={{ fill: '#5a6b82', fontSize: 11 }} />
              <Tooltip contentStyle={TT} />
              <Bar dataKey="critical" stackId="a" fill="#c53030" radius={[0, 0, 0, 0]} />
              <Bar dataKey="emergency" stackId="a" fill="#dd6b20" />
              <Bar dataKey="urgent" stackId="a" fill="#b7791f" />
              <Bar dataKey="semi_urgent" stackId="a" fill="#1f7a8c" />
              <Bar dataKey="non_urgent" stackId="a" fill="#2f855a" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Department load */}
        <div className="card">
          <h3 className="font-semibold mb-4">Department Patient Load</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={deptLoad} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e4ebf3" />
              <XAxis type="number" tick={{ fill: '#5a6b82', fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#5a6b82', fontSize: 11 }} width={90} />
              <Tooltip contentStyle={TT} />
              <Bar dataKey="patients" radius={[0, 4, 4, 0]}>
                {deptLoad.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk distribution */}
        <div className="card">
          <h3 className="font-semibold mb-4">Patient Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={riskDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value">
                {riskDistribution.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip contentStyle={TT} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center">
            {riskDistribution.map(d => (
              <span key={d.name} className="flex items-center gap-1.5 text-xs text-muted">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.fill }} /> {d.name}: {d.value}
              </span>
            ))}
          </div>
        </div>

        {/* Monthly trend */}
        <div className="card">
          <h3 className="font-semibold mb-4">30-Day Trend: Admissions vs Discharges vs AI Interventions</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4ebf3" />
              <XAxis dataKey="day" tick={{ fill: '#5a6b82', fontSize: 11 }} />
              <YAxis tick={{ fill: '#5a6b82', fontSize: 11 }} />
              <Tooltip contentStyle={TT} />
              <Line type="monotone" dataKey="admissions" stroke="#1f7a8c" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="discharges" stroke="#2f855a" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="ai_interventions" stroke="#b7791f" strokeWidth={2} dot={false} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Performance */}
      <div className="card">
        <h3 className="font-semibold mb-4 flex items-center gap-2 text-heading"><Shield className="w-4 h-4 text-accent-500" /> AI System Performance Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {aiMetrics.map(m => (
            <div key={m.name} className="bg-white rounded-lg p-4 text-center border border-gray-200">
              <p className="text-3xl font-bold text-accent-500">{m.value}%</p>
              <p className="text-xs text-gray-500 mt-1">{m.name}</p>
              <div className="mt-2 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-accent-600 to-accent-500 rounded-full" style={{ width: `${m.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
