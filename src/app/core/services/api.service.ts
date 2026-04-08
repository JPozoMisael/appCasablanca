import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

type Params = Record<string, any>;

@Injectable({
  providedIn: 'root',
})
export class ApiService {

  constructor(private http: HttpClient) {}

  /*
  |--------------------------------------------------------------------------
  | GET
  |--------------------------------------------------------------------------
  */
  get<T>(url: string, params?: Params): Observable<T> {
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
  post<T>(url: string, body?: any, params?: Params): Observable<T> {
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
  put<T>(url: string, body?: any, params?: Params): Observable<T> {
    return this.http.put<T>(url, body ?? {}, {
      params: this.buildParams(params),
      headers: this.buildHeaders(),
    });
  }

  /*
  |--------------------------------------------------------------------------
  | PATCH
  |--------------------------------------------------------------------------
  */
  patch<T>(url: string, body?: any, params?: Params): Observable<T> {
    return this.http.patch<T>(url, body ?? {}, {
      params: this.buildParams(params),
      headers: this.buildHeaders(),
    });
  }

  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */
  delete<T>(url: string, params?: Params): Observable<T> {
    return this.http.delete<T>(url, {
      params: this.buildParams(params),
      headers: this.buildHeaders(),
    });
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