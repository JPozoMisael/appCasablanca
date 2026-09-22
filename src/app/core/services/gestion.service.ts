import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { Amenidad, Reserva } from '@app/shared/models/marketplace.model';

/* Tipos del panel de gestión (alineados con la API) */
export interface Meta { total: number; page: number; limit: number; pages: number }
export interface Lista<T> { data: T[]; meta?: Meta }

export interface DashboardData {
  fecha: string;
  llegadas_hoy: number;
  salidas_hoy: number;
  huespedes_en_casa: number;
  reservas_pendientes: number;
  ocupacion_hoy: { fecha: string; ocupadas: number; porcentaje: number };
  total_habitaciones: number;
  ingresos_mes: number;
  reservas_mes: number;
  ventas_mes: number;
  comision_mes: number;
}

export interface TipoHab {
  id: number;
  hotel_id: number;
  nombre: string;
  descripcion?: string | null;
  capacidad_maxima: number;
  camas_sencillas: number;
  camas_dobles: number;
  precio_base: number | string;
  tiene_vista: boolean;
  tiene_balcon: boolean;
  desayuno_incluido: boolean;
  estado: 'activo' | 'inactivo';
}

export interface Hab {
  id: number;
  numero_habitacion: string;
  piso?: number | null;
  estado: 'disponible' | 'ocupada' | 'mantenimiento' | 'limpieza' | 'inactiva';
  tipo_habitacion_id: number;
  tipoHabitacion?: { id: number; nombre: string };
}

export interface HotelPerfil {
  id: number;
  nombre: string;
  slug: string;
  descripcion?: string | null;
  direccion?: string | null;
  ciudad: string;
  zona_id?: number | null;
  tipo_alojamiento: string;
  latitud?: number | string | null;
  longitud?: number | string | null;
  telefono?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  sitio_web?: string | null;
  estrellas?: number | null;
  imagen_principal?: string | null;
  hora_checkin: string;
  hora_checkout: string;
  politica_cancelacion: string;
  comision_porcentaje?: number | string;
  destacado?: boolean;
  rating_promedio?: number | string;
  estado: 'activo' | 'inactivo' | 'pendiente';
  amenidades?: Amenidad[];
  imagenes?: { id: number; url: string; alt?: string | null; orden: number }[];
  zona?: { id: number; nombre: string } | null;
}

export interface PlataformaStats {
  hoteles: number;
  hoteles_activos: number;
  hoteles_pendientes: number;
  clientes_registrados: number;
  reservas_totales: number;
  ventas_totales: number;
  comisiones_totales: number;
  top_hoteles: { hotel_id: number; nombre: string; reservas: number; ventas: number }[];
}

export interface PagoRes {
  pago: { id: number; monto: number | string; metodo: string };
  saldo: number;
  reserva_estado: string;
}

/** Acceso tipado a la API de gestión (todo acotado al hotel del usuario en el servidor). */
@Injectable({ providedIn: 'root' })
export class GestionService {
  private api = inject(ApiService);

  private data<T>(o: Observable<{ data: T }>): Observable<T> {
    return o.pipe(map((r) => r.data));
  }

  // ---------- dashboard ----------
  dashboard() { return this.data(this.api.get<{ data: DashboardData }>('/reports/dashboard')); }
  hoy() {
    return this.data(this.api.get<{ data: { fecha: string; llegadas: Reserva[]; salidas: Reserva[]; en_casa: Reserva[] } }>('/frontdesk/today'));
  }

  // ---------- reservas ----------
  reservas(params: Record<string, unknown>) { return this.api.get<Lista<Reserva>>('/bookings', params); }
  reserva(id: number) { return this.data(this.api.get<{ data: Reserva }>(`/bookings/${id}`)); }
  transicion(id: number, accion: 'confirmar' | 'checkin' | 'checkout' | 'no-show' | 'cancelar') {
    return this.data(this.api.patch<{ data: Reserva }>(`/bookings/${id}/${accion}`, {}));
  }
  registrarPago(p: { reserva_id: number; monto: number; metodo: string; referencia?: string }) {
    return this.data(this.api.post<{ data: PagoRes }>('/payments', p));
  }
  crearReserva(payload: unknown) { return this.data(this.api.post<{ data: Reserva }>('/bookings', payload)); }

  // ---------- hotel ----------
  perfil() { return this.data(this.api.get<{ data: HotelPerfil }>('/manage/hotel')); }
  guardarPerfil(datos: Partial<HotelPerfil>) { return this.data(this.api.put<{ data: HotelPerfil }>('/manage/hotel', datos)); }
  guardarAmenidades(ids: number[]) { return this.api.put('/manage/hotel/amenidades', { amenidades: ids }); }
  agregarFoto(url: string, alt?: string) { return this.api.post('/images', { url, alt }); }
  quitarFoto(id: number) { return this.api.delete(`/images/${id}`); }

  // ---------- tipos y habitaciones ----------
  tipos() { return this.data(this.api.get<{ data: TipoHab[] }>('/room-types')); }
  crearTipo(t: Partial<TipoHab>) { return this.data(this.api.post<{ data: TipoHab }>('/room-types', t)); }
  editarTipo(id: number, t: Partial<TipoHab>) { return this.data(this.api.put<{ data: TipoHab }>(`/room-types/${id}`, t)); }
  borrarTipo(id: number) { return this.api.delete(`/room-types/${id}`); }
  habitaciones() { return this.data(this.api.get<{ data: Hab[] }>('/rooms')); }
  crearHabitacion(h: { tipo_habitacion_id: number; numero_habitacion: string; piso?: number | null }) {
    return this.data(this.api.post<{ data: Hab }>('/rooms', h));
  }
  editarHabitacion(id: number, h: Partial<Hab>) { return this.data(this.api.put<{ data: Hab }>(`/rooms/${id}`, h)); }
  borrarHabitacion(id: number) { return this.api.delete(`/rooms/${id}`); }

  // ---------- plataforma (super_admin) ----------
  hoteles(params: Record<string, unknown> = {}) { return this.api.get<Lista<HotelPerfil>>('/platform/hotels', { limit: 100, ...params }); }
  crearHotel(payload: unknown) { return this.data(this.api.post<{ data: { hotel: HotelPerfil } }>('/platform/hotels', payload)); }
  editarHotel(id: number, datos: Partial<HotelPerfil>) { return this.data(this.api.put<{ data: HotelPerfil }>(`/platform/hotels/${id}`, datos)); }
  estadoHotel(id: number, estado: string) { return this.data(this.api.patch<{ data: HotelPerfil }>(`/platform/hotels/${id}/estado`, { estado })); }
  statsPlataforma() {
    return this.data(this.api.get<{ data: PlataformaStats }>('/platform/stats'));
  }
}
