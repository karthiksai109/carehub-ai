import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

export type UserRole = 'patient' | 'doctor' | 'nurse' | 'admin'

export interface AuthUser {
  name: string
  email: string
  role: UserRole
  phone?: string
  dob?: string
  bloodGroup?: string
}

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
}

export interface RegisterData {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  role: UserRole
  dob?: string
  bloodGroup?: string
  medicalId?: string
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('carehub_user')
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch { localStorage.removeItem('carehub_user') }
    }
  }, [])

  const login = async (email: string, _password: string) => {
    // Demo: determine role from email pattern
    let role: UserRole = 'patient'
    let name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    if (email.includes('admin')) { role = 'admin'; name = 'Dr. Admin' }
    else if (email.includes('doctor') || email.includes('dr.') || email.includes('dr@')) { role = 'doctor'; name = `Dr. ${name}` }
    else if (email.includes('nurse')) { role = 'nurse'; name = `Nurse ${name}` }

    const userData: AuthUser = { name, email, role }
    localStorage.setItem('carehub_token', 'demo-token')
    localStorage.setItem('carehub_user', JSON.stringify(userData))
    setUser(userData)
  }

  const register = async (data: RegisterData) => {
    const userData: AuthUser = {
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      role: data.role,
      phone: data.phone,
      dob: data.dob,
      bloodGroup: data.bloodGroup,
    }
    localStorage.setItem('carehub_token', 'demo-token')
    localStorage.setItem('carehub_user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('carehub_token')
    localStorage.removeItem('carehub_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
