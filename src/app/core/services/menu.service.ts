import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';

export interface OpcionMenu {
  clave: string;
  texto: string;
  icono: string | null;
  ruta: string;
  seccion: string;
  permiso: string | null;
}

interface RespuestaMenu {
  data: { rol: string; alcance: 'plataforma' | 'hotel' | 'cliente'; permisos: string[]; menu: OpcionMenu[] };
}

/**
 * Menú lateral y permisos del usuario, tal como los define la base de datos.
 * Ocultar una opción es solo comodidad: el servidor vuelve a exigir el permiso en cada petición.
 */
@Injectable({ providedIn: 'root' })
export class MenuService {
  private api = inject(ApiService);
  private storage = inject(StorageService);

  readonly menu = signal<OpcionMenu[]>([]);
  readonly permisos = signal<string[]>([]);
  readonly alcance = signal<string>('cliente');
  private carga: Promise<void> | null = null;

  /** Opciones agrupadas por sección, en el orden que define la base de datos. */
  readonly secciones = computed(() => {
    const grupos = new Map<string, OpcionMenu[]>();
    for (const o of this.menu()) {
      if (!grupos.has(o.seccion)) grupos.set(o.seccion, []);
      grupos.get(o.seccion)!.push(o);
    }
    return [...grupos.entries()].map(([nombre, opciones]) => ({ nombre, opciones }));
  });

  /** Carga (una sola vez por sesión) y devuelve cuando el menú está listo. */
  asegurarCargado(): Promise<void> {
    if (!this.storage.getToken()) return Promise.resolve();
    this.carga ??= this.recargar();
    return this.carga;
  }

  recargar(): Promise<void> {
    this.carga = firstValueFrom(this.api.get<RespuestaMenu>('/auth/menu'))
      .then((r) => {
        this.menu.set(r.data.menu);
        this.permisos.set(r.data.permisos);
        this.alcance.set(r.data.alcance);
      })
      .catch(() => {
        this.limpiar();
      });
    return this.carga;
  }

  limpiar(): void {
    this.menu.set([]);
    this.permisos.set([]);
    this.alcance.set('cliente');
    this.carga = null;
  }

  tiene(permiso: string): boolean {
    return this.alcance() === 'plataforma' || this.permisos().includes(permiso);
  }

  /** ¿La URL pertenece a alguna opción del menú del usuario? */
  permiteRuta(url: string): boolean {
    const ruta = url.split('?')[0].split('#')[0];
    return this.menu().some((o) => ruta === o.ruta || ruta.startsWith(o.ruta + '/'));
  }

  primeraRuta(): string | null {
    return this.menu()[0]?.ruta ?? null;
  }
}
