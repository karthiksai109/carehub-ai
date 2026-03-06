import { useState } from 'react'
import { BedDouble, Users, AlertTriangle, TrendingUp, Wrench } from 'lucide-react'

const wards = [
  { id: '1', name: 'ICU', type: 'icu', floor: 2, beds: [
    { id: 'b1', number: 'ICU-201', status: 'occupied', patient: 'J. Miller', type: 'icu', monitored: true },
    { id: 'b2', number: 'ICU-202', status: 'occupied', patient: 'A. Kumar', type: 'icu', monitored: true },
    { id: 'b3', number: 'ICU-203', status: 'available', patient: null, type: 'icu', monitored: true },
    { id: 'b4', number: 'ICU-204', status: 'occupied', patient: 'R. Lee', type: 'icu', monitored: true },
    { id: 'b5', number: 'ICU-205', status: 'maintenance', patient: null, type: 'icu', monitored: true },
    { id: 'b6', number: 'ICU-206', status: 'available', patient: null, type: 'icu', monitored: true },
  ]},
  { id: '2', name: 'Emergency', type: 'emergency', floor: 1, beds: [
    { id: 'b7', number: 'ER-01', status: 'occupied', patient: 'T. Smith', type: 'standard', monitored: false },
    { id: 'b8', number: 'ER-02', status: 'occupied', patient: 'L. Wong', type: 'standard', monitored: false },
    { id: 'b9', number: 'ER-03', status: 'occupied', patient: 'R. Lee', type: 'standard', monitored: true },
    { id: 'b10', number: 'ER-04', status: 'available', patient: null, type: 'standard', monitored: false },
    { id: 'b11', number: 'ER-05', status: 'reserved', patient: null, type: 'standard', monitored: false },
  ]},
  { id: '3', name: 'General Ward A', type: 'general', floor: 3, beds: Array.from({ length: 12 }, (_, i) => ({
    id: `b${20+i}`, number: `GEN-${301+i}`, status: i < 8 ? 'occupied' : i < 10 ? 'available' : i === 10 ? 'maintenance' : 'reserved',
    patient: i < 8 ? ['S. Chen', 'M. Brown', 'E. Davis', 'J. Martinez', 'P. Garcia', 'K. Thompson', 'D. Anderson', 'W. Taylor'][i] : null,
    type: 'standard', monitored: false,
  }))},
  { id: '4', name: 'General Ward B', type: 'general', floor: 3, beds: Array.from({ length: 10 }, (_, i) => ({
    id: `b${40+i}`, number: `GEN-${401+i}`, status: i < 6 ? 'occupied' : 'available',
    patient: i < 6 ? ['H. Kim', 'B. Patel', 'N. Johnson', 'C. White', 'F. Harris', 'G. Clark'][i] : null,
    type: 'standard', monitored: false,
  }))},
  { id: '5', name: 'Pediatric', type: 'pediatric', floor: 4, beds: Array.from({ length: 6 }, (_, i) => ({
    id: `b${60+i}`, number: `PED-${101+i}`, status: i < 3 ? 'occupied' : 'available',
    patient: i < 3 ? ['Baby R.', 'A. Young', 'L. Scott'][i] : null,
    type: 'pediatric', monitored: i < 2,
  }))},
]

