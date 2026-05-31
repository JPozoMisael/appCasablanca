import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CalendarioService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {
    console.log('✅ CalendarioService constructor ejecutado');
  }

  getHabitaciones(): Observable<any[]> {
    console.log('getHabitaciones llamado');
    return this.http.get<any>(`${this.apiUrl}/rooms`)
      .pipe(
        map(res => {
          const data = res?.data || [];
          return data.map((room: any) => ({
            id: room.id,
            codigo: room.numero_habitacion || room.codigo || `Hab ${room.id}`,
            tipo: room.tipo_habitacion?.nombre || room.tipo || 'Estandar',
            piso: room.piso || '1'
          }));
        }),
        catchError(err => {
          console.error('Error getHabitaciones:', err);
          return of([]);
        })
      );
  }

  getReservas(): Observable<any[]> {
    console.log('getReservas llamado');
    return this.http.get<any>(`${this.apiUrl}/bookings`)
      .pipe(
        map(res => {
          const data = res?.data || [];
          return data.map((booking: any) => ({
            id: booking.id,
            huesped: booking.cliente?.nombres + ' ' + booking.cliente?.apellidos || 'Huésped',
            habitacionId: booking.detalles?.[0]?.habitacion_id || 0,
            checkIn: booking.fecha_entrada,
            checkOut: booking.fecha_salida,
            estado: (booking.estado || 'pendiente').toUpperCase(),
            total: booking.precio_total || 0
          }));
        }),
        catchError(err => {
          console.error('Error getReservas:', err);
          return of([]);
        })
      );
  }

  realizarCheckIn(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/bookings/${id}/checkin`, {});
  }

  realizarCheckOut(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/bookings/${id}/checkout`, {});
  }

  cancelarReserva(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/bookings/${id}/cancelar`, {});
  }

  actualizarEstado(id: number, estado: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/bookings/${id}/estado`, { estado });
  }
}