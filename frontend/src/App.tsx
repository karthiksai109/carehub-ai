import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Triage from './pages/Triage'
import Patients from './pages/Patients'
import BedManagement from './pages/BedManagement'
import ClinicalSupport from './pages/ClinicalSupport'
import Vitals from './pages/Vitals'
import Analytics from './pages/Analytics'
import Login from './pages/Login'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="triage" element={<Triage />} />
        <Route path="patients" element={<Patients />} />
        <Route path="beds" element={<BedManagement />} />
        <Route path="clinical" element={<ClinicalSupport />} />
        <Route path="vitals" element={<Vitals />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
