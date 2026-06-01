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

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  constructor(private api: ApiService) {}

  // ================= INGRESOS =================
  ingresos(params: { desde: string; hasta: string }): Observable<any> {
    return this.api
      .get<ApiResponse<any>>(API_ENDPOINTS.reportes.ingresos, params)  // ← sin wrapper { params: ... }
      .pipe(
        map(res => res.data),
        catchError(err => {
          console.error('ERROR ingresos:', err);
          return of(null);
        })
      );
  }

  // ================= OCUPACIÓN =================
  ocupacion(params: { desde: string; hasta: string }): Observable<any> {
    return this.api
      .get<ApiResponse<any>>(API_ENDPOINTS.reportes.ocupacion, params)  // ← sin wrapper
      .pipe(
        map(res => res.data),
        catchError(err => {
          console.error('ERROR ocupación:', err);
          return of(null);
        })
      );
  }

  // ================= RESERVAS =================
  reservas(params: { desde: string; hasta: string }): Observable<any> {
    return this.api
      .get<ApiResponse<any>>(API_ENDPOINTS.reportes.reservas, params)  // ← sin wrapper
      .pipe(
        map(res => res.data),
        catchError(err => {
          console.error('ERROR reservas:', err);
          return of([]);
        })
      );
  }
}