import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GestionService, Hab, TipoHab } from '@app/core/services/gestion.service';
import { MenuService } from '@app/core/services/menu.service';
import { MoneyPipe } from '@app/shared/pipes/money.pipe';

const TIPO_VACIO = (): Partial<TipoHab> => ({
  nombre: '', capacidad_maxima: 2, camas_sencillas: 0, camas_dobles: 1, precio_base: 0,
  tiene_vista: false, tiene_balcon: false, desayuno_incluido: false, descripcion: '',
});

@Component({
  selector: 'app-admin-habitaciones',
  standalone: true,
  imports: [FormsModule, MoneyPipe],
  templateUrl: './habitaciones.page.html',
})
export class AdminHabitacionesPage implements OnInit {
  private gestion = inject(GestionService);
  private menu = inject(MenuService);

  tipos: TipoHab[] = [];
  habs: Hab[] = [];
  cargando = true;
  error = '';
  mensaje = '';

  edicion: Partial<TipoHab> | null = null;
  nuevaHab = { tipo_habitacion_id: 0, numero_habitacion: '', piso: null as number | null };

  readonly estadosHab = ['disponible', 'ocupada', 'limpieza', 'mantenimiento', 'inactiva'];

  get puedeEditarCatalogo(): boolean {
    return this.menu.tiene('habitaciones.gestionar');
  }

  get puedeCambiarEstado(): boolean {
    return this.menu.tiene('habitaciones.estado');
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.gestion.tipos().subscribe({
      next: (t) => {
        this.tipos = t;
        if (!this.nuevaHab.tipo_habitacion_id && t.length) this.nuevaHab.tipo_habitacion_id = t[0].id;
      },
      error: (e) => this.fallo(e),
    });
    this.gestion.habitaciones().subscribe({
      next: (h) => {
        this.habs = h;
        this.cargando = false;
      },
      error: (e) => this.fallo(e),
    });
  }

  private fallo(e: { error?: { message?: string } }): void {
    this.error = e?.error?.message ?? 'Ocurrió un error.';
    this.cargando = false;
  }

  delTipo(id: number): Hab[] {
    return this.habs.filter((h) => h.tipo_habitacion_id === id);
  }

  // ---------- tipos ----------
  nuevoTipo(): void {
    this.edicion = TIPO_VACIO();
  }

  editar(t: TipoHab): void {
    this.edicion = { ...t };
  }

  guardarTipo(): void {
    const t = this.edicion;
    if (!t?.nombre?.trim()) {
      this.error = 'Ponle un nombre al tipo de habitación.';
      return;
    }
    const payload = {
      nombre: t.nombre.trim(),
      descripcion: t.descripcion || null,
      capacidad_maxima: Number(t.capacidad_maxima),
      camas_sencillas: Number(t.camas_sencillas),
      camas_dobles: Number(t.camas_dobles),
      precio_base: Number(t.precio_base),
      tiene_vista: !!t.tiene_vista,
      tiene_balcon: !!t.tiene_balcon,
      desayuno_incluido: !!t.desayuno_incluido,
      ...(t.id ? { estado: t.estado } : {}),
    };
    const op = t.id ? this.gestion.editarTipo(t.id, payload) : this.gestion.crearTipo(payload);
    op.subscribe({
      next: () => {
        this.mensaje = 'Tipo de habitación guardado.';
        this.edicion = null;
        this.cargar();
      },
      error: (e) => (this.error = e?.error?.details?.[0]?.mensaje ?? e?.error?.message ?? 'No se pudo guardar.'),
    });
  }

  borrarTipo(t: TipoHab): void {
    if (!confirm(`¿Eliminar "${t.nombre}"? Si tiene habitaciones, solo se desactivará.`)) return;
    this.gestion.borrarTipo(t.id).subscribe({
      next: () => {
        this.mensaje = 'Listo.';
        this.cargar();
      },
      error: (e) => (this.error = e?.error?.message ?? 'No se pudo eliminar.'),
    });
  }

  // ---------- unidades ----------
  agregarHab(): void {
    const n = this.nuevaHab;
    if (!n.tipo_habitacion_id || !n.numero_habitacion.trim()) {
      this.error = 'Indica el tipo y el número de la habitación.';
      return;
    }
    this.gestion
      .crearHabitacion({ tipo_habitacion_id: Number(n.tipo_habitacion_id), numero_habitacion: n.numero_habitacion.trim(), piso: n.piso })
      .subscribe({
        next: () => {
          this.nuevaHab.numero_habitacion = '';
          this.mensaje = 'Habitación agregada.';
          this.cargar();
        },
        error: (e) => (this.error = e?.error?.message ?? 'No se pudo agregar (¿el número ya existe?).'),
      });
  }

  cambiarEstado(h: Hab, estado: string): void {
    this.gestion.editarHabitacion(h.id, { estado: estado as Hab['estado'] }).subscribe({
      next: (n) => (h.estado = n.estado),
      error: (e) => (this.error = e?.error?.message ?? 'No se pudo cambiar el estado.'),
    });
  }

  quitarHab(h: Hab): void {
    if (!confirm(`¿Eliminar la habitación ${h.numero_habitacion}? Si tiene reservas, solo se desactivará.`)) return;
    this.gestion.borrarHabitacion(h.id).subscribe({
      next: () => this.cargar(),
      error: (e) => (this.error = e?.error?.message ?? 'No se pudo eliminar.'),
    });
  }
}
