import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../config/endpoints';
import { ApiService } from './api.services';
import { Habitacion } from '@app/shared/models/habitacion.model';

@Injectable({ providedIn: 'root' })
export class HabitacionesService {
  constructor(private api: ApiService) {}

  getAll(): Observable<Habitacion[]> {
    return this.api.get<Habitacion[]>(API_ENDPOINTS.habitaciones.list);
  }

  getById(id: number): Observable<Habitacion> {
    return this.api.get<Habitacion>(API_ENDPOINTS.habitaciones.get(id));
  }

  getDisponibles(params: {
    checkIn?: string;
    checkOut?: string;
    adults?: number;
    children?: number;
    rooms?: number;
  }): Observable<Habitacion[]> {
    return this.api.get<Habitacion[]>(API_ENDPOINTS.habitaciones.disponibles, params);
  }

  create(payload: Partial<Habitacion>): Observable<Habitacion> {
    return this.api.post<Habitacion>(API_ENDPOINTS.habitaciones.create, payload);
  }

  update(id: number, payload: Partial<Habitacion>): Observable<Habitacion> {
    return this.api.put<Habitacion>(API_ENDPOINTS.habitaciones.update(id), payload);
  }

  delete(id: number): Observable<any> {
    return this.api.delete(API_ENDPOINTS.habitaciones.delete(id));
  }
}
