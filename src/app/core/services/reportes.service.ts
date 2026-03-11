import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../config/endpoints';
import { ApiService } from './api.services';

@Injectable({ providedIn: 'root' })
export class ReportesService {
  constructor(private api: ApiService) {}

  ingresos(params: { desde: string; hasta: string }): Observable<any> {
    return this.api.get(API_ENDPOINTS.reportes.ingresos, params);
  }

  ocupacion(params: { desde: string; hasta: string }): Observable<any> {
    return this.api.get(API_ENDPOINTS.reportes.ocupacion, params);
  }

  reservas(params: { desde: string; hasta: string }): Observable<any> {
    return this.api.get(API_ENDPOINTS.reportes.reservas, params);
  }
}
