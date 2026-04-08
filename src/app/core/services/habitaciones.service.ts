import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '../config/endpoints';
import { ApiService } from './api.service';
import { Habitacion } from '@app/shared/models/habitacion.model';

@Injectable({ providedIn: 'root' })
export class HabitacionesService {
  constructor(private api: ApiService) {}

  getAll(): Observable<Habitacion[]> {
    return this.api.get<any>(API_ENDPOINTS.habitaciones.list).pipe(
      map((res) => {
        console.log('==============================');
        console.log('API RESPONSE (getAll):', res);

        if (!res || !res.data) {
          console.warn('No hay data en la respuesta');
          return [];
        }

        const mapped = res.data.map((item: any, index: number) => {
          console.log(`--- ITEM ORIGINAL [${index}] ---`);
          console.log(item);

          const transformed = this.mapHabitacion(item);

          console.log(`--- ITEM MAPEADO [${index}] ---`);
          console.log(transformed);

          return transformed;
        });

        console.log('ARRAY FINAL MAPEADO:', mapped);
        console.log('==============================');

        return mapped;
      })
    );
  }

  getDisponibles(params: any): Observable<Habitacion[]> {
    return this.api.get<any>(API_ENDPOINTS.habitaciones.disponibles, params).pipe(
      map((res) => {
        console.log('API RESPONSE (getDisponibles):', res);

        if (!res || !res.data) return [];

        return res.data.map((item: any) => this.mapHabitacion(item));
      })
    );
  }

  getById(id: number): Observable<Habitacion> {
    return this.api.get<any>(API_ENDPOINTS.habitaciones.get(id)).pipe(
      map((res) => {
        console.log('API RESPONSE (getById):', res);
        return this.mapHabitacion(res.data);
      })
    );
  }

  create(payload: Partial<Habitacion>): Observable<Habitacion> {
    console.log('CREANDO HABITACION:', payload);

    return this.api.post<any>(API_ENDPOINTS.habitaciones.create, payload).pipe(
      map((res) => {
        console.log('RESPUESTA CREATE:', res);
        return this.mapHabitacion(res.data);
      })
    );
  }

  update(id: number, payload: Partial<Habitacion>): Observable<Habitacion> {
    console.log('ACTUALIZANDO HABITACION:', id, payload);

    return this.api.put<any>(API_ENDPOINTS.habitaciones.update(id), payload).pipe(
      map((res) => {
        console.log('RESPUESTA UPDATE:', res);
        return this.mapHabitacion(res.data);
      })
    );
  }

  delete(id: number): Observable<any> {
    console.log('ELIMINANDO HABITACION:', id);
    return this.api.delete(API_ENDPOINTS.habitaciones.delete(id));
  }

  /*
  |--------------------------------------------------------------------------
  | MAPPER (DEBUG INCLUIDO)
  |--------------------------------------------------------------------------
  */
  private mapHabitacion(item: any): Habitacion {
    if (!item) {
      console.warn('ITEM VACIO EN MAPPER');
      return {} as Habitacion;
    }

    const mapped: Habitacion = {
      id: item.id,
      numero: item.numero_habitacion,
      tipo: `Habitación ${item.numero_habitacion}`,
      descripcion: `Habitación ubicada en el piso ${item.piso}`,
      capacidad: 2,
      camas: 1,
      precioNoche: this.generarPrecio(item),
      estado: this.mapEstado(item.estado),
      imagenUrl: this.getImagenRandom(),
    };

    console.log('MAPPER RESULT:', mapped);

    return mapped;
  }

  private generarPrecio(item: any): number {
    const precio = 70 + (item.piso || 1) * 10;
    console.log('PRECIO GENERADO:', precio);
    return precio;
  }

  private mapEstado(estado: string): any {
    const estadoLower = (estado || '').toLowerCase();

    let resultado = 'DISPONIBLE';

    switch (estadoLower) {
      case 'disponible':
        resultado = 'DISPONIBLE';
        break;
      case 'ocupado':
        resultado = 'OCUPADA';
        break;
      case 'mantenimiento':
        resultado = 'MANTENIMIENTO';
        break;
    }

    console.log('ESTADO MAPEADO:', estado, '→', resultado);

    return resultado;
  }

  private getImagenRandom(): string {
    const images = [
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a',
      'https://images.unsplash.com/photo-1551776235-dde6d4829808',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427',
    ];

    const img = images[Math.floor(Math.random() * images.length)];

    console.log('IMAGEN ASIGNADA:', img);

    return img;
  }
}