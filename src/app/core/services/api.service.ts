import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

type Params = Record<string, unknown>;

/**
 * Cliente HTTP delgado sobre la API. El token lo agrega el interceptor de autenticación.
 * Acepta rutas relativas ('/hotels') o URLs completas (los endpoints ya traen la base).
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get<T>(endpoint: string, params?: Params): Observable<T> {
    return this.http.get<T>(this.buildUrl(endpoint), { params: this.buildParams(params) });
  }

  post<T>(endpoint: string, body?: unknown, options?: { params?: Params }): Observable<T> {
    return this.http.post<T>(this.buildUrl(endpoint), body ?? {}, {
      params: this.buildParams(options?.params),
    });
  }

  put<T>(endpoint: string, body?: unknown, options?: { params?: Params }): Observable<T> {
    return this.http.put<T>(this.buildUrl(endpoint), body ?? {}, {
      params: this.buildParams(options?.params),
    });
  }

  patch<T>(endpoint: string, body?: unknown, options?: { params?: Params }): Observable<T> {
    return this.http.patch<T>(this.buildUrl(endpoint), body ?? {}, {
      params: this.buildParams(options?.params),
    });
  }

  delete<T>(endpoint: string, params?: Params): Observable<T> {
    return this.http.delete<T>(this.buildUrl(endpoint), { params: this.buildParams(params) });
  }

  private buildUrl(endpoint: string): string {
    if (/^https?:\/\//i.test(endpoint)) return endpoint;
    return `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  }

  // Omite null/undefined/'' y serializa arrays como valores separados por coma.
  private buildParams(params?: Params): HttpParams | undefined {
    if (!params) return undefined;
    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === null || value === undefined || value === '') continue;
      if (Array.isArray(value)) {
        if (value.length) httpParams = httpParams.set(key, value.join(','));
      } else {
        httpParams = httpParams.set(key, String(value));
      }
    }
    return httpParams;
  }
}
