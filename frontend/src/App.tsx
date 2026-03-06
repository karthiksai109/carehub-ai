import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Triage from './pages/Triage'
import Patients from './pages/Patients'
import BedManagement from './pages/BedManagement'
import ClinicalSupport from './pages/ClinicalSupport'
import Vitals from './pages/Vitals'
import Analytics from './pages/Analytics'
import Login from './pages/Login'
import Register from './pages/Register'
import PatientPortal from './pages/PatientPortal'

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" />
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'patient' ? '/portal' : '/'} />
  }
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth()
  if (isAuthenticated) return <Navigate to={user?.role === 'patient' ? '/portal' : '/'} />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/portal" element={<ProtectedRoute allowedRoles={['patient']}><PatientPortal /></ProtectedRoute>} />
      <Route path="/" element={<ProtectedRoute allowedRoles={['doctor', 'nurse', 'admin']}><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="triage" element={<Triage />} />
        <Route path="patients" element={<Patients />} />
        <Route path="beds" element={<BedManagement />} />
        <Route path="clinical" element={<ClinicalSupport />} />
        <Route path="vitals" element={<Vitals />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
