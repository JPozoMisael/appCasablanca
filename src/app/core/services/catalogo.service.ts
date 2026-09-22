import { Injectable } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { ApiService } from './api.service';
import {
  Amenidad,
  BusquedaParams,
  BusquedaResponse,
  Disponibilidad,
  HotelFicha,
  HotelResumen,
  Valoracion,
  Zona,
} from '@app/shared/models/marketplace.model';

/** Catálogo público: zonas, buscador, ficha de hotel, disponibilidad y reseñas. */
@Injectable({ providedIn: 'root' })
export class CatalogoService {
  // Los catálogos casi no cambian: se piden una vez por sesión.
  private zonas$?: Observable<Zona[]>;
  private amenidades$?: Observable<Amenidad[]>;

  constructor(private api: ApiService) {}

  zonas(): Observable<Zona[]> {
    this.zonas$ ??= this.api.get<{ data: Zona[] }>('/zonas').pipe(
      map((r) => r.data),
      shareReplay(1)
    );
    return this.zonas$;
  }

  amenidades(): Observable<Amenidad[]> {
    this.amenidades$ ??= this.api.get<{ data: Amenidad[] }>('/amenidades').pipe(
      map((r) => r.data),
      shareReplay(1)
    );
    return this.amenidades$;
  }

  buscar(params: BusquedaParams): Observable<BusquedaResponse> {
    return this.api.get<BusquedaResponse>('/search/hoteles', { ...params });
  }

  destacados(limit = 8): Observable<HotelResumen[]> {
    return this.api.get<{ data: HotelResumen[] }>('/hotels/featured', { limit }).pipe(map((r) => r.data));
  }

  hotel(slug: string): Observable<HotelFicha> {
    return this.api.get<{ data: HotelFicha }>(`/hotels/${slug}`).pipe(map((r) => r.data));
  }

  disponibilidad(
    slug: string,
    p: { checkIn: string; checkOut: string; adultos: number; ninos: number }
  ): Observable<Disponibilidad> {
    return this.api.get<{ data: Disponibilidad }>(`/hotels/${slug}/availability`, { ...p }).pipe(map((r) => r.data));
  }

  valoraciones(slug: string, page = 1, limit = 6) {
    return this.api.get<{
      data: Valoracion[];
      meta: { total: number; page: number; pages: number };
    }>(`/hotels/${slug}/reviews`, { page, limit });
  }
}
