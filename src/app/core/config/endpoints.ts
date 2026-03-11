import { environment } from 'src/environments/environment';

const API_BASE = environment.apiUrl;

/*
  Convención:
  - list   → GET todos
  - get    → GET por id
  - create → POST
  - update → PUT/PATCH
  - delete → DELETE
*/

export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE}/auth/login`,
    register: `${API_BASE}/auth/register`,
    refresh: `${API_BASE}/auth/refresh`,
    profile: `${API_BASE}/auth/profile`,
    logout: `${API_BASE}/auth/logout`,
  },

  usuarios: {
    list: `${API_BASE}/usuarios`,
    get: (id: number | string) => `${API_BASE}/usuarios/${id}`,
    create: `${API_BASE}/usuarios`,
    update: (id: number | string) => `${API_BASE}/usuarios/${id}`,
    delete: (id: number | string) => `${API_BASE}/usuarios/${id}`,
  },

  habitaciones: {
    list: `${API_BASE}/habitaciones`,
    disponibles: `${API_BASE}/habitaciones/disponibles`,
    get: (id: number | string) => `${API_BASE}/habitaciones/${id}`,
    create: `${API_BASE}/habitaciones`,
    update: (id: number | string) => `${API_BASE}/habitaciones/${id}`,
    delete: (id: number | string) => `${API_BASE}/habitaciones/${id}`,
  },

  huespedes: {
    list: `${API_BASE}/huespedes`,
    get: (id: number | string) => `${API_BASE}/huespedes/${id}`,
    create: `${API_BASE}/huespedes`,
    update: (id: number | string) => `${API_BASE}/huespedes/${id}`,
    delete: (id: number | string) => `${API_BASE}/huespedes/${id}`,
  },

  reservas: {
    list: `${API_BASE}/reservas`,
    get: (id: number | string) => `${API_BASE}/reservas/${id}`,
    create: `${API_BASE}/reservas`,
    update: (id: number | string) => `${API_BASE}/reservas/${id}`,
    cancel: (id: number | string) => `${API_BASE}/reservas/${id}/cancelar`,
  },

  reportes: {
    ingresos: `${API_BASE}/reportes/ingresos`,
    ocupacion: `${API_BASE}/reportes/ocupacion`,
    reservas: `${API_BASE}/reportes/reservas`,
  },

  dashboard: {
  stats: '/dashboard/stats',
  reservasHoy: '/dashboard/reservas-hoy'
},
};
