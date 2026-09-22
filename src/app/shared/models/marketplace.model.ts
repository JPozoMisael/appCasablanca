/* Tipos del marketplace, alineados con la API (`/api/v1`). */

export type TipoAlojamiento =
  | 'hotel'
  | 'hostal'
  | 'hosteria'
  | 'apart_hotel'
  | 'cabana'
  | 'villa'
  | 'departamento';

export type PoliticaCancelacion = 'flexible' | 'moderada' | 'estricta';

export type EstadoReserva =
  | 'pendiente'
  | 'confirmada'
  | 'check_in'
  | 'check_out'
  | 'cancelada'
  | 'no_show';

export interface Zona {
  id: number;
  nombre: string;
  slug: string;
  descripcion?: string | null;
  parroquia?: string | null;
  imagen_url?: string | null;
  latitud?: number | string | null;
  longitud?: number | string | null;
  total_hoteles: number;
  precio_desde: number | null;
}

export interface Amenidad {
  id: number;
  nombre: string;
  slug: string;
  icono?: string | null;
  categoria: string;
}

export interface AmenidadResumen {
  slug: string;
  nombre: string;
  icono?: string | null;
}

export interface HotelResumen {
  id: number;
  slug: string;
  nombre: string;
  tipo_alojamiento: TipoAlojamiento;
  estrellas: number | null;
  direccion?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  imagen_principal: string | null;
  zona: { nombre: string; slug: string } | null;
  rating: number;
  total_valoraciones: number;
  destacado: boolean;
  politica_cancelacion?: PoliticaCancelacion;
  amenidades?: AmenidadResumen[];
  /** Precio por habitación y noche (sin impuestos). */
  precio_noche: number;
  /** Solo con fechas: total de la estadía para el grupo buscado. */
  precio_total?: number;
  habitaciones_disponibles?: number;
  tipo_sugerido?: { id: number; nombre: string };
}

export interface FacetValor {
  valor: string | number;
  total: number;
  nombre?: string;
}

export interface Facets {
  zonas: FacetValor[];
  tipos: FacetValor[];
  estrellas: FacetValor[];
  amenidades: FacetValor[];
  precio: { min: number; max: number };
}

export interface BusquedaMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
  noches: number | null;
  orden?: string;
}

export interface BusquedaResponse {
  ok: boolean;
  data: HotelResumen[];
  meta: BusquedaMeta;
  facets: Facets;
}

export interface BusquedaParams {
  zona?: string;
  q?: string;
  checkIn?: string;
  checkOut?: string;
  adultos?: number;
  ninos?: number;
  habitaciones?: number;
  precioMin?: number;
  precioMax?: number;
  estrellas?: number;
  rating?: number;
  tipos?: string[];
  amenidades?: string[];
  orden?: string;
  page?: number;
  limit?: number;
}

export interface Imagen {
  id: number;
  url: string;
  alt?: string | null;
  orden: number;
  tipo_habitacion_id?: number | null;
}

export interface TipoHabitacion {
  id: number;
  nombre: string;
  descripcion?: string | null;
  capacidad_maxima: number;
  metros_cuadrados?: number | string | null;
  camas_sencillas: number;
  camas_dobles: number;
  tiene_vista: boolean;
  tiene_balcon: boolean;
  desayuno_incluido: boolean;
  precio_base: number | string;
  amenidades?: Amenidad[];
  imagenes?: Imagen[];
}

export interface Servicio {
  id: number;
  nombre: string;
  descripcion?: string | null;
  precio: number | string;
  tipo: string;
}

export interface Politica {
  nombre: PoliticaCancelacion;
  diasGratis: number;
  descripcion: string;
}

