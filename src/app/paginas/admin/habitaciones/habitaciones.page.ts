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
  syncOutline,
  checkmarkCircleOutline,
  constructOutline,
  pauseCircleOutline,
  downloadOutline,
  trashOutline,
  peopleOutline
} from 'ionicons/icons';

type EstadoHab = 'DISPONIBLE' | 'OCUPADA' | 'LIMPIEZA' | 'MANTENIMIENTO';
type TipoHab = 'SIMPLE' | 'DOBLE' | 'TRIPLE' | 'SUITE';

interface Habitacion {
  id: number;
  codigo: string;
  piso: number;
  tipo: TipoHab;
  capacidad: number;
  tarifa: number;
  estado: EstadoHab;
  notas?: string;
  imagenUrl?: string;
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
  habitaciones = signal<Habitacion[]>([
    { id: 1, codigo: '101', piso: 1, tipo: 'SIMPLE', capacidad: 1, tarifa: 25, estado: 'DISPONIBLE', notas: 'WiFi, TV, Aire acondicionado' },
    { id: 2, codigo: '105', piso: 1, tipo: 'SIMPLE', capacidad: 1, tarifa: 25, estado: 'OCUPADA' },
    { id: 3, codigo: '204', piso: 2, tipo: 'DOBLE', capacidad: 2, tarifa: 40, estado: 'DISPONIBLE', notas: 'Vista al mar, Balcón' },
    { id: 4, codigo: '210', piso: 2, tipo: 'DOBLE', capacidad: 2, tarifa: 40, estado: 'LIMPIEZA' },
    { id: 5, codigo: '301', piso: 3, tipo: 'SUITE', capacidad: 3, tarifa: 60, estado: 'OCUPADA', notas: 'Jacuzzi, Minibar, Vista panorámica' },
    { id: 6, codigo: '303', piso: 3, tipo: 'SUITE', capacidad: 3, tarifa: 60, estado: 'MANTENIMIENTO', notas: 'A/C en revisión' },
  ]);

  q = signal('');
  fEstado = signal<EstadoHab | 'TODOS'>('TODOS');
  fTipo = signal<TipoHab | 'TODOS'>('TODOS');
  quickFilter = signal<'TODAS' | 'DISPONIBLE' | 'OCUPADA'>('TODAS');
  modalOpen = signal(false);
  modalMode = signal<ModalMode>('create');
  form = signal<Habitacion>({
    id: 0, codigo: '', piso: 1, tipo: 'SIMPLE', capacidad: 1, tarifa: 0, estado: 'DISPONIBLE', notas: ''
  });

  constructor() {
    addIcons({
      bedOutline, searchOutline, addCircleOutline, createOutline, eyeOutline,
      closeOutline, syncOutline, checkmarkCircleOutline, constructOutline,
      pauseCircleOutline, downloadOutline, trashOutline, peopleOutline
    });
  }

  total = () => this.habitaciones().length;
  disponibles = () => this.habitaciones().filter(h => h.estado === 'DISPONIBLE').length;
  ocupadas = () => this.habitaciones().filter(h => h.estado === 'OCUPADA').length;
  mantenimiento = () => this.habitaciones().filter(h => h.estado === 'MANTENIMIENTO' || h.estado === 'LIMPIEZA').length;

  filtradas = computed(() => {
    let items = this.habitaciones();
    const query = this.q().trim().toLowerCase();
    const estado = this.fEstado();
    const tipo = this.fTipo();
    const quick = this.quickFilter();

    if (quick === 'DISPONIBLE') items = items.filter(h => h.estado === 'DISPONIBLE');
    if (quick === 'OCUPADA') items = items.filter(h => h.estado === 'OCUPADA');

    if (query) items = items.filter(h => h.codigo.toLowerCase().includes(query) || String(h.piso).includes(query) || h.tipo.toLowerCase().includes(query));
    if (estado !== 'TODOS') items = items.filter(h => h.estado === estado);
    if (tipo !== 'TODOS') items = items.filter(h => h.tipo === tipo);

    return items.sort((a, b) => a.piso - b.piso || a.codigo.localeCompare(b.codigo));
  });

