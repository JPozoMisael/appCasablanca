import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

type Params = Record<string, any>;

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  get<T>(url: string, params?: Params): Observable<T> {
    return this.http.get<T>(url, { params: this.toParams(params) });
  }

  post<T>(url: string, body?: any, params?: Params): Observable<T> {
    return this.http.post<T>(url, body ?? {}, { params: this.toParams(params) });
  }

  put<T>(url: string, body?: any, params?: Params): Observable<T> {
    return this.http.put<T>(url, body ?? {}, { params: this.toParams(params) });
  }

  patch<T>(url: string, body?: any, params?: Params): Observable<T> {
    return this.http.patch<T>(url, body ?? {}, { params: this.toParams(params) });
  }

  delete<T>(url: string, params?: Params): Observable<T> {
    return this.http.delete<T>(url, { params: this.toParams(params) });
  }

  private toParams(params?: Params): HttpParams | undefined {
    if (!params) return undefined;
    let httpParams = new HttpParams();

    Object.entries(params).forEach(([k, v]) => {
      if (v === null || v === undefined || v === '') return;
      httpParams = httpParams.set(k, String(v));
    });

    return httpParams;
  }
}
