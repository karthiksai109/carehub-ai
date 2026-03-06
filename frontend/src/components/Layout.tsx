import { useState } from 'react'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Stethoscope, Users, BedDouble, Brain,
  HeartPulse, BarChart3, Menu, X, Activity, Bell, LogOut, ChevronRight
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { path: '/', label: 'Command Center', icon: LayoutDashboard },
  { path: '/triage', label: 'AI Triage', icon: Stethoscope },
  { path: '/patients', label: 'Patients', icon: Users },
  { path: '/vitals', label: 'Vitals Monitor', icon: HeartPulse },
  { path: '/beds', label: 'Bed Management', icon: BedDouble },
  { path: '/clinical', label: 'Clinical AI', icon: Brain },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'DR'

  return (
    <div className="flex h-screen overflow-hidden bg-page">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-border flex flex-col transition-all duration-300 shrink-0`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-border gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && (
            <div>
              <h1 className="font-bold text-lg leading-tight text-primary-500 tracking-wide">CareHub AI</h1>
              <p className="text-[10px] text-muted uppercase tracking-widest">Command Center</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                  isActive
                    ? 'bg-primary-50 text-primary-500 border border-primary-200'
                    : 'text-muted hover:bg-gray-50 hover:text-heading'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Toggle */}
        <div className="p-3 border-t border-border">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-full flex items-center justify-center py-2 text-muted hover:text-heading rounded-lg hover:bg-gray-50 transition-colors">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white/95 backdrop-blur-md border-b border-border flex items-center justify-between px-6 shrink-0 sticky top-0 z-50">
          <div className="flex items-center gap-2 text-sm text-muted">
            <LayoutDashboard className="w-4 h-4" />
            <ChevronRight className="w-3 h-3" />
            <span className="text-heading font-medium">
              {navItems.find(n => n.path === location.pathname)?.label || 'Dashboard'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-accent-50 border border-accent-200 rounded-full">
              <span className="w-2 h-2 bg-accent-500 rounded-full animate-pulse" />
              <span className="text-xs text-accent-500 font-semibold">System Online</span>
            </div>
            <button className="relative p-2 text-muted hover:text-heading transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 px-2.5 py-1.5 bg-gray-50 border border-border rounded-lg">
              <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center text-[10px] font-bold text-white">{initials}</div>
              <span className="text-xs font-semibold text-heading">{user?.name || 'User'}</span>
            </div>
            <button onClick={handleLogout} className="p-2 text-muted hover:text-danger-500 transition-colors" title="Sign out">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 bg-page">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
