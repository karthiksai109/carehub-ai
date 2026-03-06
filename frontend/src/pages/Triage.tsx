import { useState } from 'react'
import { Stethoscope, AlertTriangle, Clock, Send, ChevronDown, FileText, Activity } from 'lucide-react'

const urgencyColors: Record<string, string> = {
  critical: 'border-danger-500/30 bg-danger-50 text-danger-500',
  emergency: 'border-orange-500/30 bg-orange-50 text-orange-600',
  urgent: 'border-warning-500/30 bg-warning-50 text-warning-500',
  semi_urgent: 'border-primary-500/30 bg-primary-50 text-primary-500',
  non_urgent: 'border-accent-500/30 bg-accent-50 text-accent-500',
}

const demoHistory = [
  { id: '1', patient: 'Maria Santos', age: 45, symptoms: 'Chest pain radiating to left arm, shortness of breath', urgency: 'critical', score: 0.95, dept: 'Cardiac', time: '3 min ago', tests: ['ECG/EKG', 'Troponin levels', 'Chest X-ray'] },
  { id: '2', patient: 'James Wilson', age: 72, symptoms: 'High fever 39.5°C, confusion, low blood pressure', urgency: 'emergency', score: 0.78, dept: 'Emergency', time: '12 min ago', tests: ['CBC', 'Blood cultures', 'Lactate'] },
  { id: '3', patient: 'Amy Park', age: 28, symptoms: 'Severe headache, nausea, sensitivity to light', urgency: 'urgent', score: 0.52, dept: 'Neurology', time: '25 min ago', tests: ['CT Head', 'Neurological exam'] },
  { id: '4', patient: 'Tom Brady', age: 35, symptoms: 'Twisted ankle during sports, moderate swelling', urgency: 'semi_urgent', score: 0.35, dept: 'Orthopedics', time: '40 min ago', tests: ['X-ray'] },
  { id: '5', patient: 'Lisa Nguyen', age: 22, symptoms: 'Sore throat, mild fever, runny nose for 2 days', urgency: 'non_urgent', score: 0.15, dept: 'General Medicine', time: '1 hr ago', tests: ['Rapid strep test'] },
]