const statusColors: Record<string, { bg: string; border: string; text: string }> = {
  occupied: { bg: 'bg-primary-50', border: 'border-primary-200', text: 'text-primary-500' },
  available: { bg: 'bg-accent-50', border: 'border-accent-200', text: 'text-accent-500' },
  maintenance: { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-muted' },
  reserved: { bg: 'bg-warning-50', border: 'border-warning-200', text: 'text-warning-500' },
}

export default function BedManagement() {
  const [selectedWard, setSelectedWard] = useState(wards[0].id)

  const allBeds = wards.flatMap(w => w.beds)
  const total = allBeds.length
  const occupied = allBeds.filter(b => b.status === 'occupied').length
  const available = allBeds.filter(b => b.status === 'available').length
  const maint = allBeds.filter(b => b.status === 'maintenance').length
  const reserved = allBeds.filter(b => b.status === 'reserved').length
  const occupancyRate = ((occupied / total) * 100).toFixed(1)

  const ward = wards.find(w => w.id === selectedWard)!

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-heading"><BedDouble className="w-6 h-6 text-accent-500" /> Bed Management & AI Optimizer</h1>
        <p className="text-muted text-sm mt-1">Real-time bed occupancy with AI capacity prediction</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Beds', value: total, icon: BedDouble, color: 'text-heading', bg: 'bg-gray-100' },
          { label: 'Occupied', value: occupied, icon: Users, color: 'text-primary-500', bg: 'bg-primary-50' },
          { label: 'Available', value: available, icon: BedDouble, color: 'text-accent-500', bg: 'bg-accent-50' },
          { label: 'Maintenance', value: maint, icon: Wrench, color: 'text-muted', bg: 'bg-gray-100' },
          { label: 'Occupancy Rate', value: `${occupancyRate}%`, icon: TrendingUp, color: parseFloat(occupancyRate) > 85 ? 'text-danger-500' : 'text-accent-500', bg: parseFloat(occupancyRate) > 85 ? 'bg-danger-50' : 'bg-accent-50' },
        ].map(s => (
          <div key={s.label} className="card-hover">
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className="text-xl font-bold">{s.value}</p>
            <p className="text-xs text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Ward selector + beds */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-2">
          {wards.map(w => {
            const wOcc = w.beds.filter(b => b.status === 'occupied').length
            return (
              <button key={w.id} onClick={() => setSelectedWard(w.id)}
                className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${selectedWard === w.id ? 'border-primary-500/40 bg-primary-50 text-primary-500' : 'border-border bg-white text-muted hover:border-primary-200'}`}>
                {w.name} <span className="text-xs text-muted">{wOcc}/{w.beds.length}</span>
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {ward.beds.map(bed => {
            const sc = statusColors[bed.status]
            return (
              <div key={bed.id} className={`p-3 rounded-lg border ${sc.border} ${sc.bg} text-center cursor-pointer hover:scale-105 transition-transform`}>
                <BedDouble className={`w-5 h-5 mx-auto mb-1 ${sc.text}`} />
                <p className="text-xs font-bold text-heading">{bed.number}</p>
                <p className={`text-[10px] font-semibold mt-0.5 ${sc.text}`}>{bed.status}</p>
                {bed.patient && <p className="text-[10px] text-muted mt-0.5 truncate">{bed.patient}</p>}
                {bed.monitored && <span className="inline-block w-1.5 h-1.5 bg-accent-500 rounded-full mt-1" title="Monitored" />}
              </div>
            )
          })}
        </div>
      </div>

      {/* AI Prediction */}
      <div className="card border border-primary-200">
        <h3 className="font-semibold mb-3 flex items-center gap-2 text-heading"><TrendingUp className="w-4 h-4 text-primary-500" /> AI Capacity Prediction (Next 24h)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-border">
            <p className="text-xs text-muted">Predicted Admissions</p>
            <p className="text-2xl font-bold text-primary-500">8-12</p>
            <p className="text-xs text-muted mt-1">Based on historical patterns + ER queue</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-border">
            <p className="text-xs text-muted">Predicted Discharges</p>
            <p className="text-2xl font-bold text-accent-500">6-9</p>
            <p className="text-xs text-muted mt-1">Based on treatment progress + recovery rates</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-border">
            <p className="text-xs text-muted">Projected Occupancy (24h)</p>
            <p className={`text-2xl font-bold ${parseFloat(occupancyRate) > 85 ? 'text-danger-500' : 'text-warning-500'}`}>{(parseFloat(occupancyRate) + 3.2).toFixed(1)}%</p>
            <p className="text-xs text-muted mt-1">{parseFloat(occupancyRate) > 85 ? 'Consider discharge optimization' : 'Normal capacity expected'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