  setEstadoFilter(v: string) { this.fEstado.set(v as any); this.quickFilter.set('TODAS'); }
  setTipoFilter(v: string) { this.fTipo.set(v as any); this.quickFilter.set('TODAS'); }
  setQuickFilter(v: 'TODAS' | 'DISPONIBLE' | 'OCUPADA') { this.quickFilter.set(v); this.fEstado.set('TODOS'); this.fTipo.set('TODOS'); }

  getEstadoClass(estado: EstadoHab): string {
    return {
      DISPONIBLE: 'disponible',
      OCUPADA: 'ocupada',
      LIMPIEZA: 'limpieza',
      MANTENIMIENTO: 'mantenimiento'
    }[estado] || '';
  }

  formatEstado(estado: EstadoHab): string {
    return { DISPONIBLE: 'Disponible', OCUPADA: 'Ocupada', LIMPIEZA: 'Limpieza', MANTENIMIENTO: 'Mantenimiento' }[estado] || estado;
  }

  formatTipo(tipo: TipoHab): string {
    return { SIMPLE: 'Simple', DOBLE: 'Doble', TRIPLE: 'Triple', SUITE: 'Suite' }[tipo] || tipo;
  }

  getAmenitiesPreview(h: Habitacion): string {
    if (h.notas) return h.notas.length > 40 ? h.notas.substring(0, 40) + '...' : h.notas;
    return 'Sin servicios adicionales';
  }

  openCreate() { this.modalMode.set('create'); this.form.set({ id: 0, codigo: '', piso: 1, tipo: 'SIMPLE', capacidad: 1, tarifa: 0, estado: 'DISPONIBLE', notas: '' }); this.modalOpen.set(true); }
  openEdit(h: Habitacion) { this.modalMode.set('edit'); this.form.set({ ...h }); this.modalOpen.set(true); }
  openDetail(h: Habitacion) { alert(`Detalles de habitación ${h.codigo}\nTipo: ${this.formatTipo(h.tipo)}\nCapacidad: ${h.capacidad}\nTarifa: $${h.tarifa}\nEstado: ${this.formatEstado(h.estado)}\nNotas: ${h.notas || 'Ninguna'}`); }
  closeModal() { this.modalOpen.set(false); }

  patch<K extends keyof Habitacion>(key: K, value: Habitacion[K]) { this.form.set({ ...this.form(), [key]: value }); }

  save() {
    const f = this.form();
    if (!f.codigo.trim()) { alert('El código es obligatorio'); return; }
    if (this.modalMode() === 'create') {
      const nextId = Math.max(0, ...this.habitaciones().map(x => x.id), 0) + 1;
      this.habitaciones.set([{ ...f, id: nextId, codigo: f.codigo.trim() }, ...this.habitaciones()]);
    } else {
      this.habitaciones.set(this.habitaciones().map(x => x.id === f.id ? { ...f, codigo: f.codigo.trim() } : x));
    }
    this.closeModal();
  }

  cycleEstado(h: Habitacion) {
    const order: EstadoHab[] = ['DISPONIBLE', 'OCUPADA', 'LIMPIEZA', 'MANTENIMIENTO'];
    const idx = order.indexOf(h.estado);
    const next = order[(idx + 1) % order.length];
    this.habitaciones.set(this.habitaciones().map(x => x.id === h.id ? { ...x, estado: next } : x));
  }

  confirmDelete(h: Habitacion) {
    if (confirm(`¿Eliminar habitación ${h.codigo}?`)) {
      this.habitaciones.set(this.habitaciones().filter(x => x.id !== h.id));
    }
  }

  exportData() {
    const data = this.filtradas();
    const csv = [['Código', 'Piso', 'Tipo', 'Capacidad', 'Tarifa', 'Estado', 'Notas'].join(',')];
    data.forEach(h => csv.push([h.codigo, h.piso, this.formatTipo(h.tipo), h.capacidad, h.tarifa, this.formatEstado(h.estado), h.notas || ''].join(',')));
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'habitaciones.csv'; a.click(); URL.revokeObjectURL(url);
  }
}