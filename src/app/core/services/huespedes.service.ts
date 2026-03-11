import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../config/endpoints';
import { ApiService } from './api.services';
import { Huesped } from '@app/shared/models/huesped.model';

@Injectable({ providedIn: 'root' })
export class HuespedesService {
  constructor(private api: ApiService) {}

  getAll(): Observable<Huesped[]> {
    return this.api.get<Huesped[]>(API_ENDPOINTS.huespedes.list);
  }

  getById(id: number): Observable<Huesped> {
    return this.api.get<Huesped>(API_ENDPOINTS.huespedes.get(id));
  }

  create(payload: Partial<Huesped>): Observable<Huesped> {
    return this.api.post<Huesped>(API_ENDPOINTS.huespedes.create, payload);
  }

  update(id: number, payload: Partial<Huesped>): Observable<Huesped> {
    return this.api.put<Huesped>(API_ENDPOINTS.huespedes.update(id), payload);
  }

  delete(id: number): Observable<any> {
    return this.api.delete(API_ENDPOINTS.huespedes.delete(id));
  }
}
