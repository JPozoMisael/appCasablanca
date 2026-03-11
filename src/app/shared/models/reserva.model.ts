export type EstadoReserva = 'PENDIENTE' | 'CONFIRMADA' | 'CHECKIN' | 'CHECKOUT' | 'CANCELADA';

export interface Reserva {
  id: number;
  huespedId: number;
  habitacionId: number;
  checkIn: string;   // YYYY-MM-DD
  checkOut: string;  // YYYY-MM-DD
  adultos: number;
  ninos: number;
  total: number;
  estado: EstadoReserva;

  codigo?: string | null;
  creadoEn?: string;
  actualizadoEn?: string;
}
