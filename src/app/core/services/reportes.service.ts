import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { API_ENDPOINTS } from '../config/endpoints';
import { ApiService } from './api.service';

interface ApiResponse<T> {
  ok: boolean;
  data: T;
  meta?: any;
}

@Injectable({ providedIn: 'root' })
export class ReportesService {

  constructor(private api: ApiService) {}

  // ================= INGRESOS =================
  ingresos(params: { desde: string; hasta: string }): Observable<any> {
    return this.api
      .get<ApiResponse<any>>(API_ENDPOINTS.reportes.ingresos, {
        fecha_inicio: params.desde,
        fecha_fin: params.hasta
      })
      .pipe(
        map(res => res?.data ?? null),
        catchError(err => {
          console.error('ERROR ingresos:', err);
          return of(null);
        })
      );
  }

  // ================= OCUPACIÓN =================
  ocupacion(params: { desde: string; hasta: string }): Observable<any> {
    return this.api
      .get<ApiResponse<any>>(API_ENDPOINTS.reportes.ocupacion, {
        fecha_inicio: params.desde,
        fecha_fin: params.hasta
      })
      .pipe(
        map(res => res?.data ?? null),
        catchError(err => {
          console.error('ERROR ocupación:', err);
          return of(null);
        })
      );
  }

  // ================= RESERVAS POR ESTADO =================
  reservas(params: { desde: string; hasta: string }): Observable<any> {
    return this.api
      .get<ApiResponse<any>>(API_ENDPOINTS.reportes.reservas)
      .pipe(
        map(res => res?.data ?? null),
        catchError(err => {
          console.error('ERROR reservas:', err);
          return of(null);
        })
      );
  }

  // ================= DASHBOARD =================
  dashboard(): Observable<any> {
    return this.api
      .get<ApiResponse<any>>(API_ENDPOINTS.reportes.dashboard)
      .pipe(
        map(res => res?.data ?? null),
        catchError(err => {
          console.error('ERROR dashboard:', err);
          return of(null);
        })
      );
  }

  // ================= CANCELACIONES =================
  cancelaciones(params: { desde: string; hasta: string }): Observable<any> {
    return this.api
      .get<ApiResponse<any>>(API_ENDPOINTS.reportes.cancelaciones, {
        fecha_inicio: params.desde,
        fecha_fin: params.hasta
      })
      .pipe(
        map(res => res?.data ?? null),
        catchError(err => {
          console.error('ERROR cancelaciones:', err);
          return of(null);
        })
      );
  }
}