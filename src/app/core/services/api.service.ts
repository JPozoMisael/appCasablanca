import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

type Params = Record<string, any>;

@Injectable({
  providedIn: 'root',
})
export class ApiService {

  // 🔥 TU API REAL (CAMBIA ESTO)
  private baseUrl = 'https://TU_API_DOCKPLOY.com';

  constructor(private http: HttpClient) {}

  /*
  |--------------------------------------------------------------------------
  | GET
  |--------------------------------------------------------------------------
  */
  get<T>(endpoint: string, params?: Params): Observable<T> {

    const url = this.buildUrl(endpoint);

    console.log('🌍 GET URL:', url);

    return this.http.get<T>(url, {
      params: this.buildParams(params),
      headers: this.buildHeaders(),
    });
  }

  /*
  |--------------------------------------------------------------------------
  | POST
  |--------------------------------------------------------------------------
  */
  post<T>(endpoint: string, body?: any, params?: Params): Observable<T> {

    const url = this.buildUrl(endpoint);

    return this.http.post<T>(url, body ?? {}, {
      params: this.buildParams(params),
      headers: this.buildHeaders(),
    });
  }

  /*
  |--------------------------------------------------------------------------
  | PUT
  |--------------------------------------------------------------------------
  */
  put<T>(endpoint: string, body?: any, params?: Params): Observable<T> {

    const url = this.buildUrl(endpoint);

    return this.http.put<T>(url, body ?? {}, {
      params: this.buildParams(params),
      headers: this.buildHeaders(),
    });
  }

  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */
  delete<T>(endpoint: string, params?: Params): Observable<T> {

    const url = this.buildUrl(endpoint);

    return this.http.delete<T>(url, {
      params: this.buildParams(params),
      headers: this.buildHeaders(),
    });
  }

  /*
  |--------------------------------------------------------------------------
  | URL BUILDER (🔥 CLAVE)
  |--------------------------------------------------------------------------
  */
  private buildUrl(endpoint: string): string {

    // Si ya es URL completa, la usa
    if (endpoint.startsWith('http')) return endpoint;

    return `${this.baseUrl}${endpoint}`;
  }

  /*
  |--------------------------------------------------------------------------
  | Helpers
  |--------------------------------------------------------------------------
  */

  private buildParams(params?: Params): HttpParams | undefined {
    if (!params) return undefined;

    let httpParams = new HttpParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') return;
      httpParams = httpParams.set(key, String(value));
    });

    return httpParams;
  }

  private buildHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

}