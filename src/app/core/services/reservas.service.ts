import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../config/endpoints';
import { ApiService } from './api.services';
import { Reserva } from '@app/shared/models/reserva.model';

@Injectable({ providedIn: 'root' })
export class ReservasService {
  constructor(private api: ApiService) {}

  getAll(params?: { estado?: string; desde?: string; hasta?: string }): Observable<Reserva[]> {
    return this.api.get<Reserva[]>(API_ENDPOINTS.reservas.list, params);
  }

  getById(id: number): Observable<Reserva> {
    return this.api.get<Reserva>(API_ENDPOINTS.reservas.get(id));
  }

  create(payload: Partial<Reserva>): Observable<Reserva> {
    return this.api.post<Reserva>(API_ENDPOINTS.reservas.create, payload);
  }

  update(id: number, payload: Partial<Reserva>): Observable<Reserva> {
    return this.api.put<Reserva>(API_ENDPOINTS.reservas.update(id), payload);
  }

  cancel(id: number): Observable<any> {
    return this.api.post(API_ENDPOINTS.reservas.cancel(id), {});
  }
}