export interface HotelFicha {
  id: number;
  slug: string;
  nombre: string;
  tipo_alojamiento: TipoAlojamiento;
  descripcion?: string | null;
  direccion?: string | null;
  ciudad: string;
  telefono?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  sitio_web?: string | null;
  estrellas: number | null;
  latitud?: number | string | null;
  longitud?: number | string | null;
  imagen_principal: string | null;
  hora_checkin: string;
  hora_checkout: string;
  rating_promedio: number | string;
  total_valoraciones: number;
  zona?: { id: number; nombre: string; slug: string; descripcion?: string | null } | null;
  amenidades: Amenidad[];
  imagenes: Imagen[];
  tiposHabitacion: TipoHabitacion[];
  servicios: Servicio[];
  politica: Politica;
  precio_desde: number | null;
  distribucion_puntuacion: { puntuacion: number; total: number }[];
}

export interface TipoDisponible extends TipoHabitacion {
  disponibles: number;
  cabe_el_grupo: boolean;
  reservable: boolean;
  precio_promedio_noche: number | null;
  precio_total: number | null;
}

export interface Disponibilidad {
  hotel: { id: number; slug: string; nombre: string };
  fecha_entrada: string;
  fecha_salida: string;
  noches: number;
  adultos: number;
  ninos: number;
  iva_porcentaje: number;
  habitaciones: TipoDisponible[];
}

export interface Valoracion {
  id: number;
  puntuacion: number;
  titulo?: string | null;
  comentario?: string | null;
  respuesta_hotel?: string | null;
  fecha: string;
  autor: string;
  verificada: boolean;
}

/* ---------- Reservas ---------- */
export interface ItemReserva {
  tipo_habitacion_id: number;
  cantidad: number;
}

export interface ContactoHuesped {
  nombres?: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
}

export interface SolicitudReserva {
  hotel_id: number;
  fecha_entrada: string;
  fecha_salida: string;
  adultos: number;
  ninos: number;
  habitaciones: ItemReserva[];
  servicios?: { servicio_id: number; cantidad: number }[];
}

export interface CrearReservaPayload extends SolicitudReserva {
  contacto?: ContactoHuesped;
  observaciones?: string;
  pago_en_hotel?: boolean;
}

export interface EvaluacionCancelacion {
  politica: PoliticaCancelacion;
  gratis: boolean;
  limite_cancelacion_gratis: string;
  penalizacion: number;
}

export interface Cotizacion {
  hotel: { id: number; nombre: string; slug: string };
  fecha_entrada: string;
  fecha_salida: string;
  noches: number;
  adultos: number;
  ninos: number;
  habitaciones: {
    tipo_habitacion_id: number;
    tipo: string;
    capacidad: number;
    precio_promedio_noche: number;
    subtotal: number;
    por_noche: { fecha: string; precio: number; temporada: string | null }[];
  }[];
  servicios: { servicio_id: number; nombre: string; cantidad: number; precio_unitario: number; subtotal: number }[];
  subtotal: number;
  iva_porcentaje: number;
  impuestos: number;
  total: number;
  cancelacion: EvaluacionCancelacion;
  politica: Politica;
}

export interface Reserva {
  id: number;
  codigo_reserva: string;
  hotel_id: number;
  estado: EstadoReserva;
  fecha_entrada: string;
  fecha_salida: string;
  num_huespedes: number;
  num_ninos: number;
  subtotal: number | string;
  impuestos: number | string;
  precio_total: number | string;
  pagado: number;
  saldo: number;
  expira_en?: string | null;
  canal: string;
  observaciones?: string | null;
  cancelacion: EvaluacionCancelacion;
  cliente?: { id: number; nombres: string; apellidos: string; email?: string | null; telefono?: string | null };
  hotel?: {
    id: number;
    nombre: string;
    slug: string;
    direccion?: string | null;
    telefono?: string | null;
    whatsapp?: string | null;
    email?: string | null;
    imagen_principal?: string | null;
    hora_checkin?: string;
    hora_checkout?: string;
  };
  detalles?: {
    id: number;
    precio_noche: number | string;
    noches: number;
    subtotal: number | string;
    habitacion?: { id: number; numero_habitacion: string; tipoHabitacion?: { id: number; nombre: string } };
  }[];
  servicios?: { id: number; cantidad: number; subtotal: number | string; servicio?: { nombre: string } }[];
  valoracion?: { id: number } | null;
}
