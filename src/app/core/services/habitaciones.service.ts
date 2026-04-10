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
        console.error('ERROR getAll:', err);
        return of([]);
      })
    );
  }

  // ================= POR HOTEL =================
  getByHotel(slug: string): Observable<Habitacion[]> {

    if (!slug) {
      console.error('SLUG VACÍO');
      return of([]);
    }

    return this.api.get<any>(API_ENDPOINTS.habitaciones.byHotel(slug)).pipe(

      map(res => this.safeMapArray(res)),

      catchError(err => {
        console.error('ERROR getByHotel:', err);
        return of([]);
      })
    );
  }

  // ================= DISPONIBILIDAD REAL =================
  getDisponiblesByHotel(
    slug: string,
    filters: any
  ): Observable<Habitacion[]> {

    console.log('BUSCANDO DISPONIBLES:', { slug, filters });

    if (!slug) {
      console.error('SLUG VACÍO');
      return of([]);
    }

    const params: any = {};

    if (filters?.checkIn) params.checkIn = filters.checkIn;
    if (filters?.checkOut) params.checkOut = filters.checkOut;
    if (filters?.adults) params.adults = filters.adults;
    if (filters?.children) params.children = filters.children;
    if (filters?.rooms) params.rooms = filters.rooms;
    if (filters?.withPets !== undefined) params.withPets = filters.withPets;

    params.hotel = slug;

    return this.api.get<any>(
      API_ENDPOINTS.habitaciones.disponibles,
      { params }
    ).pipe(

      map((res) => {

        console.log('RESPUESTA DISPONIBLES:', res);

        if (!res || typeof res !== 'object') {
          console.error('RESPUESTA NO ES JSON');
          return [];
        }

        if (!res.data || !Array.isArray(res.data)) {
          console.warn('API SIN DATA');
          return [];
        }

        return res.data.map((item: any) =>
          this.mapHabitacion(item)
        );
      }),

      catchError((err) => {

        console.error('ERROR DISPONIBLES:', err);

        if (err?.error?.text) {
          console.error('API DEVOLVIÓ HTML (endpoint incorrecto)');
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

      tipo: item.tipo_nombre || `Habitación ${item.numero}`,

      descripcion:
        item.descripcion ||
        `Piso ${item.piso || 'N/A'}`,

      capacidad: item.capacidad ?? 2,

      camas: item.camas ?? 1,

      precioNoche: item.precio ?? 80,

      estado: item.estado || 'DISPONIBLE',

      imagenUrl:
        item.imagen ||
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',

      hotelSlug: item.hotel_slug || ''
    };
  }
}