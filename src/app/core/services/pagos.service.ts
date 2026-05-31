import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Pago {
  id: number;
  reserva_id: number;
  codigo_reserva?: string;
  huesped?: string;
  monto: number;
  fecha_pago: string;
  metodo: string;
  estado: string;
}

interface ApiResponse<T> {
  ok: boolean;
  data: T;
  meta?: any;
}

@Injectable({ providedIn: 'root' })
export class PagosService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Pago[]> {
    return this.http.get<ApiResponse<Pago[]>>(this.apiUrl)
      .pipe(
        map(res => {
          if (res?.ok && res.data) {
            return res.data;
          }
          return [];
        }),
        catchError(err => {
          console.error('ERROR getAll pagos:', err);
          return of([]);
        })
      );
  }

  getById(id: number): Observable<Pago | null> {
    return this.http.get<ApiResponse<Pago>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(res => res?.data || null),
        catchError(err => {
          console.error('ERROR getById pago:', err);
          return of(null);
        })
      );
  }
}