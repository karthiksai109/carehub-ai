import { useState } from 'react'
import { HeartPulse, Thermometer, Wind, Droplets, Brain, Activity, AlertTriangle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

const TT = { backgroundColor: '#fff', border: '1px solid #e4ebf3', borderRadius: '8px', color: '#1a202c', boxShadow: '0 4px 16px rgba(20,30,60,.08)' }

const vitalsTrend = Array.from({ length: 20 }, (_, i) => ({
  time: `${(i * 15) % 60 === 0 ? Math.floor(i * 15 / 60) + 'h' : ''}${(i * 15) % 60}m`,
  hr: 72 + Math.floor(Math.random() * 20) - 5,
  spo2: 97 - Math.floor(Math.random() * 4),
  sbp: 125 + Math.floor(Math.random() * 15) - 7,
  temp: 37.0 + (Math.random() * 0.8 - 0.2),
  rr: 16 + Math.floor(Math.random() * 6) - 2,
}))

const monitoredPatients = [
  { id: '1', name: 'John Miller', bed: 'ICU-204', hr: 88, spo2: 94, sbp: 140, dbp: 88, temp: 37.8, rr: 22, news: 7, risk: 0.82, status: 'critical' },
  { id: '2', name: 'Robert Lee', bed: 'ER-03', hr: 142, spo2: 91, sbp: 95, dbp: 60, temp: 38.9, rr: 28, news: 9, risk: 0.91, status: 'critical' },
  { id: '3', name: 'Michael Brown', bed: 'GEN-305', hr: 78, spo2: 96, sbp: 135, dbp: 82, temp: 37.2, rr: 18, news: 3, risk: 0.35, status: 'stable' },
  { id: '4', name: 'Sarah Chen', bed: 'GEN-112', hr: 92, spo2: 95, sbp: 128, dbp: 78, temp: 37.5, rr: 20, news: 4, risk: 0.55, status: 'watch' },
]

function VitalCard({ label, value, unit, icon: Icon, color, normal }: any) {
  const isAbnormal = !normal
  return (
    <div className={`bg-white rounded-lg p-3 border ${isAbnormal ? 'border-danger-500/30' : 'border-border'}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted flex items-center gap-1"><Icon className={`w-3 h-3 ${color}`} /> {label}</span>
        {isAbnormal && <AlertTriangle className="w-3 h-3 text-danger-500" />}
      </div>
      <p className={`text-xl font-bold ${isAbnormal ? 'text-danger-500' : 'text-heading'}`}>{value} <span className="text-xs font-normal text-muted">{unit}</span></p>
    </div>
  )
}

export default function Vitals() {
  const [selectedPatient, setSelectedPatient] = useState(monitoredPatients[0])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-heading"><HeartPulse className="w-6 h-6 text-danger-500" /> Real-Time Vitals Monitor</h1>
        <p className="text-muted text-sm mt-1">AI-powered deterioration prediction with NEWS2 scoring</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="card space-y-2">
          <h3 className="font-semibold text-sm text-muted uppercase tracking-wider mb-3">Monitored Patients</h3>
          {monitoredPatients.map(p => (
            <button key={p.id} onClick={() => setSelectedPatient(p)}
              className={`w-full text-left p-3 rounded-lg border transition-all ${selectedPatient.id === p.id ? 'border-primary-500/40 bg-primary-50' : 'border-border hover:border-primary-200 bg-white'}`}>
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-heading">{p.name}</span>
                <span className={`w-2 h-2 rounded-full ${p.status === 'critical' ? 'bg-danger-500 animate-pulse' : p.status === 'watch' ? 'bg-warning-500' : 'bg-accent-500'}`} />
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted">
                <span>{p.bed}</span>
                <span>·</span>
                <span>NEWS2: {p.news}</span>
                <span>·</span>
                <span className={p.risk > 0.7 ? 'text-danger-500' : p.risk > 0.4 ? 'text-warning-500' : 'text-accent-500'}>Risk {(p.risk * 100).toFixed(0)}%</span>
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            <VitalCard label="Heart Rate" value={selectedPatient.hr} unit="bpm" icon={HeartPulse} color="text-danger-500" normal={selectedPatient.hr >= 60 && selectedPatient.hr <= 100} />
            <VitalCard label="SpO2" value={selectedPatient.spo2} unit="%" icon={Droplets} color="text-primary-500" normal={selectedPatient.spo2 >= 95} />
            <VitalCard label="Systolic BP" value={selectedPatient.sbp} unit="mmHg" icon={Activity} color="text-accent-500" normal={selectedPatient.sbp >= 100 && selectedPatient.sbp <= 140} />
            <VitalCard label="Diastolic BP" value={selectedPatient.dbp} unit="mmHg" icon={Activity} color="text-primary-600" normal={selectedPatient.dbp >= 60 && selectedPatient.dbp <= 90} />
            <VitalCard label="Temperature" value={selectedPatient.temp.toFixed(1)} unit="°C" icon={Thermometer} color="text-warning-500" normal={selectedPatient.temp >= 36.1 && selectedPatient.temp <= 38.0} />
            <VitalCard label="Resp Rate" value={selectedPatient.rr} unit="/min" icon={Wind} color="text-primary-500" normal={selectedPatient.rr >= 12 && selectedPatient.rr <= 20} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`card border ${selectedPatient.news >= 7 ? 'border-danger-500/30' : selectedPatient.news >= 5 ? 'border-warning-500/30' : 'border-border'}`}>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 text-heading"><Brain className="w-4 h-4 text-primary-500" /> NEWS2 Score</h3>
              <div className="flex items-end gap-3">
                <span className={`text-5xl font-bold ${selectedPatient.news >= 7 ? 'text-danger-500' : selectedPatient.news >= 5 ? 'text-warning-500' : 'text-accent-500'}`}>{selectedPatient.news}</span>
                <div className="pb-1">
                  <p className={`text-sm font-semibold ${selectedPatient.news >= 7 ? 'text-danger-500' : selectedPatient.news >= 5 ? 'text-warning-500' : 'text-accent-500'}`}>
                    {selectedPatient.news >= 7 ? 'HIGH — Emergency Response' : selectedPatient.news >= 5 ? 'MEDIUM — Urgent Review' : 'LOW — Continue Monitoring'}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    {selectedPatient.news >= 7 ? 'Continuous monitoring. Immediate senior clinician review. Consider ICU.' : selectedPatient.news >= 5 ? 'Hourly monitoring. Alert medical team.' : 'Monitor every 4-12 hours.'}
                  </p>
                </div>
              </div>
            </div>
            <div className="card">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 text-heading"><AlertTriangle className="w-4 h-4 text-danger-500" /> AI Deterioration Risk</h3>
              <div className="flex items-end gap-3">
                <span className={`text-5xl font-bold ${selectedPatient.risk >= 0.7 ? 'text-danger-500' : selectedPatient.risk >= 0.45 ? 'text-warning-500' : 'text-accent-500'}`}>{(selectedPatient.risk * 100).toFixed(0)}%</span>
                <div className="pb-1">
                  <p className="text-xs text-muted">Predicted using NEWS2 + trend analysis + age/comorbidity factors</p>
                </div>
              </div>
              <div className="mt-3 w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${selectedPatient.risk >= 0.7 ? 'bg-gradient-to-r from-danger-600 to-danger-500' : selectedPatient.risk >= 0.45 ? 'bg-gradient-to-r from-warning-600 to-warning-500' : 'bg-gradient-to-r from-accent-600 to-accent-500'}`}
                  style={{ width: `${selectedPatient.risk * 100}%` }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="font-semibold text-sm mb-3 text-heading">Heart Rate Trend</h3>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={vitalsTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4ebf3" />
                  <XAxis dataKey="time" tick={{ fill: '#5a6b82', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#5a6b82', fontSize: 10 }} domain={[50, 110]} />
                  <Tooltip contentStyle={TT} />
                  <Line type="monotone" dataKey="hr" stroke="#c53030" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <h3 className="font-semibold text-sm mb-3 text-heading">SpO2 Trend</h3>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={vitalsTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4ebf3" />
                  <XAxis dataKey="time" tick={{ fill: '#5a6b82', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#5a6b82', fontSize: 10 }} domain={[88, 100]} />
                  <Tooltip contentStyle={TT} />
                  <Area type="monotone" dataKey="spo2" stroke="#1f7a8c" fill="#1f7a8c" fillOpacity={0.08} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
