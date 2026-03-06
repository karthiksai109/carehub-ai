import { useState } from 'react'
import { Brain, Search, AlertTriangle, Shield, Pill, FileText, ChevronRight, CheckCircle, XCircle } from 'lucide-react'

const protocols = [
  { key: 'chest_pain', name: 'Acute Chest Pain', icd: 'R07.9' },
  { key: 'sepsis', name: 'Sepsis / Septic Shock', icd: 'A41.9' },
  { key: 'hypertension', name: 'Hypertension', icd: 'I10' },
  { key: 'diabetes_type2', name: 'Type 2 Diabetes', icd: 'E11' },
  { key: 'pneumonia', name: 'Community-Acquired Pneumonia', icd: 'J18.9' },
  { key: 'asthma_exacerbation', name: 'Acute Asthma Exacerbation', icd: 'J45.901' },
]

const demoGuidance: Record<string, any> = {
  chest_pain: {
    immediate_workup: ['12-lead ECG within 10 minutes', 'Troponin (serial at 0, 3, 6 hours)', 'Chest X-ray', 'CBC, BMP, Coagulation panel'],
    risk_strat: 'Use HEART score for ACS risk assessment',
    high_risk: ['ST elevation', 'Troponin positive', 'Hemodynamic instability', 'New heart failure'],
    protocol: 'If STEMI: Activate cath lab. If NSTEMI: Cardiology consult within 24h.',
  },
  sepsis: {
    qsofa: ['Respiratory rate ≥22/min', 'Altered mentation', 'Systolic BP ≤100 mmHg'],
    hour1_bundle: ['Measure lactate level', 'Obtain blood cultures before antibiotics', 'Administer broad-spectrum antibiotics', 'Begin rapid 30mL/kg crystalloid for hypotension', 'Vasopressors if hypotensive (target MAP ≥65 mmHg)'],
    monitoring: 'Reassess volume status. Re-measure lactate if initial >2 mmol/L.',
  },
  hypertension: {
    first_line: ['Lisinopril 10mg daily', 'Amlodipine 5mg daily', 'Losartan 50mg daily'],
    lifestyle: ['DASH diet', 'Exercise 150min/week', 'Sodium <2300mg/day', 'Weight management'],
    monitoring: 'Recheck BP in 1-3 months. Target <130/80 mmHg.',
  },
}

const drugInteractionResults = [
  { drug_a: 'Warfarin', drug_b: 'Aspirin', severity: 'major', effect: 'Increased risk of bleeding', rec: 'Avoid unless specifically indicated. Monitor INR.' },
  { drug_a: 'Omeprazole', drug_b: 'Clopidogrel', severity: 'major', effect: 'Reduced antiplatelet effect', rec: 'Use pantoprazole instead. Separate dosing by 12h.' },
  { drug_a: 'Amlodipine', drug_b: 'Simvastatin', severity: 'moderate', effect: 'Increased statin levels, myopathy risk', rec: 'Limit simvastatin to 20mg/day.' },
]

export default function ClinicalSupport() {
  const [activeTab, setActiveTab] = useState<'protocols' | 'interactions'>('protocols')
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null)
  const [drugInput, setDrugInput] = useState('Warfarin, Aspirin, Omeprazole, Clopidogrel, Amlodipine, Simvastatin')
  const [interactionResult, setInteractionResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleCheckInteractions = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setInteractionResult({
      medications: drugInput.split(',').map(s => s.trim()),
      interactions: drugInteractionResults,
      has_critical: true,
    })
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-heading"><Brain className="w-6 h-6 text-primary-500" /> Clinical Decision Support</h1>
        <p className="text-muted text-sm mt-1">Evidence-based protocols, drug interactions, and AI clinical guidance</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setActiveTab('protocols')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${activeTab === 'protocols' ? 'border-primary-500/40 bg-primary-50 text-primary-500' : 'border-border bg-white text-muted'}`}>
          <FileText className="w-4 h-4 inline mr-2" />Clinical Protocols
        </button>
        <button onClick={() => setActiveTab('interactions')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${activeTab === 'interactions' ? 'border-danger-500/30 bg-danger-50 text-danger-500' : 'border-border bg-white text-muted'}`}>
          <Pill className="w-4 h-4 inline mr-2" />Drug Interaction Checker
        </button>
      </div>

      {activeTab === 'protocols' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Protocol list */}
          <div className="card space-y-2">
            <h3 className="font-semibold text-sm text-muted uppercase tracking-wider mb-3">Available Protocols</h3>
            {protocols.map(p => (
              <button key={p.key} onClick={() => setSelectedProtocol(p.key)}
                className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${selectedProtocol === p.key ? 'border-primary-500/40 bg-primary-50 text-primary-500' : 'border-border bg-white text-muted hover:border-primary-200'}`}>
                <div>
                  <p className="font-medium text-sm">{p.name}</p>
                  <p className="text-xs text-muted mt-0.5">ICD-10: {p.icd}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted" />
              </button>
            ))}
          </div>

          {/* Protocol detail */}
          <div className="lg:col-span-2 card">
            {selectedProtocol && demoGuidance[selectedProtocol] ? (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-heading">{protocols.find(p => p.key === selectedProtocol)?.name}</h3>
                {Object.entries(demoGuidance[selectedProtocol]).map(([key, value]) => (
                  <div key={key}>
                    <h4 className="text-xs text-muted uppercase tracking-wider mb-2 font-semibold">{key.replace(/_/g, ' ')}</h4>
                    {Array.isArray(value) ? (
                      <div className="space-y-1.5">
                        {(value as string[]).map((item, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-heading bg-gray-50 p-2.5 rounded-lg border border-border">
                            <CheckCircle className="w-4 h-4 text-accent-500 shrink-0 mt-0.5" />
                            {item}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-heading bg-white p-3 rounded-lg border border-border">{value as string}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-muted">
                <FileText className="w-10 h-10 mb-3" />
                <p className="text-sm">Select a protocol to view clinical guidelines</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'interactions' && (
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-heading"><Pill className="w-4 h-4 text-danger-500" /> Drug Interaction Checker</h3>
            <div className="flex gap-3">
              <input value={drugInput} onChange={e => setDrugInput(e.target.value)}
                className="input-field flex-1" placeholder="Enter medications separated by commas..." />
              <button onClick={handleCheckInteractions} disabled={loading} className="btn-primary shrink-0 flex items-center gap-2 disabled:opacity-50">
                {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Search className="w-4 h-4" /> Check</>}
              </button>
            </div>
          </div>

          {interactionResult && (
            <div className="space-y-3">
              <div className="card border border-danger-500/20">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-danger-500" />
                  <span className="font-semibold text-danger-500">{interactionResult.interactions.length} Interactions Found</span>
                  {interactionResult.has_critical && <span className="badge-critical ml-2">Critical Interactions Detected</span>}
                </div>
                <div className="space-y-3">
                  {interactionResult.interactions.map((inter: any, i: number) => (
                    <div key={i} className={`p-4 rounded-lg border ${inter.severity === 'major' ? 'border-danger-500/20 bg-danger-50' : 'border-warning-500/20 bg-warning-50'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`badge-${inter.severity === 'major' ? 'critical' : 'urgent'}`}>{inter.severity.toUpperCase()}</span>
                        <span className="font-semibold text-sm">{inter.drug_a} + {inter.drug_b}</span>
                      </div>
                      <p className="text-sm text-muted mb-1"><strong className="text-heading">Effect:</strong> {inter.effect}</p>
                      <p className="text-sm text-muted"><strong className="text-heading">Recommendation:</strong> {inter.rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
