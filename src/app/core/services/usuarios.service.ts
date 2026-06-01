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

  constructor(private api: ApiService) {
    console.log('🟢 [SERVICE] UsuariosService inicializado');
  }

  getAll(): Observable<Usuario[]> {
    console.log('🟢 [SERVICE] getAll - URL:', API_ENDPOINTS.usuarios.list);
    return this.api
      .get<ApiResponse<Usuario[]>>(API_ENDPOINTS.usuarios.list)
      .pipe(
        map(res => {
          console.log('🟢 [SERVICE] getAll - Respuesta recibida:', res);
          return res?.data || [];
        }),
        catchError(err => {
          console.error('🔴 [SERVICE] getAll - Error:', err);
          return of([]);
        })
      );
  }

  getById(id: number): Observable<Usuario | null> {
    console.log('🟢 [SERVICE] getById - ID:', id);
    return this.api
      .get<ApiResponse<Usuario>>(API_ENDPOINTS.usuarios.get(id))
      .pipe(
        map(res => {
          console.log('🟢 [SERVICE] getById - Respuesta:', res);
          return res?.data || null;
        }),
        catchError(err => {
          console.error('🔴 [SERVICE] getById - Error:', err);
          return of(null);
        })
      );
  }

  create(payload: Partial<Usuario>): Observable<Usuario | null> {
    console.log('🟢 [SERVICE] create - URL:', API_ENDPOINTS.usuarios.create);
    console.log('🟢 [SERVICE] create - Payload:', payload);
    return this.api
      .post<ApiResponse<Usuario>>(API_ENDPOINTS.usuarios.create, payload)
      .pipe(
        map(res => {
          console.log('🟢 [SERVICE] create - Respuesta:', res);
          return res?.data || null;
        }),
        catchError(err => {
          console.error('🔴 [SERVICE] create - Error:', err);
          return of(null);
        })
      );
  }

  update(id: number, payload: Partial<Usuario>): Observable<Usuario | null> {
    console.log('🟢 [SERVICE] update - ID:', id);
    console.log('🟢 [SERVICE] update - URL:', API_ENDPOINTS.usuarios.update(id));
    console.log('🟢 [SERVICE] update - Payload:', payload);
    return this.api
      .put<ApiResponse<Usuario>>(API_ENDPOINTS.usuarios.update(id), payload)
      .pipe(
        map(res => {
          console.log('🟢 [SERVICE] update - Respuesta:', res);
          return res?.data || null;
        }),
        catchError(err => {
          console.error('🔴 [SERVICE] update - Error:', err);
          return of(null);
        })
      );
  }

  delete(id: number): Observable<boolean> {
    console.log('🟢 [SERVICE] delete - ID:', id);
    console.log('🟢 [SERVICE] delete - URL:', API_ENDPOINTS.usuarios.delete(id));
    return this.api
      .delete<ApiResponse<any>>(API_ENDPOINTS.usuarios.delete(id))
      .pipe(
        map(res => {
          console.log('🟢 [SERVICE] delete - Respuesta:', res);
          return res?.ok === true;
        }),
        catchError(err => {
          console.error('🔴 [SERVICE] delete - Error:', err);
          return of(false);
        })
      );
  }
}