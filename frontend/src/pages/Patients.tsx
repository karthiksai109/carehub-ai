import { useState } from 'react'
import { Users, Search, Plus, ChevronRight, AlertTriangle, Shield, HeartPulse } from 'lucide-react'

const demoPatients = [
  { id: '1', mrn: 'MRN-2026-A1B2C3D4', name: 'John Miller', age: 68, gender: 'Male', status: 'inpatient', risk: 0.82, bed: 'ICU-204', doctor: 'Dr. Smith', blood: 'O+', allergies: ['Penicillin'], meds: ['Warfarin', 'Metoprolol', 'Lisinopril'] },
  { id: '2', mrn: 'MRN-2026-E5F6G7H8', name: 'Sarah Chen', age: 34, gender: 'Female', status: 'inpatient', risk: 0.55, bed: 'GEN-112', doctor: 'Dr. Patel', blood: 'A+', allergies: [], meds: ['Metformin'] },
  { id: '3', mrn: 'MRN-2026-I9J0K1L2', name: 'Robert Lee', age: 52, gender: 'Male', status: 'emergency', risk: 0.91, bed: 'ER-03', doctor: 'Dr. Johnson', blood: 'B-', allergies: ['Sulfa'], meds: ['Aspirin', 'Atorvastatin'] },
  { id: '4', mrn: 'MRN-2026-M3N4O5P6', name: 'Emily Davis', age: 29, gender: 'Female', status: 'outpatient', risk: 0.12, bed: '-', doctor: 'Dr. Wilson', blood: 'AB+', allergies: [], meds: [] },
  { id: '5', mrn: 'MRN-2026-Q7R8S9T0', name: 'Michael Brown', age: 75, gender: 'Male', status: 'inpatient', risk: 0.73, bed: 'GEN-305', doctor: 'Dr. Garcia', blood: 'O-', allergies: ['Latex', 'Iodine'], meds: ['Insulin', 'Amlodipine', 'Omeprazole'] },
  { id: '6', mrn: 'MRN-2026-U1V2W3X4', name: 'Jessica Martinez', age: 41, gender: 'Female', status: 'inpatient', risk: 0.38, bed: 'GEN-208', doctor: 'Dr. Kim', blood: 'A-', allergies: [], meds: ['Levothyroxine'] },
]

const riskBadge = (score: number) => {
  if (score >= 0.7) return 'badge-critical'
  if (score >= 0.45) return 'badge-urgent'
  if (score >= 0.25) return 'badge-semi_urgent'
  return 'badge-non_urgent'
}

const riskLabel = (score: number) => {
  if (score >= 0.7) return 'High Risk'
  if (score >= 0.45) return 'Medium'
  if (score >= 0.25) return 'Low'
  return 'Minimal'
}

const statusColor: Record<string, string> = {
  inpatient: 'bg-primary-50 text-primary-500',
  outpatient: 'bg-accent-50 text-accent-500',
  emergency: 'bg-danger-50 text-danger-500',
  discharged: 'bg-gray-100 text-muted',
}

export default function Patients() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  const filtered = demoPatients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.mrn.toLowerCase().includes(search.toLowerCase())
  )

  const patient = demoPatients.find(p => p.id === selected)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-heading"><Users className="w-6 h-6 text-primary-500" /> Patient Management</h1>
          <p className="text-muted text-sm mt-1">{demoPatients.length} patients registered</p>
        </div>
        <button className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Add Patient</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient list */}
        <div className="lg:col-span-2 card">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" placeholder="Search by name or MRN..." />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted text-xs uppercase">
                  <th className="text-left py-3 px-2">Patient</th>
                  <th className="text-left py-3 px-2">MRN</th>
                  <th className="text-left py-3 px-2">Status</th>
                  <th className="text-left py-3 px-2">Risk</th>
                  <th className="text-left py-3 px-2">Bed</th>
                  <th className="text-left py-3 px-2">Doctor</th>
                  <th className="py-3 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} onClick={() => setSelected(p.id)}
                    className={`border-b border-border hover:bg-gray-50 cursor-pointer transition-colors ${selected === p.id ? 'bg-primary-50/50' : ''}`}>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-xs font-bold text-white">{p.name.split(' ').map(n => n[0]).join('')}</div>
                        <div>
                          <p className="font-medium text-heading">{p.name}</p>
                          <p className="text-xs text-muted">{p.age}y · {p.gender}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-xs font-mono text-muted">{p.mrn}</td>
                    <td className="py-3 px-2"><span className={`badge ${statusColor[p.status]}`}>{p.status}</span></td>
                    <td className="py-3 px-2"><span className={riskBadge(p.risk)}>{riskLabel(p.risk)}</span></td>
                    <td className="py-3 px-2 text-muted">{p.bed}</td>
                    <td className="py-3 px-2 text-muted">{p.doctor}</td>
                    <td className="py-3 px-2"><ChevronRight className="w-4 h-4 text-muted" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Patient detail */}
        <div className="card">
          {patient ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-primary-500 flex items-center justify-center text-lg font-bold text-white">{patient.name.split(' ').map(n => n[0]).join('')}</div>
                <div>
                  <h3 className="font-bold text-lg">{patient.name}</h3>
                  <p className="text-xs text-muted">{patient.mrn}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white rounded-lg p-3 border border-border"><p className="text-xs text-muted">Age</p><p className="font-semibold">{patient.age}</p></div>
                <div className="bg-white rounded-lg p-3 border border-border"><p className="text-xs text-muted">Blood Type</p><p className="font-semibold">{patient.blood}</p></div>
                <div className="bg-white rounded-lg p-3 border border-border"><p className="text-xs text-muted">Status</p><p className={`font-semibold ${patient.status === 'emergency' ? 'text-danger-500' : 'text-primary-500'}`}>{patient.status}</p></div>
                <div className="bg-white rounded-lg p-3 border border-border"><p className="text-xs text-muted">Bed</p><p className="font-semibold">{patient.bed}</p></div>
              </div>
              {/* Risk */}
              <div className={`p-3 rounded-lg border ${patient.risk >= 0.7 ? 'border-danger-500/20 bg-danger-50' : patient.risk >= 0.45 ? 'border-warning-500/20 bg-warning-50' : 'border-accent-500/20 bg-accent-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted flex items-center gap-1"><HeartPulse className="w-3 h-3" /> Deterioration Risk</span>
                  <span className={riskBadge(patient.risk)}>{(patient.risk * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${patient.risk >= 0.7 ? 'bg-danger-500' : patient.risk >= 0.45 ? 'bg-warning-500' : 'bg-accent-500'}`}
                    style={{ width: `${patient.risk * 100}%` }} />
                </div>
              </div>
              {/* Allergies */}
              {patient.allergies.length > 0 && (
                <div>
                  <p className="text-xs text-muted mb-1.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-danger-500" /> Allergies</p>
                  <div className="flex flex-wrap gap-1.5">{patient.allergies.map(a => <span key={a} className="badge-critical">{a}</span>)}</div>
                </div>
              )}
              {/* Medications */}
              {patient.meds.length > 0 && (
                <div>
                  <p className="text-xs text-muted mb-1.5 flex items-center gap-1"><Shield className="w-3 h-3 text-primary-500" /> Current Medications</p>
                  <div className="flex flex-wrap gap-1.5">{patient.meds.map(m => <span key={m} className="badge bg-gray-100 text-heading border border-border">{m}</span>)}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted">
              <Users className="w-10 h-10 mb-3" />
              <p className="text-sm">Select a patient to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
