import { environment } from 'src/environments/environment';

const API_BASE = environment.apiUrl;

export const API_ENDPOINTS = {

  // ================= AUTH =================
  auth: {
    login: `${API_BASE}/auth/login`,
    register: `${API_BASE}/auth/register`,
    refresh: `${API_BASE}/auth/refresh`,
    profile: `${API_BASE}/auth/profile`,
    logout: `${API_BASE}/auth/logout`,
  },

  // ================= USERS =================
  usuarios: {
    list: `${API_BASE}/admin/users`,
    get: (id: number | string) => `${API_BASE}/admin/users/${id}`,
    create: `${API_BASE}/admin/users`,
    update: (id: number | string) => `${API_BASE}/admin/users/${id}`,
    delete: (id: number | string) => `${API_BASE}/admin/users/${id}`,
  },

  // ================= ROOMS =================
  habitaciones: {
    list: `${API_BASE}/rooms`,
    disponibles: `${API_BASE}/rooms/available`,
    get: (id: number | string) => `${API_BASE}/rooms/${id}`,
    create: `${API_BASE}/rooms`,
    update: (id: number | string) => `${API_BASE}/rooms/${id}`,
    delete: (id: number | string) => `${API_BASE}/rooms/${id}`,
  },

  // ================= GUESTS =================
  huespedes: {
    list: `${API_BASE}/guests`,
    get: (id: number | string) => `${API_BASE}/guests/${id}`,
    create: `${API_BASE}/guests`,
    update: (id: number | string) => `${API_BASE}/guests/${id}`,
    delete: (id: number | string) => `${API_BASE}/guests/${id}`,
  },

  // ================= BOOKINGS =================
  reservas: {
    list: `${API_BASE}/bookings`,
    get: (id: number | string) => `${API_BASE}/bookings/${id}`,
    create: `${API_BASE}/bookings`,
    update: (id: number | string) => `${API_BASE}/bookings/${id}`,
    cancel: (id: number | string) => `${API_BASE}/bookings/${id}/cancel`,
  },

  // ================= PAYMENTS =================
  pagos: {
    list: `${API_BASE}/payments`,
    get: (id: number | string) => `${API_BASE}/payments/${id}`,
    create: `${API_BASE}/payments`,
  },

  // ================= SERVICES =================
  servicios: {
    list: `${API_BASE}/services`,
  },

  // ================= REPORTS =================
  reportes: {
    ingresos: `${API_BASE}/reports/income`,
    ocupacion: `${API_BASE}/reports/occupancy`,
    reservas: `${API_BASE}/reports/bookings`,
  },

  // ================= DASHBOARD (🔥 TE FALTABA) =================
  dashboard: {
    stats: `${API_BASE}/admin/dashboard/stats`,
    reservasHoy: `${API_BASE}/admin/dashboard/today-bookings`,
  },

};