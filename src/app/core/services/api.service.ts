import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

type Params = Record<string, any>;

@Injectable({
  providedIn: 'root',
})
export class ApiService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /*
  |--------------------------------------------------------------------------
  | GET
  |--------------------------------------------------------------------------
  */
  get<T>(endpoint: string, params?: Params): Observable<T> {

  const url = this.buildUrl(endpoint);

  const httpParams = this.buildParams(params);

  console.log('GET URL FINAL:', url);
  console.log('QUERY PARAMS:', httpParams?.toString()); // 🔥 CLAVE

  return this.http.get<T>(url, {
    params: httpParams,
    headers: this.buildHeaders(),
  });
}

  /*
  |--------------------------------------------------------------------------
  | POST
  |--------------------------------------------------------------------------
  */
  post<T>(endpoint: string, body?: any, options?: { params?: Params }): Observable<T> {

    const url = this.buildUrl(endpoint);

    return this.http.post<T>(url, body ?? {}, {
      params: this.buildParams(options?.params),
      headers: this.buildHeaders(),
    });
  }

  /*
  |--------------------------------------------------------------------------
  | PUT
  |--------------------------------------------------------------------------
  */
  put<T>(endpoint: string, body?: any, options?: { params?: Params }): Observable<T> {

    const url = this.buildUrl(endpoint);

    return this.http.put<T>(url, body ?? {}, {
      params: this.buildParams(options?.params),
      headers: this.buildHeaders(),
    });
  }

  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */
  delete<T>(endpoint: string, options?: { params?: Params }): Observable<T> {

    const url = this.buildUrl(endpoint);

    return this.http.delete<T>(url, {
      params: this.buildParams(options?.params),
      headers: this.buildHeaders(),
    });
  }

  /*
  |--------------------------------------------------------------------------
  | URL BUILDER
  |--------------------------------------------------------------------------
  */
  private buildUrl(endpoint: string): string {

    if (endpoint.startsWith('http')) return endpoint;

    return `${this.baseUrl}${endpoint}`;
  }

  /*
  |--------------------------------------------------------------------------
  | PARAMS BUILDER
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

  /*
  |--------------------------------------------------------------------------
  | HEADERS
  |--------------------------------------------------------------------------
  */
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