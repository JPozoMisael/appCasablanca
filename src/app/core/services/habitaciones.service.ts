import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { API_ENDPOINTS } from '../config/endpoints';
import { ApiService } from './api.service';
import { Habitacion } from '@app/shared/models/habitacion.model';

@Injectable({ providedIn: 'root' })
export class HabitacionesService {

  constructor(private api: ApiService) {}

  // ================= TODAS =================
  getAll(): Observable<Habitacion[]> {
    return this.api.get<any>(API_ENDPOINTS.habitaciones.list).pipe(
      map(res => this.safeMapArray(res)),
      catchError(err => {
        console.error('❌ ERROR getAll:', err);
        return of([]);
      })
    );
  }

  // ================= POR HOTEL =================
  getByHotel(slug: string): Observable<Habitacion[]> {

    console.log('📡 LLAMANDO API CON SLUG:', slug);

    if (!slug) {
      console.error('❌ SLUG VACÍO');
      return of([]);
    }

    return this.api.get<any>(API_ENDPOINTS.habitaciones.byHotel(slug)).pipe(

      map((res) => {

        console.log('📡 RESPUESTA CRUDA API:', res);

        // 🔥 VALIDACIÓN CLAVE (evita error HTML)
        if (!res || typeof res !== 'object') {
          console.error('❌ RESPUESTA INVALIDA (no es JSON)');
          return [];
        }

        if (!res.data || !Array.isArray(res.data)) {
          console.warn('⚠️ API sin data válida');
          return [];
        }

        const mapped = res.data.map((item: any, index: number) => {
          console.log(`ITEM [${index}]`, item);
          return this.mapHabitacion(item);
        });

        console.log('✅ RESULTADO FINAL:', mapped);

        return mapped;
      }),

      catchError((err) => {
        console.error('❌ ERROR getByHotel:', err);

        // 🔥 AQUÍ ATRAPAMOS EL ERROR DE HTML (EL TUYO)
        if (err?.error?.text) {
          console.error('❌ API DEVOLVIÓ HTML (URL INCORRECTA)');
        }

        return of([]);
      })
    );
  }

  // ================= SAFE MAP =================
  private safeMapArray(res: any): Habitacion[] {
    if (!res || !res.data || !Array.isArray(res.data)) {
      return [];
    }
    return res.data.map((item: any) => this.mapHabitacion(item));
  }

  // ================= MAPPER =================
  private mapHabitacion(item: any): Habitacion {
    return {
      id: item.id,
      numero: String(item.numero_habitacion ?? item.numero ?? ''),
      tipo: `Habitación ${item.numero_habitacion ?? item.numero}`,
      descripcion: item.descripcion || `Piso ${item.piso}`,
      capacidad: item.capacidad ?? 2,
      camas: item.camas ?? 1,
      precioNoche: item.precio ?? 80,
      estado: item.estado || 'DISPONIBLE',
      imagenUrl: item.imagen || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
      hotelSlug: item.hotel_slug || ''
    };
  }
}