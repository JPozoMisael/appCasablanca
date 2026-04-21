import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { API_ENDPOINTS } from '../config/endpoints';
import { ApiService } from './api.service';
import { Habitacion } from '@app/shared/models/habitacion.model';

interface ApiResponse {
  data: Habitacion[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

@Injectable({ providedIn: 'root' })
export class HabitacionesService {

  constructor(private api: ApiService) {}

  // ================= DISPONIBLES =================
  getDisponiblesByHotel(
    slug: string,
    filters: any
  ): Observable<{ data: Habitacion[]; meta: any }> {

    if (!slug) {
      console.error('SLUG VACÍO');
      return of({ data: [], meta: {} });
    }

    const params: any = {
      hotel: slug,
      checkIn: filters?.checkIn,
      checkOut: filters?.checkOut,
      adults: filters?.adults,
      children: filters?.children,
      rooms: filters?.rooms,
      withPets: filters?.withPets,

      precioMin: filters?.precioMin,
      precioMax: filters?.precioMax,
      capacidad: filters?.capacidad,
      sort: filters?.sort,

      page: filters?.page || 1,
      limit: filters?.limit || 10
    };

    return this.api
      .get<any>(API_ENDPOINTS.habitaciones.disponibles, { params })
      .pipe(

        map((res: ApiResponse) => ({
          data: this.safeMapArray(res),
          meta: res.meta || {}
        })),

        catchError(err => {
          console.error('ERROR DISPONIBLES:', err);
          return of({ data: [], meta: {} });
        })
      );
  }

  // ================= SAFE MAP =================
  private safeMapArray(res: any): Habitacion[] {

    if (!res || !res.data || !Array.isArray(res.data)) {
      return [];
    }

    return res.data.map((item: any) =>
      this.mapHabitacion(item)
    );
  }

  // ================= MAPPER =================
  private mapHabitacion(item: any): Habitacion {

    return {
      id: item.id,

      numero: String(
        item.numero_habitacion ??
        item.numero ??
        ''
      ),

      tipo:
        item.tipo_nombre ||
        `Habitación ${item.numero_habitacion || item.numero}`,

      descripcion:
        item.descripcion ||
        `Piso ${item.piso ?? 'N/A'}`,

      capacidad: item.capacidad ?? 2,

      camas: item.camas ?? 1,

      precioNoche:
        Number(item.precio_noche ?? item.precio ?? 0),

      estado: item.estado || 'disponible',

      imagenUrl:
        item.imagen_url ||
        item.imagen ||
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',

      hotelSlug:
        item.hotel_slug || ''
    };
  }
}