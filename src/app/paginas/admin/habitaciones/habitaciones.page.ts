import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonIcon, IonButton, IonChip } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  bedOutline,
  searchOutline,
  addCircleOutline,
  createOutline,
  eyeOutline,
  closeOutline,
  optionsOutline,
  checkmarkCircleOutline,
  warningOutline,
  constructOutline,
  pauseCircleOutline,
} from 'ionicons/icons';

type EstadoHab = 'DISPONIBLE' | 'OCUPADA' | 'LIMPIEZA' | 'MANTENIMIENTO';
type TipoHab = 'SIMPLE' | 'DOBLE' | 'TRIPLE' | 'SUITE';

interface Habitacion {
  id: number;
  codigo: string;     // 101, 204, etc.
  piso: number;
  tipo: TipoHab;
  capacidad: number;
  tarifa: number;     // por noche
  estado: EstadoHab;
  notas?: string;
}

type ModalMode = 'create' | 'edit';

@Component({
  selector: 'app-admin-habitaciones',
  standalone: true,
  imports: [CommonModule, IonIcon, IonButton, IonChip],
  templateUrl: './habitaciones.page.html',
  styleUrls: ['./habitaciones.page.scss'],
})
export class AdminHabitacionesPage {
  // ===== data mock (luego API) =====
  habitaciones = signal<Habitacion[]>([
    { id: 1, codigo: '101', piso: 1, tipo: 'SIMPLE', capacidad: 1, tarifa: 25, estado: 'DISPONIBLE' },
    { id: 2, codigo: '105', piso: 1, tipo: 'SIMPLE', capacidad: 1, tarifa: 25, estado: 'OCUPADA' },
    { id: 3, codigo: '204', piso: 2, tipo: 'DOBLE', capacidad: 2, tarifa: 40, estado: 'DISPONIBLE' },
    { id: 4, codigo: '210', piso: 2, tipo: 'DOBLE', capacidad: 2, tarifa: 40, estado: 'LIMPIEZA' },
    { id: 5, codigo: '301', piso: 3, tipo: 'SUITE', capacidad: 3, tarifa: 60, estado: 'OCUPADA' },
    { id: 6, codigo: '303', piso: 3, tipo: 'SUITE', capacidad: 3, tarifa: 60, estado: 'MANTENIMIENTO', notas: 'A/C revisión' },
  ]);

  // ===== filtros =====
  q = signal('');
  fEstado = signal<EstadoHab | 'TODOS'>('TODOS');
  fTipo = signal<TipoHab | 'TODOS'>('TODOS');

  // ===== modal =====
  modalOpen = signal(false);
  modalMode = signal<ModalMode>('create');

  form = signal<Habitacion>({
    id: 0,
    codigo: '',
    piso: 1,
    tipo: 'SIMPLE',
    capacidad: 1,
    tarifa: 0,
    estado: 'DISPONIBLE',
    notas: '',
  });

  // ===== KPIs =====
  total = computed(() => this.habitaciones().length);
  disponibles = computed(() => this.habitaciones().filter(h => h.estado === 'DISPONIBLE').length);
  ocupadas = computed(() => this.habitaciones().filter(h => h.estado === 'OCUPADA').length);
  mantenimiento = computed(() =>
    this.habitaciones().filter(h => h.estado === 'MANTENIMIENTO' || h.estado === 'LIMPIEZA').length
  );

  // ===== lista filtrada =====
  filtradas = computed(() => {
    const q = this.q().trim().toLowerCase();
    const est = this.fEstado();
    const tipo = this.fTipo();

    return this.habitaciones()
      .filter(h => {
        const okQ =
          !q ||
          h.codigo.toLowerCase().includes(q) ||
          String(h.piso).includes(q) ||
          h.tipo.toLowerCase().includes(q) ||
          h.estado.toLowerCase().includes(q);

        const okE = est === 'TODOS' ? true : h.estado === est;
        const okT = tipo === 'TODOS' ? true : h.tipo === tipo;

        return okQ && okE && okT;
      })
      .sort((a, b) => a.piso - b.piso || a.codigo.localeCompare(b.codigo));
  });

  constructor() {
    addIcons({
      bedOutline,
      searchOutline,
      addCircleOutline,
      createOutline,
      eyeOutline,
      closeOutline,
      optionsOutline,
      checkmarkCircleOutline,
      warningOutline,
      constructOutline,
      pauseCircleOutline,
    });
  }

  // ===== UI =====
  setEstadoFilter(v: string) {
    this.fEstado.set(v as any);
  }
  setTipoFilter(v: string) {
    this.fTipo.set(v as any);
  }

  estadoColor(estado: EstadoHab): string {
    switch (estado) {
      case 'DISPONIBLE': return 'success';
      case 'OCUPADA': return 'primary';
      case 'LIMPIEZA': return 'warning';
      case 'MANTENIMIENTO': return 'danger';
      default: return 'medium';
    }
  }

  openCreate() {
    this.modalMode.set('create');
    this.form.set({
      id: 0,
      codigo: '',
      piso: 1,
      tipo: 'SIMPLE',
      capacidad: 1,
      tarifa: 0,
      estado: 'DISPONIBLE',
      notas: '',
    });
    this.modalOpen.set(true);
  }

  openEdit(h: Habitacion) {
    this.modalMode.set('edit');
    this.form.set({ ...h });
    this.modalOpen.set(true);
  }

  closeModal() {
    this.modalOpen.set(false);
  }

  save() {
    const f = this.form();
    const codigo = f.codigo.trim();

    if (!codigo) return; // validación simple

    if (this.modalMode() === 'create') {
      const nextId = Math.max(0, ...this.habitaciones().map(x => x.id)) + 1;
      const nuevo: Habitacion = { ...f, id: nextId, codigo };
      this.habitaciones.set([nuevo, ...this.habitaciones()]);
    } else {
      this.habitaciones.set(
        this.habitaciones().map(x => (x.id === f.id ? { ...f, codigo } : x))
      );
    }

    this.modalOpen.set(false);
  }

  // Acciones rápidas por fila
  cycleEstado(h: Habitacion) {
    const order: EstadoHab[] = ['DISPONIBLE', 'OCUPADA', 'LIMPIEZA', 'MANTENIMIENTO'];
    const idx = order.indexOf(h.estado);
    const next = order[(idx + 1) % order.length];

    this.habitaciones.set(
      this.habitaciones().map(x => (x.id === h.id ? { ...x, estado: next } : x))
    );
  }

  // Helpers para inputs
  patch<K extends keyof Habitacion>(key: K, value: Habitacion[K]) {
    this.form.set({ ...this.form(), [key]: value });
  }
}
