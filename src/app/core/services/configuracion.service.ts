import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ConfiguracionItem {
  id: number;
  clave: string;
  valor: any;
  tipo: 'text' | 'number' | 'boolean' | 'json';
}

export interface ConfiguracionSeccion {
  icon: string;
  title: string;
  description: string;
  items: ConfiguracionItem[];
}

interface ApiResponse<T> {
  ok: boolean;
  data: T;
  meta?: any;
}

@Injectable({ providedIn: 'root' })
export class ConfiguracionService {
  private apiUrl = `${environment.apiUrl}/configuracion`;

  constructor(private http: HttpClient) {}

  // Obtener todas las configuraciones
  getAll(): Observable<ConfiguracionItem[]> {
    return this.http.get<ApiResponse<ConfiguracionItem[]>>(this.apiUrl)
      .pipe(
        map(res => res?.data || []),
        catchError(err => {
          console.error('ERROR getAll configuraciones:', err);
          return of([]);
        })
      );
  }

  // Obtener configuración por clave
  getByClave(clave: string): Observable<ConfiguracionItem | null> {
    return this.http.get<ApiResponse<ConfiguracionItem>>(`${this.apiUrl}/${clave}`)
      .pipe(
        map(res => res?.data || null),
        catchError(err => {
          console.error('ERROR getByClave:', err);
          return of(null);
        })
      );
  }

  // Actualizar configuración
  update(clave: string, valor: any): Observable<boolean> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${clave}`, { valor })
      .pipe(
        map(res => res?.ok === true),
        catchError(err => {
          console.error('ERROR update configuracion:', err);
          return of(false);
        })
      );
  }

  // Actualizar múltiples configuraciones
  updateMultiple(items: { clave: string; valor: any }[]): Observable<boolean> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/batch`, { items })
      .pipe(
        map(res => res?.ok === true),
        catchError(err => {
          console.error('ERROR updateMultiple configuraciones:', err);
          return of(false);
        })
      );
  }
}