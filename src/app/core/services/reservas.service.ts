import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { API_ENDPOINTS } from '../config/endpoints';
import { ApiService } from './api.service';
import { Reserva } from '@app/shared/models/reserva.model';

// 🔥 estándar de tu API
interface ApiResponse<T> {
  ok: boolean;
  data: T;
  meta?: any;
}

@Injectable({ providedIn: 'root' })
export class ReservasService {

  constructor(private api: ApiService) {}

  // ================= LISTAR =================
  getAll(params?: { estado?: string; desde?: string; hasta?: string }): Observable<Reserva[]> {

    return this.api
      .get<ApiResponse<Reserva[]>>(API_ENDPOINTS.reservas.list, { params })
      .pipe(
        map(res => res?.data || []),
        catchError(err => {
          console.error('ERROR getAll reservas:', err);
          return of([]);
        })
      );
  }

  // ================= POR ID =================
  getById(id: number): Observable<Reserva | null> {

    return this.api
      .get<ApiResponse<Reserva>>(API_ENDPOINTS.reservas.get(id))
      .pipe(
        map(res => res?.data || null),
        catchError(err => {
          console.error('ERROR getById reserva:', err);
          return of(null);
        })
      );
  }

  // ================= CREAR =================
  create(payload: Partial<Reserva>): Observable<Reserva | null> {

    return this.api
      .post<ApiResponse<Reserva>>(API_ENDPOINTS.reservas.create, payload)
      .pipe(
        map(res => res?.data || null),
        catchError(err => {
          console.error('ERROR create reserva:', err);
          return of(null);
        })
      );
  }

  // ================= ACTUALIZAR =================
  update(id: number, payload: Partial<Reserva>): Observable<Reserva | null> {

    return this.api
      .put<ApiResponse<Reserva>>(API_ENDPOINTS.reservas.update(id), payload)
      .pipe(
        map(res => res?.data || null),
        catchError(err => {
          console.error('ERROR update reserva:', err);
          return of(null);
        })
      );
  }

  // ================= CANCELAR =================
  cancel(id: number): Observable<boolean> {

    return this.api
      .post<ApiResponse<any>>(API_ENDPOINTS.reservas.cancel(id), {})
      .pipe(
        map(res => res?.ok === true),
        catchError(err => {
          console.error('ERROR cancel reserva:', err);
          return of(false);
        })
      );
  }

}