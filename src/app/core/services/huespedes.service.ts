import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { API_ENDPOINTS } from '../config/endpoints';
import { ApiService } from './api.service';
import { Huesped } from '@app/shared/models/huesped.model';

@Injectable({ providedIn: 'root' })
export class HuespedesService {

  constructor(private api: ApiService) {}

  // ================= LISTAR =================
  getAll(): Observable<Huesped[]> {
    return this.api.get<any>(API_ENDPOINTS.huespedes.list).pipe(
      map(res => this.extractArray(res)),
      catchError(err => {
        console.error('ERROR getAll huéspedes:', err);
        return of([]);
      })
    );
  }

  // ================= POR ID =================
  getById(id: number): Observable<Huesped | null> {
    return this.api.get<any>(API_ENDPOINTS.huespedes.get(id)).pipe(
      map(res => res?.data || null),
      catchError(err => {
        console.error('ERROR getById huésped:', err);
        return of(null);
      })
    );
  }

  // ================= CREAR =================
  create(payload: Partial<Huesped>): Observable<Huesped | null> {
    return this.api.post<any>(API_ENDPOINTS.huespedes.create, payload).pipe(
      map(res => res?.data || null),
      catchError(err => {
        console.error('ERROR create huésped:', err);
        return of(null);
      })
    );
  }

  // ================= ACTUALIZAR =================
  update(id: number, payload: Partial<Huesped>): Observable<Huesped | null> {
    return this.api.put<any>(API_ENDPOINTS.huespedes.update(id), payload).pipe(
      map(res => res?.data || null),
      catchError(err => {
        console.error('ERROR update huésped:', err);
        return of(null);
      })
    );
  }

  // ================= ELIMINAR =================
  delete(id: number): Observable<boolean> {
    return this.api.delete<any>(API_ENDPOINTS.huespedes.delete(id)).pipe(
      map(res => res?.ok === true),
      catchError(err => {
        console.error('ERROR delete huésped:', err);
        return of(false);
      })
    );
  }

  // ================= HELPERS =================
  private extractArray(res: any): Huesped[] {
    if (!res || !res.data || !Array.isArray(res.data)) {
      return [];
    }
    return res.data;
  }
}