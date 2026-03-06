import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('carehub_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('carehub_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

// Auth
export const authAPI = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
}

// Patients
export const patientsAPI = {
  list: (params?: any) => api.get('/patients/', { params }),
  get: (id: string) => api.get(`/patients/${id}`),
  create: (data: any) => api.post('/patients/', data),
  update: (id: string, data: any) => api.put(`/patients/${id}`, data),
  summary: (id: string) => api.get(`/patients/${id}/summary`),
}

// Triage
export const triageAPI = {
  assess: (data: any) => api.post('/triage/assess', data),
  list: (params?: any) => api.get('/triage/', { params }),
  get: (id: string) => api.get(`/triage/${id}`),
}

// Vitals
export const vitalsAPI = {
  record: (data: any) => api.post('/vitals/', data),
  getPatientVitals: (patientId: string, hours?: number) => api.get(`/vitals/patient/${patientId}`, { params: { hours } }),
  getDeteriorationAnalysis: (patientId: string) => api.get(`/vitals/patient/${patientId}/deterioration`),
}

// Beds
export const bedsAPI = {
  dashboard: () => api.get('/beds/dashboard'),
  listWards: () => api.get('/beds/wards'),
  createWard: (data: any) => api.post('/beds/wards', data),
  createBed: (data: any) => api.post('/beds/', data),
  assignPatient: (bedId: string, patientId: string) => api.put(`/beds/${bedId}/assign`, null, { params: { patient_id: patientId } }),
  discharge: (bedId: string) => api.put(`/beds/${bedId}/discharge`),
}

// Clinical
export const clinicalAPI = {
  getGuidance: (condition: string, params?: any) => api.post('/clinical/guidance', null, { params: { condition, ...params } }),
  checkDrugInteractions: (medications: string[]) => api.post('/clinical/drug-interactions', null, { params: { medications } }),
  listProtocols: () => api.get('/clinical/protocols'),
}

// Appointments
export const appointmentsAPI = {
  list: (params?: any) => api.get('/appointments/', { params }),
  create: (data: any) => api.post('/appointments/', null, { params: data }),
  updateStatus: (id: string, status: string) => api.put(`/appointments/${id}/status`, null, { params: { new_status: status } }),
}

// Analytics
export const analyticsAPI = {
  dashboard: () => api.get('/analytics/dashboard'),
  riskDistribution: () => api.get('/analytics/patient-risk-distribution'),
}
