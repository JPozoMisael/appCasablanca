import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../config/endpoints';


// =========================================
// INTERFACES PÚBLICAS
// =========================================

export interface DashboardStats {
  // Campos que ya devuelve tu API
  totalHabitaciones:   number;
  habitacionesOcupadas: number;
  ingresosMes:         number;

  // Campos opcionales para badges de tendencia.
  // Agrégalos en tu backend cuando quieras activarlos;
  // si no vienen, los badges simplemente no se muestran.
  ingresosMesAnterior?: number;
  reservasAyer?:        number;
  disponiblesAyer?:     number;
}

export interface ReservaHoy {
  id:         number;
  huesped:    string;
  habitacion: string;
  entrada:    string;
  salida:     string;
  estado:     string;
  total:      number;
}


// =========================================
// RESPUESTA BASE DE LA API
// =========================================

interface ApiResponse<T> {
  ok:    boolean;
  data:  T;
  meta?: any;
}


// =========================================
// SERVICIO
// =========================================

@Injectable({ providedIn: 'root' })
export class DashboardService {

  constructor(private api: ApiService) {}


  // =======================================
  // STATS
  // =======================================

  getStats(): Observable<DashboardStats> {
    return this.api
      .get<ApiResponse<DashboardStats>>(API_ENDPOINTS.dashboard.stats)
      .pipe(map(res => res.data));
  }


  // =======================================
  // RESERVAS HOY
  // =======================================

  getReservasHoy(): Observable<ReservaHoy[]> {
    return this.api
      .get<ApiResponse<ReservaHoy[]>>(API_ENDPOINTS.dashboard.reservasHoy)
      .pipe(map(res => res.data));
  }

}