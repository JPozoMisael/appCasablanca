import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@app/core/services/api.service';
import { MenuService } from '@app/core/services/menu.service';

interface Rol {
  id: number; clave: string; nombre: string; descripcion?: string | null;
  alcance: 'plataforma' | 'hotel' | 'cliente'; es_sistema: boolean; asignable_por_hotel: boolean;
  permisos: string[]; usuarios: number;
}
interface Permiso { id: number; clave: string; modulo: string; descripcion: string }
interface ItemMenu { id: number; clave: string; texto: string; ruta: string; seccion: string; orden: number; activo: boolean; permiso: string | null }

/** Solo plataforma: quién puede hacer qué, y qué opciones de menú ve cada rol. Todo se guarda en la base de datos. */
@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './roles.page.html',
})
export class RolesPage implements OnInit {
  private api = inject(ApiService);
  private menuSvc = inject(MenuService);

  roles: Rol[] = [];
  permisos: Permiso[] = [];
  items: ItemMenu[] = [];
  /** Cambios sin guardar: rol.id → permisos elegidos */
  pendiente = new Map<number, Set<string>>();

  nuevo: { clave: string; nombre: string; descripcion: string; asignable_por_hotel: boolean } | null = null;
  cargando = true;
  error = '';
  mensaje = '';

  get modulos(): { nombre: string; permisos: Permiso[] }[] {
    const m = new Map<string, Permiso[]>();
    for (const p of this.permisos) m.set(p.modulo, [...(m.get(p.modulo) ?? []), p]);
    return [...m.entries()].map(([nombre, permisos]) => ({ nombre, permisos }));
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.pendiente.clear();
    this.api.get<{ data: Permiso[] }>('/platform/permisos').subscribe({ next: (r) => (this.permisos = r.data), error: (e) => this.fallo(e) });
    this.api.get<{ data: ItemMenu[] }>('/platform/menu').subscribe({ next: (r) => (this.items = r.data), error: (e) => this.fallo(e) });
    this.api.get<{ data: Rol[] }>('/platform/roles').subscribe({
      next: (r) => {
        this.roles = r.data;
        this.cargando = false;
      },
      error: (e) => this.fallo(e),
    });
  }

  private fallo(e: { error?: { message?: string } }): void {
    this.error = e?.error?.message ?? 'Ocurrió un error.';
    this.cargando = false;
  }

  // ---------- matriz de permisos ----------
  tiene(r: Rol, clave: string): boolean {
    if (r.clave === 'super_admin') return true;
    return (this.pendiente.get(r.id) ?? new Set(r.permisos)).has(clave);
  }

  editable(r: Rol, p: Permiso): boolean {
    if (r.clave === 'super_admin' || r.alcance === 'cliente') return false;
    return !(p.clave.startsWith('plataforma.') && r.alcance !== 'plataforma');
  }

  alternar(r: Rol, clave: string): void {
    const actual = new Set(this.pendiente.get(r.id) ?? r.permisos);
    if (actual.has(clave)) actual.delete(clave);
    else actual.add(clave);
    this.pendiente.set(r.id, actual);
  }

  sucio(r: Rol): boolean {
    const p = this.pendiente.get(r.id);
    return !!p && (p.size !== r.permisos.length || r.permisos.some((c) => !p.has(c)));
  }

  guardar(r: Rol): void {
    const elegidos = [...(this.pendiente.get(r.id) ?? r.permisos)];
    this.api.put(`/platform/roles/${r.id}/permisos`, { permisos: elegidos }).subscribe({
      next: () => {
        this.mensaje = `Permisos de «${r.nombre}» guardados. Se aplican de inmediato.`;
        this.cargar();
        void this.menuSvc.recargar();
      },
      error: (e) => (this.error = e?.error?.message ?? 'No se pudo guardar.'),
    });
  }

  alternarAsignable(r: Rol): void {
    this.api.put(`/platform/roles/${r.id}`, { asignable_por_hotel: !r.asignable_por_hotel }).subscribe({
      next: () => this.cargar(),
      error: (e) => (this.error = e?.error?.message ?? 'No se pudo actualizar.'),
    });
  }

  borrar(r: Rol): void {
    if (!confirm(`¿Eliminar el rol «${r.nombre}»?`)) return;
    this.api.delete(`/platform/roles/${r.id}`).subscribe({
      next: () => this.cargar(),
      error: (e) => (this.error = e?.error?.message ?? 'No se pudo eliminar.'),
    });
  }

  abrirNuevo(): void {
    this.nuevo = { clave: '', nombre: '', descripcion: '', asignable_por_hotel: true };
  }

  crear(): void {
    const n = this.nuevo;
    if (!n) return;
    this.error = '';
    this.api.post('/platform/roles', { ...n, clave: n.clave.trim().toLowerCase().replace(/\s+/g, '_'), permisos: [] }).subscribe({
      next: () => {
        this.mensaje = `Rol «${n.nombre}» creado. Marca sus permisos en la tabla y guarda.`;
        this.nuevo = null;
        this.cargar();
      },
      error: (e) =>
        (this.error = e?.error?.details?.map((d: { mensaje: string }) => d.mensaje).join(' · ') ?? e?.error?.message ?? 'No se pudo crear.'),
    });
  }

  // ---------- menú ----------
  guardarItem(i: ItemMenu, cambios: Partial<ItemMenu>): void {
    this.api.put(`/platform/menu/${i.id}`, cambios).subscribe({
      next: () => {
        this.mensaje = 'Menú actualizado.';
        this.cargar();
        void this.menuSvc.recargar();
      },
      error: (e) => {
        this.error = e?.error?.message ?? 'No se pudo actualizar.';
        this.cargar();
      },
    });
  }

  cambiarOrden(i: ItemMenu, v: string): void {
    const n = Number(v);
    if (Number.isInteger(n) && n >= 0) this.guardarItem(i, { orden: n });
  }
}
