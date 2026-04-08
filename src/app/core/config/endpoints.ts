import { environment } from 'src/environments/environment';

const API_BASE = environment.apiUrl;

export const API_ENDPOINTS = {

  auth: {
    login: `${API_BASE}/auth/login`,
    register: `${API_BASE}/auth/register`,
    refresh: `${API_BASE}/auth/refresh`,
    profile: `${API_BASE}/auth/profile`,
    logout: `${API_BASE}/auth/logout`,
  },

  usuarios: {
    list: `${API_BASE}/admin/users`,
    get: (id: number | string) => `${API_BASE}/admin/users/${id}`,
    create: `${API_BASE}/admin/users`,
    update: (id: number | string) => `${API_BASE}/admin/users/${id}`,
    delete: (id: number | string) => `${API_BASE}/admin/users/${id}`,
  },

  habitaciones: {
    list: `${API_BASE}/rooms`,
    disponibles: `${API_BASE}/rooms/available`,
    get: (id: number | string) => `${API_BASE}/rooms/${id}`,
    create: `${API_BASE}/rooms`,
    update: (id: number | string) => `${API_BASE}/rooms/${id}`,
    delete: (id: number | string) => `${API_BASE}/rooms/${id}`,
  },

  huespedes: {
    list: `${API_BASE}/clients`,
    get: (id: number | string) => `${API_BASE}/clients/${id}`,
    create: `${API_BASE}/clients`,
    update: (id: number | string) => `${API_BASE}/clients/${id}`,
    delete: (id: number | string) => `${API_BASE}/clients/${id}`,
  },

  reservas: {
    list: `${API_BASE}/bookings`,
    get: (id: number | string) => `${API_BASE}/bookings/${id}`,
    create: `${API_BASE}/bookings`,
    update: (id: number | string) => `${API_BASE}/bookings/${id}`,
    cancel: (id: number | string) => `${API_BASE}/bookings/${id}/cancel`,
  },

  pagos: {
    list: `${API_BASE}/payments`,
    get: (id: number | string) => `${API_BASE}/payments/${id}`,
    create: `${API_BASE}/payments`,
  },

  servicios: {
    list: `${API_BASE}/services`,
  },

  reportes: {
    ingresos: `${API_BASE}/reports/income`,
    ocupacion: `${API_BASE}/reports/occupancy`,
    reservas: `${API_BASE}/reports/bookings`,
  },

};