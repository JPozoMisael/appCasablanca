import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  estado: 'activo' | 'inactivo';
  icono: string;
}

interface ApiResponse<T> {
  ok: boolean;
  data: T;
  meta?: any;
}

@Injectable({ providedIn: 'root' })
export class ServiciosService {
  private apiUrl = `${environment.apiUrl}/services`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Servicio[]> {
    return this.http.get<ApiResponse<any[]>>(this.apiUrl)
      .pipe(
        map(res => {
          const data = res?.data || [];
          return data.map((item: any) => ({
            id: item.id,
            nombre: item.nombre,
            descripcion: item.descripcion || '',
            precio: item.precio,
            estado: item.estado || 'activo',
            icono: item.icono || 'restaurant-outline'
          }));
        }),
        catchError(err => {
          console.error('ERROR getAll servicios:', err);
          return of([]);
        })
      );
  }

  create(payload: { nombre: string; descripcion: string; precio: number; icono: string }): Observable<Servicio | null> {
    return this.http.post<ApiResponse<any>>(this.apiUrl, payload)
      .pipe(
        map(res => res?.data || null),
        catchError(err => {
          console.error('ERROR create servicio:', err);
          return of(null);
        })
      );
  }

  update(id: number, payload: { nombre: string; descripcion: string; precio: number; icono: string }): Observable<Servicio | null> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}`, payload)
      .pipe(
        map(res => res?.data || null),
        catchError(err => {
          console.error('ERROR update servicio:', err);
          return of(null);
        })
      );
  }

  delete(id: number): Observable<boolean> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(res => res?.ok === true),
        catchError(err => {
          console.error('ERROR delete servicio:', err);
          return of(false);
        })
      );
  }
}