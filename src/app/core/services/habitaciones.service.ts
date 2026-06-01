import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { API_ENDPOINTS } from '../config/endpoints';
import { ApiService } from './api.service';
import { Habitacion } from '@app/shared/models/habitacion.model';

interface ApiResponse {
  data: any[];

  meta?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class HabitacionesService {

  constructor(
    private api: ApiService
  ) {}

  // ======================================================
  // DISPONIBLES
  // ======================================================
  getDisponiblesByHotel(
    slug: string,
    filters: any
  ): Observable<{ data: Habitacion[]; meta: any }> {

    if (!slug) {

      console.error('SLUG VACÍO');

      return of({
        data: [],
        meta: {}
      });
    }

    const params: any = {

      // HOTEL
      hotel: slug,

      // FECHAS
      checkIn: filters?.checkIn || '',
      checkOut: filters?.checkOut || '',

      // HUESPEDES
      adults: filters?.adults || 2,
      children: filters?.children || 0,
      rooms: filters?.rooms || 1,
      withPets: filters?.withPets || 0,

      // FILTROS
      precioMin: filters?.precioMin || 0,
      precioMax: filters?.precioMax || 500,
      capacidad: filters?.capacidad || 1,
      sort: filters?.sort || 'recomendado',

      // PAGINACION
      page: filters?.page || 1,
      limit: filters?.limit || 10
    };

    console.log('PARAMS ENVIADOS:', params);

    return this.api
      .get<any>(
        API_ENDPOINTS.habitaciones.disponibles,
        params // 🔥 CORREGIDO
      )
      .pipe(

        map((res: ApiResponse) => ({

          data: this.safeMapArray(res),

          meta: res.meta || {}
        })),

        catchError((err: any) => {

          console.error(
            'ERROR DISPONIBLES:',
            err
          );

          return of({
            data: [],
            meta: {}
          });
        })
      );
  }


  getAll(): Observable<Habitacion[]> {
  return this.api
    .get<any>(API_ENDPOINTS.habitaciones.list)
    .pipe(
      map((res: any) => this.safeMapArray(res)),
      catchError((err: any) => {
        console.error('ERROR getAll:', err);
        return of([]);
      })
    );
}
  // ======================================================
  // POR HOTEL
  // ======================================================
  getByHotel(
    slug: string
  ): Observable<Habitacion[]> {

    if (!slug) {

      console.error('SLUG VACÍO');

      return of([]);
    }

    return this.api
      .get<any>(
        API_ENDPOINTS.habitaciones.byHotel(slug)
      )
      .pipe(

        map((res: any) =>
          this.safeMapArray(res)
        ),

        catchError((err: any) => {

          console.error(
            'ERROR getByHotel:',
            err
          );

          return of([]);
        })
      );
  }

  // ======================================================
  // POR ID
  // ======================================================
  getById(
    id: number
  ): Observable<any | null> {

    if (!id) {

      console.error('ID inválido');

      return of(null);
    }

    return this.api
      .get<any>(
        API_ENDPOINTS.habitaciones.get(id)
      )
      .pipe(

        map((res: any) => {

          if (!res || !res.data) {
            return null;
          }

          return {

            ...this.mapHabitacion(res.data),

            hotel_id:
              res.data.hotel_id,

            rating:
              res.data.rating || 0,

            totalReviews:
              res.data.totalReviews || 0
          };
        }),

        catchError((err: any) => {

          console.error(
            'ERROR getById:',
            err
          );

          return of(null);
        })
      );
  }

  // ======================================================
  // REVIEWS
  // ======================================================
  getReviewsByHotel(
    hotelId: number
  ): Observable<any[]> {

    if (!hotelId) {

      console.error('hotelId inválido');

      return of([]);
    }

    return this.api
      .get<any>(
        API_ENDPOINTS.habitaciones.reviews(hotelId)
      )
      .pipe(

        map((res: any) =>
          res?.data || []
        ),

        catchError((err: any) => {

          console.error(
            'ERROR REVIEWS:',
            err
          );

          return of([]);
        })
      );
  }

  // ======================================================
  // CREAR REVIEW
  // ======================================================
  createReview(payload: {
    hotel_id: number;
    puntuacion: number;
    comentario?: string;
  }): Observable<any> {

    if (
      !payload.hotel_id ||
      !payload.puntuacion
    ) {

      console.error(
        'Payload inválido'
      );

      return throwError(() =>
        new Error('Payload inválido')
      );
    }

    return this.api
      .post(
        API_ENDPOINTS.habitaciones.createReview,
        payload
      )
      .pipe(

        catchError((err: any) => {

          console.error(
            'ERROR CREATE REVIEW:',
            err
          );

          return throwError(() => err);
        })
      );
  }

  // ======================================================
  // SAFE MAP
  // ======================================================
  private safeMapArray(
    res: any
  ): Habitacion[] {

    if (
      !res ||
      !res.data ||
      !Array.isArray(res.data)
    ) {

      return [];
    }

    return res.data.map(
      (item: any) =>
        this.mapHabitacion(item)
    );
  }

  // ======================================================
  // MAPPER
  // ======================================================
  private mapHabitacion(
    item: any
  ): Habitacion {

    return {

      id: item.id,

      numero: String(
        item.numero_habitacion ??
        item.numero ??
        ''
      ),

      tipo:
        item.tipo_nombre ||
        item.tipo ||
        item.tipoHabitacion?.nombre ||
        `Habitación ${
          item.numero_habitacion ||
          item.numero
        }`,

      descripcion:
        item.descripcion ||
        `Piso ${item.piso ?? 'N/A'}`,

      capacidad:
        item.capacidad ??
        item.tipoHabitacion?.capacidad_maxima ??
        2,

      camas:
        (
          Number(
            item.tipoHabitacion?.camas_sencillas || 0
          ) +
          Number(
            item.tipoHabitacion?.camas_dobles || 0
          )
        ) || 1,

      precioNoche: Number(
        item.precio_noche ??
        item.precio ??
        item.tipoHabitacion?.precio_base ??
        0
      ),

      estado:
        item.estado ||
        'disponible',

      imagenUrl:
        item.imagen_url ||
        item.imagen ||
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',

      hotelSlug:
        item.hotel_slug || ''
    };
  }
}