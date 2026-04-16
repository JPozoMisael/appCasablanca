import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment'; 

@Injectable({
  providedIn: 'root'
})
export class HotelesService {

  private API = `${environment.apiUrl}/hoteles`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<any> {
    return this.http.get(this.API);
  }

  getResumen(): Observable<any> {
    return this.http.get(`${this.API}/resumen`);
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.API}/${id}`);
  }

  getBySlug(slug: string): Observable<any> {
    return this.http.get(`${this.API}/slug/${slug}`);
  }
}