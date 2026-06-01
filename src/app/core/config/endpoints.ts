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

  // ================= USERS (CORREGIDO) =================
  usuarios: {
    list: `${API_BASE}/admin/usuarios`,           // ← CORREGIDO
    get: (id: number | string) => `${API_BASE}/admin/usuarios/${id}`,  // ← CORREGIDO
    create: `${API_BASE}/admin/usuarios`,         // ← CORREGIDO
    update: (id: number | string) => `${API_BASE}/admin/usuarios/${id}`, // ← CORREGIDO
    delete: (id: number | string) => `${API_BASE}/admin/usuarios/${id}`, // ← CORREGIDO
  },

  // ================= HOTELS =================
  hoteles: {
    list: `${API_BASE}/hotels`,
    get: (id: number | string) => `${API_BASE}/hotels/${id}`,
    bySlug: (slug: string) => `${API_BASE}/hotels/${slug}`,
  },

  // ================= ROOMS =================
  habitaciones: {
    list: `${API_BASE}/rooms`,
    get: (id: number | string) => `${API_BASE}/rooms/${id}`,
    disponibles: `${API_BASE}/rooms/disponibles`,
    byHotel: (slug: string) => `${API_BASE}/rooms/hotel/${slug}`,
    create: `${API_BASE}/rooms`,
    update: (id: number | string) => `${API_BASE}/rooms/${id}`,
    delete: (id: number | string) => `${API_BASE}/rooms/${id}`,
    reviews: (hotelId: number | string) => `${API_BASE}/rooms/reviews/${hotelId}`,
    createReview: `${API_BASE}/rooms/reviews`,
  },

  // ================= ROOM TYPES =================
  tiposHabitacion: {
    list: `${API_BASE}/room-types`,
  },

  // ================= GUESTS =================
  huespedes: {
    list: `${API_BASE}/clients`,
    get: (id: number | string) => `${API_BASE}/clients/${id}`,
    create: `${API_BASE}/clients`,
    update: (id: number | string) => `${API_BASE}/clients/${id}`,
    delete: (id: number | string) => `${API_BASE}/clients/${id}`,
  },

  // ================= BOOKINGS =================
  reservas: {
    list: `${API_BASE}/bookings`,
    get: (id: number | string) => `${API_BASE}/bookings/${id}`,
    create: `${API_BASE}/bookings`,
    update: (id: number | string) => `${API_BASE}/bookings/${id}`,
    cancel: (id: number | string) => `${API_BASE}/bookings/${id}/cancelar`,
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
  ingresos: `${API_BASE}/reports/ingresos`,
  ocupacion: `${API_BASE}/reports/ocupacion`,
  reservas: `${API_BASE}/reports/reservas/estado`,
  dashboard: `${API_BASE}/reports/dashboard`,
  cancelaciones: `${API_BASE}/reports/cancelaciones`,
  hotelesTop: `${API_BASE}/reports/hoteles/top`,
  serviciosTop: `${API_BASE}/reports/servicios/top`,
  clientesFrecuentes: `${API_BASE}/reports/clientes/frecuentes`,
},

  // ================= DASHBOARD =================
  dashboard: {
    stats: `${API_BASE}/admin/dashboard/stats`,
    reservasHoy: `${API_BASE}/admin/dashboard/today-bookings`,
  },
};