import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { API_ENDPOINTS } from '../config/endpoints';
import { ApiService } from './api.service';
import { Usuario } from '@app/shared/models/usuario.model';

interface ApiResponse<T> {
  ok: boolean;
  data: T;
  meta?: any;
}

@Injectable({ providedIn: 'root' })
export class UsuariosService {

  constructor(private api: ApiService) {}

  // ================= LISTAR =================
  getAll(): Observable<Usuario[]> {
    return this.api
      .get<ApiResponse<Usuario[]>>(API_ENDPOINTS.usuarios.list)
      .pipe(
        map(res => res?.data || []),
        catchError(err => {
          console.error('ERROR getAll usuarios:', err);
          return of([]);
        })
      );
  }

  // ================= POR ID =================
  getById(id: number): Observable<Usuario | null> {
    return this.api
      .get<ApiResponse<Usuario>>(API_ENDPOINTS.usuarios.get(id))
      .pipe(
        map(res => res?.data || null),
        catchError(err => {
          console.error('ERROR getById usuario:', err);
          return of(null);
        })
      );
  }

  // ================= CREAR =================
  create(payload: Partial<Usuario>): Observable<Usuario | null> {
    return this.api
      .post<ApiResponse<Usuario>>(API_ENDPOINTS.usuarios.create, payload)
      .pipe(
        map(res => res?.data || null),
        catchError(err => {
          console.error('ERROR create usuario:', err);
          return of(null);
        })
      );
  }

  // ================= ACTUALIZAR =================
  update(id: number, payload: Partial<Usuario>): Observable<Usuario | null> {
    return this.api
      .put<ApiResponse<Usuario>>(API_ENDPOINTS.usuarios.update(id), payload)
      .pipe(
        map(res => res?.data || null),
        catchError(err => {
          console.error('ERROR update usuario:', err);
          return of(null);
        })
      );
  }

  // ================= ELIMINAR =================
  delete(id: number): Observable<boolean> {
    return this.api
      .delete<ApiResponse<any>>(API_ENDPOINTS.usuarios.delete(id))
      .pipe(
        map(res => res?.ok === true),
        catchError(err => {
          console.error('ERROR delete usuario:', err);
          return of(false);
        })
      );
  }

}