import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { CrearReservaPayload, Cotizacion, Reserva, SolicitudReserva } from '@app/shared/models/marketplace.model';

/** Reservas del huésped (invitado o con cuenta), reseñas y favoritos. */
@Injectable({ providedIn: 'root' })
export class BookingService {
  constructor(private api: ApiService) {}

  cotizar(solicitud: SolicitudReserva): Observable<Cotizacion> {
    return this.api.post<{ data: Cotizacion }>('/bookings/quote', solicitud).pipe(map((r) => r.data));
  }

  crear(payload: CrearReservaPayload): Observable<Reserva> {
    return this.api.post<{ data: Reserva }>('/bookings', payload).pipe(map((r) => r.data));
  }

  /** Invitado: código de reserva + email de contacto. */
  consultar(codigo: string, email: string): Observable<Reserva> {
    return this.api.post<{ data: Reserva }>('/bookings/lookup', { codigo, email }).pipe(map((r) => r.data));
  }

  misReservas(params: { estado?: string[]; page?: number; limit?: number } = {}) {
    return this.api.get<{ data: Reserva[]; meta: { total: number; page: number; pages: number } }>('/bookings', {
      ...params,
    });
  }

  obtener(id: number): Observable<Reserva> {
    return this.api.get<{ data: Reserva }>(`/bookings/${id}`).pipe(map((r) => r.data));
  }

  cancelar(id: number, motivo?: string): Observable<Reserva> {
    return this.api.patch<{ data: Reserva }>(`/bookings/${id}/cancelar`, { motivo }).pipe(map((r) => r.data));
  }

  valorar(reserva_id: number, puntuacion: number, titulo?: string, comentario?: string) {
    return this.api.post('/reviews', { reserva_id, puntuacion, titulo, comentario });
  }

  favoritos() {
    return this.api.get<{ data: { hotel: { id: number; slug: string; nombre: string } }[] }>('/favorites').pipe(
      map((r) => r.data)
    );
  }

  agregarFavorito(hotelId: number) {
    return this.api.put(`/favorites/${hotelId}`);
  }

  quitarFavorito(hotelId: number) {
    return this.api.delete(`/favorites/${hotelId}`);
  }
}
