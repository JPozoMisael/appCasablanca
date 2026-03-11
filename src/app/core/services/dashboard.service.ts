import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.services';
import { API_ENDPOINTS } from '../config/endpoints';

export interface DashboardStats {
  totalHabitaciones: number;
  habitacionesOcupadas: number;
  ingresosMes: number;
}

export interface ReservaHoy {
  id: number;
  huesped: string;
  habitacion: string;
  entrada: string;
  salida: string;
  estado: string;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private api: ApiService) {}

  getStats(): Observable<DashboardStats> {
    return this.api.get<DashboardStats>(API_ENDPOINTS.dashboard.stats);
  }

  getReservasHoy(): Observable<ReservaHoy[]> {
    return this.api.get<ReservaHoy[]>(API_ENDPOINTS.dashboard.reservasHoy);
  }

}