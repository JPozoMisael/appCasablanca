/* Utilidades de fechas y presentación del marketplace. Las fechas de negocio son strings YYYY-MM-DD. */

const MS_DIA = 24 * 60 * 60 * 1000;

export function aISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function hoyISO(): string {
  return aISO(new Date());
}

/** Parsea YYYY-MM-DD como fecha local (evita el corrimiento de zona horaria de `new Date('2026-01-05')`). */
export function desdeISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function sumarDias(iso: string, dias: number): string {
  const d = desdeISO(iso);
  d.setDate(d.getDate() + dias);
  return aISO(d);
}

export function nochesEntre(entrada: string, salida: string): number {
  if (!entrada || !salida) return 0;
  const n = Math.round((desdeISO(salida).getTime() - desdeISO(entrada).getTime()) / MS_DIA);
  return n > 0 ? n : 0;
}

export function fechaCorta(iso: string): string {
  return new Intl.DateTimeFormat('es-EC', { weekday: 'short', day: 'numeric', month: 'short' }).format(desdeISO(iso));
}

export function fechaLarga(iso: string): string {
  return new Intl.DateTimeFormat('es-EC', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(
    desdeISO(iso)
  );
}

/** Convierte rutas relativas de assets y URLs absolutas; devuelve un placeholder si no hay imagen. */
export const PLACEHOLDER_HOTEL = 'assets/img/placeholder-hotel.svg';

export function imagenUrl(url?: string | null): string {
  return url && url.trim() ? url : PLACEHOLDER_HOTEL;
}

export function etiquetaRating(rating: number, total: number): string {
  if (!total) return 'Nuevo';
  if (rating >= 9) return 'Excepcional';
  if (rating >= 8.5) return 'Fantástico';
  if (rating >= 8) return 'Muy bueno';
  if (rating >= 7) return 'Bueno';
  return 'Agradable';
}

export const ETIQUETA_TIPO: Record<string, string> = {
  hotel: 'Hotel',
  hostal: 'Hostal',
  hosteria: 'Hostería',
  apart_hotel: 'Apart-hotel',
  cabana: 'Cabañas',
  villa: 'Villa',
  departamento: 'Departamento',
};

export const ETIQUETA_ESTADO: Record<string, { texto: string; color: string }> = {
  pendiente: { texto: 'Pendiente de pago', color: 'warn' },
  confirmada: { texto: 'Confirmada', color: 'ok' },
  check_in: { texto: 'En el hotel', color: 'info' },
  check_out: { texto: 'Completada', color: 'muted' },
  cancelada: { texto: 'Cancelada', color: 'danger' },
  no_show: { texto: 'No se presentó', color: 'danger' },
};
