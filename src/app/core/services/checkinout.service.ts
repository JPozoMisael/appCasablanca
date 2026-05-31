import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ReservaCheck {
  id: number;
  huesped: string;
  habitacion: string;
  fechaEntrada: string;
  fechaSalida: string;
  tipo: 'checkin' | 'checkout';
  documento?: string;
  telefono?: string;
}

interface ApiResponse<T> {
  ok: boolean;
  data: T;
  meta?: any;
}

@Injectable({ providedIn: 'root' })
export class CheckinOutService {
  private apiUrl = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient) {}

  // Obtener reservas para check-in (fecha_entrada = hoy, estado confirmada)
  getCheckinsPendientes(): Observable<ReservaCheck[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}?fecha_entrada=${today}&estado=confirmada`)
      .pipe(
        map(res => {
          const data = res?.data || [];
          return data.map((booking: any) => ({
            id: booking.id,
            huesped: `${booking.cliente?.nombres || ''} ${booking.cliente?.apellidos || ''}`.trim() || 'Huésped',
            habitacion: booking.detalles?.[0]?.habitacion?.numero_habitacion || 'N/A',
            fechaEntrada: booking.fecha_entrada,
            fechaSalida: booking.fecha_salida,
            tipo: 'checkin' as const,
            documento: booking.cliente?.documento_identidad
          }));
        }),
        catchError(err => {
          console.error('ERROR getCheckinsPendientes:', err);
          return of([]);
        })
      );
  }

  // Obtener reservas para check-out (fecha_salida = hoy, estado check_in)
  getCheckoutsPendientes(): Observable<ReservaCheck[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}?fecha_salida=${today}&estado=check_in`)
      .pipe(
        map(res => {
          const data = res?.data || [];
          return data.map((booking: any) => ({
            id: booking.id,
            huesped: `${booking.cliente?.nombres || ''} ${booking.cliente?.apellidos || ''}`.trim() || 'Huésped',
            habitacion: booking.detalles?.[0]?.habitacion?.numero_habitacion || 'N/A',
            fechaEntrada: booking.fecha_entrada,
            fechaSalida: booking.fecha_salida,
            tipo: 'checkout' as const,
            documento: booking.cliente?.documento_identidad
          }));
        }),
        catchError(err => {
          console.error('ERROR getCheckoutsPendientes:', err);
          return of([]);
        })
      );
  }

  // Realizar check-in
  realizarCheckIn(id: number): Observable<boolean> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/${id}/checkin`, {})
      .pipe(
        map(res => res?.ok === true),
        catchError(err => {
          console.error('ERROR realizarCheckIn:', err);
          return of(false);
        })
      );
  }

  // Realizar check-out
  realizarCheckOut(id: number): Observable<boolean> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/${id}/checkout`, {})
      .pipe(
        map(res => res?.ok === true),
        catchError(err => {
          console.error('ERROR realizarCheckOut:', err);
          return of(false);
        })
      );
  }
}