export default function Triage() {
  const [symptoms, setSymptoms] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('female')
  const [painLevel, setPainLevel] = useState(5)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleAssess = async () => {
    if (!symptoms.trim()) return
    setLoading(true)
    // Demo AI assessment
    await new Promise(r => setTimeout(r, 1200))
    const hasChest = symptoms.toLowerCase().includes('chest')
    const hasFever = symptoms.toLowerCase().includes('fever')
    const hasBreath = symptoms.toLowerCase().includes('breath')
    let urgency = 'semi_urgent', score = 0.35, dept = 'General Medicine'
    if (hasChest || hasBreath) { urgency = 'critical'; score = 0.92; dept = 'Cardiac' }
    else if (hasFever && painLevel >= 7) { urgency = 'emergency'; score = 0.75; dept = 'Emergency' }
    else if (painLevel >= 6) { urgency = 'urgent'; score = 0.55; dept = 'Emergency' }

    setResult({
      urgency, score, dept,
      assessment: `AI Triage Assessment: ${age ? age + '-year-old ' : ''}${gender} patient presenting with ${symptoms}. Classified as ${urgency.toUpperCase().replace('_', ' ')} — requires ${urgency === 'critical' ? 'immediate life-saving intervention' : 'medical attention'}.`,
      tests: urgency === 'critical' ? ['ECG/EKG', 'Troponin levels', 'Chest X-ray', 'CBC', 'BMP'] : ['CBC', 'BMP', 'Urinalysis'],
      reasoning: `1. Symptom Analysis: "${symptoms}" matched against clinical triage protocols.\n2. Urgency Score: ${score.toFixed(3)} → ${urgency.toUpperCase().replace('_', ' ')}\n3. Pain Level: ${painLevel}/10\n4. Department Routing: ${dept}`,
    })
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-heading"><Stethoscope className="w-6 h-6 text-primary-500" /> AI Triage Engine</h1>
        <p className="text-muted text-sm mt-1">Manchester Triage System + ESI-powered AI clinical assessment</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Input form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card space-y-4">
            <h3 className="font-semibold text-sm text-muted uppercase tracking-wider">Patient Assessment</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted mb-1 block">Age</label>
                <input type="number" value={age} onChange={e => setAge(e.target.value)} className="input-field" placeholder="Age" />
              </div>
              <div>
                <label className="text-xs text-muted mb-1 block">Gender</label>
                <select value={gender} onChange={e => setGender(e.target.value)} className="input-field">
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block">Presenting Symptoms</label>
              <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} rows={4}
                className="input-field resize-none" placeholder="Describe the patient's symptoms in detail..." />
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block">Pain Level: {painLevel}/10</label>
              <input type="range" min={0} max={10} value={painLevel} onChange={e => setPainLevel(+e.target.value)}
                className="w-full accent-primary-500" />
              <div className="flex justify-between text-xs text-muted"><span>None</span><span>Worst</span></div>
            </div>
            <button onClick={handleAssess} disabled={loading || !symptoms.trim()}
              className="w-full btn-primary flex items-center justify-center gap-2 py-2.5 disabled:opacity-50">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send className="w-4 h-4" /> Run AI Assessment</>}
            </button>
          </div>

          {/* Result */}
          {result && (
            <div className={`card border-2 ${urgencyColors[result.urgency]}`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`badge-${result.urgency} text-base px-3 py-1`}>{result.urgency.replace('_', ' ').toUpperCase()}</span>
                <span className="text-2xl font-bold">{(result.score * 100).toFixed(0)}%</span>
              </div>
              <p className="text-sm text-heading mb-3">{result.assessment}</p>
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-primary-400" />
                <span className="text-sm">Route to: <strong>{result.dept}</strong></span>
              </div>
              <div className="mb-3">
                <p className="text-xs text-muted mb-1.5 font-semibold">Suggested Tests:</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.tests.map((t: string) => <span key={t} className="badge bg-gray-100 text-heading border border-border">{t}</span>)}
                </div>
              </div>
              <details className="text-xs text-muted">
                <summary className="cursor-pointer hover:text-heading flex items-center gap-1"><FileText className="w-3 h-3" /> AI Reasoning Chain</summary>
                <pre className="mt-2 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg text-heading border border-border">{result.reasoning}</pre>
              </details>
            </div>
          )}
        </div>

        {/* Recent assessments */}
        <div className="lg:col-span-3 card">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-heading"><Clock className="w-4 h-4 text-muted" /> Recent Triage Assessments</h3>
          <div className="space-y-3">
            {demoHistory.map(h => (
              <div key={h.id} className={`p-3 rounded-lg border ${urgencyColors[h.urgency]} flex items-start gap-3`}>
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${h.urgency === 'critical' ? 'bg-danger-500 animate-pulse' : h.urgency === 'emergency' ? 'bg-orange-500' : h.urgency === 'urgent' ? 'bg-warning-500' : 'bg-primary-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-heading">{h.patient}</span>
                    <span className="text-xs text-muted">Age {h.age}</span>
                    <span className={`badge-${h.urgency}`}>{h.urgency.replace('_', ' ')}</span>
                    <span className="text-xs font-mono text-muted">{(h.score * 100).toFixed(0)}%</span>
                  </div>
                  <p className="text-xs text-muted mt-1">{h.symptoms}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-xs text-primary-400">→ {h.dept}</span>
                    {h.tests.slice(0, 3).map(t => <span key={t} className="text-[10px] bg-gray-100 text-muted px-1.5 py-0.5 rounded">{t}</span>)}
                  </div>
                </div>
                <span className="text-xs text-muted shrink-0">{h.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
