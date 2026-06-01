import { Component, computed, signal, OnInit } from '@angular/core';
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
import { HabitacionesService } from '@app/core/services/habitaciones.service';
import { Habitacion as HabitacionModel } from '@app/shared/models/habitacion.model';

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
export class AdminHabitacionesPage implements OnInit {
  habitaciones = signal<Habitacion[]>([]);
  loading = signal(true);

  q = signal('');
  fEstado = signal<EstadoHab | 'TODOS'>('TODOS');
  fTipo = signal<TipoHab | 'TODOS'>('TODOS');
  quickFilter = signal<'TODAS' | 'DISPONIBLE' | 'OCUPADA'>('TODAS');
  modalOpen = signal(false);
  modalMode = signal<ModalMode>('create');
  form = signal<Habitacion>({
    id: 0, codigo: '', piso: 1, tipo: 'SIMPLE', capacidad: 1, tarifa: 0, estado: 'DISPONIBLE', notas: ''
  });

  constructor(private habitacionesService: HabitacionesService) {
    addIcons({
      bedOutline, searchOutline, addCircleOutline, createOutline, eyeOutline,
      closeOutline, syncOutline, checkmarkCircleOutline, constructOutline,
      pauseCircleOutline, downloadOutline, trashOutline, peopleOutline
    });
  }

  ngOnInit() {
    this.cargarHabitaciones();
  }

  cargarHabitaciones() {
  this.loading.set(true);
  this.habitacionesService.getAll().subscribe({
    next: (habitaciones) => {
      const transformed = habitaciones.map(h => this.transformHabitacion(h));
      this.habitaciones.set(transformed);
      this.loading.set(false);
    },
    error: (err) => {
      console.error('Error cargar habitaciones:', err);
      this.loading.set(false);
    }
  });
}

  private transformHabitacion(h: HabitacionModel): Habitacion {
  return {
    id: h.id,
    codigo: h.numero,
    piso: 1, // TODO: Obtener del modelo cuando esté disponible
    tipo: this.mapTipo(h.tipo),
    capacidad: h.capacidad,
    tarifa: h.precioNoche,
    estado: this.mapEstado(h.estado),
    notas: h.descripcion || undefined,  // ← convertir null a undefined
    imagenUrl: h.imagenUrl || undefined // ← convertir null a undefined
  };
}

  private mapTipo(tipo: string): TipoHab {
    const tipoUpper = tipo.toUpperCase();
    if (tipoUpper.includes('DOBLE')) return 'DOBLE';
    if (tipoUpper.includes('TRIPLE')) return 'TRIPLE';
    if (tipoUpper.includes('SUITE')) return 'SUITE';
    return 'SIMPLE';
  }

  private mapEstado(estado: string): EstadoHab {
    const estadoUpper = estado.toUpperCase();
    if (estadoUpper === 'OCUPADA') return 'OCUPADA';
    if (estadoUpper === 'LIMPIEZA') return 'LIMPIEZA';
    if (estadoUpper === 'MANTENIMIENTO') return 'MANTENIMIENTO';
    return 'DISPONIBLE';
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