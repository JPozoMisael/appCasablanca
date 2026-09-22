import { Injectable, signal } from '@angular/core';

/**
 * Hotel sobre el que opera el super_admin en el panel (se envía como cabecera X-Hotel-Id).
 * Para admin/recepción no se usa: el servidor los ata a su propio hotel.
 */
@Injectable({ providedIn: 'root' })
export class HotelScopeService {
  private readonly KEY = 'hotel_scope';
  readonly hotelId = signal<number | null>(this.leer());

  private leer(): number | null {
    try {
      const v = Number(localStorage.getItem(this.KEY));
      return Number.isInteger(v) && v > 0 ? v : null;
    } catch {
      return null;
    }
  }

  get(): number | null {
    return this.hotelId();
  }

  set(id: number | null): void {
    try {
      if (id) localStorage.setItem(this.KEY, String(id));
      else localStorage.removeItem(this.KEY);
    } catch {
      /* sin almacenamiento */
    }
    this.hotelId.set(id);
  }
}
