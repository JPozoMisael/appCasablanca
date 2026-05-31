import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Tarifa {
  id: number;
  tipo: string;
  temporada: string;
  precio: number;
  estado: 'activo' | 'inactivo';
}

interface ApiResponse<T> {
  ok: boolean;
  data: T;
  meta?: any;
}

@Injectable({ providedIn: 'root' })
export class TarifasService {
  private apiUrl = `${environment.apiUrl}/tarifas`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Tarifa[]> {
    return this.http.get<ApiResponse<any[]>>(this.apiUrl)
      .pipe(
        map(res => {
          const data = res?.data || [];
          return data.map((item: any) => ({
            id: item.id,
            tipo: item.tipoHabitacion?.nombre || item.tipo_habitacion_id || 'N/A',
            temporada: item.temporada?.nombre || item.temporada_id || 'Media',
            precio: item.precio,
            estado: item.estado || 'activo'
          }));
        }),
        catchError(err => {
          console.error('ERROR getAll tarifas:', err);
          return of([]);
        })
      );
  }

  create(payload: { tipo: string; temporada: string; precio: number }): Observable<Tarifa | null> {
    // TODO: Ajustar el payload según tu API real
    return this.http.post<ApiResponse<any>>(this.apiUrl, payload)
      .pipe(
        map(res => res?.data || null),
        catchError(err => {
          console.error('ERROR create tarifa:', err);
          return of(null);
        })
      );
  }

  update(id: number, payload: { tipo: string; temporada: string; precio: number }): Observable<Tarifa | null> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}`, payload)
      .pipe(
        map(res => res?.data || null),
        catchError(err => {
          console.error('ERROR update tarifa:', err);
          return of(null);
        })
      );
  }

  delete(id: number): Observable<boolean> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(res => res?.ok === true),
        catchError(err => {
          console.error('ERROR delete tarifa:', err);
          return of(false);
        })
      );
  }
}