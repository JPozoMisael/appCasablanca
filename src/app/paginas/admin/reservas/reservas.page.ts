import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon, IonButton, IonChip } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  searchOutline,
  addCircleOutline,
  createOutline,
  eyeOutline,
  closeOutline,
  syncOutline,
  calendarOutline,
  timeOutline,
  personOutline,
  bedOutline,
  logInOutline,
  logOutOutline,
  downloadOutline,
  closeCircleOutline
} from 'ionicons/icons';

type EstadoReserva = 'PENDIENTE' | 'CONFIRMADA' | 'CHECKIN' | 'CHECKOUT' | 'CANCELADA';

interface Reserva {
  id: number;
  codigo?: string;
  huesped: string;
  documento?: string;
  habitacion: string;
  fechaEntrada: string;
  fechaSalida: string;
  estado: EstadoReserva;
  total: number;
  anticipo?: number;
  notas?: string;
}

type ModalMode = 'create' | 'edit';

@Component({
  selector: 'app-admin-reservas',
  standalone: true,
  imports: [CommonModule, IonIcon, IonButton, IonChip],
  templateUrl: './reservas.page.html',
  styleUrls: ['./reservas.page.scss'],
})
export class AdminReservasPage {
  reservas = signal<Reserva[]>([
    { id: 3001, codigo: 'RES-3001', huesped: 'Carlos Ruiz', documento: '0901234567', habitacion: 'Doble · 204', fechaEntrada: '2026-01-14', fechaSalida: '2026-01-16', estado: 'CONFIRMADA', total: 120, anticipo: 50 },
    { id: 3002, codigo: 'RES-3002', huesped: 'María Paredes', documento: '0912345678', habitacion: 'Suite · 301', fechaEntrada: '2026-01-14', fechaSalida: '2026-01-15', estado: 'CHECKIN', total: 95, anticipo: 95 },
    { id: 3003, codigo: 'RES-3003', huesped: 'Kevin Andrade', documento: '0923456789', habitacion: 'Simple · 105', fechaEntrada: '2026-01-18', fechaSalida: '2026-01-21', estado: 'PENDIENTE', total: 150, anticipo: 0 },
    { id: 3004, codigo: 'RES-3004', huesped: 'Ana Cedeño', documento: '0934567890', habitacion: 'Doble · 210', fechaEntrada: '2026-01-20', fechaSalida: '2026-01-22', estado: 'CONFIRMADA', total: 180, anticipo: 80, notas: 'Cama adicional' },
    { id: 3005, codigo: 'RES-3005', huesped: 'Jorge Vera', documento: '0945678901', habitacion: 'Suite · 303', fechaEntrada: '2026-01-22', fechaSalida: '2026-01-23', estado: 'CANCELADA', total: 0, anticipo: 0 }
  ]);

  habitaciones = signal<string[]>(['Simple · 101', 'Simple · 105', 'Doble · 204', 'Doble · 210', 'Suite · 301', 'Suite · 303']);

  q = signal('');
  fEstado = signal<EstadoReserva | 'TODOS'>('TODOS');
  fDesde = signal('');
  fHasta = signal('');
  modalOpen = signal(false);
  modalMode = signal<ModalMode>('create');

  form = signal<Reserva>({
    id: 0, codigo: '', huesped: '', documento: '', habitacion: this.habitaciones()[0],
    fechaEntrada: '', fechaSalida: '', estado: 'PENDIENTE', total: 0, anticipo: 0, notas: ''
  });

  constructor() {
    addIcons({ searchOutline, addCircleOutline, createOutline, eyeOutline, closeOutline, syncOutline, calendarOutline, timeOutline, personOutline, bedOutline, logInOutline, logOutOutline, downloadOutline, closeCircleOutline });
  }

  get todayIso() { return new Date().toISOString().split('T')[0]; }

  reservasHoy = computed(() => this.reservas().filter(r => r.fechaEntrada === this.todayIso || r.fechaSalida === this.todayIso).filter(r => r.estado !== 'CANCELADA').length);
  checkinHoy = computed(() => this.reservas().filter(r => r.fechaEntrada === this.todayIso && r.estado !== 'CANCELADA').length);
  checkoutHoy = computed(() => this.reservas().filter(r => r.fechaSalida === this.todayIso && r.estado !== 'CANCELADA').length);
  proximas = computed(() => this.reservas().filter(r => r.fechaEntrada > this.todayIso && r.estado !== 'CANCELADA').length);

  filtradas = computed(() => {
    let items = this.reservas();
    const query = this.q().trim().toLowerCase();
    if (query) items = items.filter(r => (r.codigo || '').toLowerCase().includes(query) || r.huesped.toLowerCase().includes(query) || (r.documento || '').toLowerCase().includes(query) || r.habitacion.toLowerCase().includes(query));
    if (this.fEstado() !== 'TODOS') items = items.filter(r => r.estado === this.fEstado());
    if (this.fDesde()) items = items.filter(r => r.fechaEntrada >= this.fDesde());
    if (this.fHasta()) items = items.filter(r => r.fechaEntrada <= this.fHasta());
    return items.sort((a, b) => a.fechaEntrada.localeCompare(b.fechaEntrada) || b.id - a.id);
  });

  setEstadoFilter(v: string) { this.fEstado.set(v as any); }
  getInitials(nombre: string) { return nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase(); }
  formatDate(iso: string) { const parts = iso.split('-'); return `${parts[2]}/${parts[1]}`; }

  getEstadoClass(estado: EstadoReserva): string {
    return { PENDIENTE: 'pendiente', CONFIRMADA: 'confirmada', CHECKIN: 'checkin', CHECKOUT: 'checkout', CANCELADA: 'cancelada' }[estado] || '';
  }

  formatEstado(estado: EstadoReserva): string {
    return { PENDIENTE: 'Pendiente', CONFIRMADA: 'Confirmada', CHECKIN: 'Check-in', CHECKOUT: 'Check-out', CANCELADA: 'Cancelada' }[estado] || estado;
  }

  openCreate() { this.modalMode.set('create'); this.form.set({ id: 0, codigo: '', huesped: '', documento: '', habitacion: this.habitaciones()[0], fechaEntrada: this.todayIso, fechaSalida: this.todayIso, estado: 'PENDIENTE', total: 0, anticipo: 0, notas: '' }); this.modalOpen.set(true); }
  openEdit(r: Reserva) { this.modalMode.set('edit'); this.form.set({ ...r }); this.modalOpen.set(true); }
  openDetail(r: Reserva) { alert(`Reserva ${r.codigo || r.id}\nHuésped: ${r.huesped}\nDocumento: ${r.documento || '—'}\nHabitación: ${r.habitacion}\nEntrada: ${r.fechaEntrada}\nSalida: ${r.fechaSalida}\nEstado: ${this.formatEstado(r.estado)}\nTotal: $${r.total}\nAnticipo: $${r.anticipo || 0}\nNotas: ${r.notas || 'Ninguna'}`); }
  closeModal() { this.modalOpen.set(false); }
  patch<K extends keyof Reserva>(key: K, value: Reserva[K]) { this.form.set({ ...this.form(), [key]: value }); }

  save() {
    const f = this.form();
    if (!f.huesped.trim() || !f.habitacion || !f.fechaEntrada || !f.fechaSalida) { alert('Complete los campos obligatorios'); return; }
    if (f.fechaSalida < f.fechaEntrada) { alert('La fecha de salida debe ser posterior a la entrada'); return; }
    if (this.modalMode() === 'create') {
      const nextId = Math.max(...this.reservas().map(r => r.id), 0) + 1;
      this.reservas.set([{ ...f, id: nextId, codigo: `RES-${nextId}` }, ...this.reservas()]);
    } else {
      this.reservas.set(this.reservas().map(r => r.id === f.id ? { ...f } : r));
    }
    this.closeModal();
  }

  cycleEstado(r: Reserva) {
    const order: EstadoReserva[] = ['PENDIENTE', 'CONFIRMADA', 'CHECKIN', 'CHECKOUT', 'CANCELADA'];
    const idx = order.indexOf(r.estado);
    this.reservas.set(this.reservas().map(x => x.id === r.id ? { ...x, estado: order[(idx + 1) % order.length] } : x));
  }

  confirmCancel(r: Reserva) {
    if (confirm(`¿Cancelar reserva ${r.codigo || r.id} de ${r.huesped}?`)) {
      this.reservas.set(this.reservas().map(x => x.id === r.id ? { ...x, estado: 'CANCELADA', total: 0 } : x));
    }
  }

  exportData() {
    const data = this.filtradas();
    const csv = [['ID', 'Código', 'Huésped', 'Documento', 'Habitación', 'Entrada', 'Salida', 'Estado', 'Total', 'Anticipo', 'Notas'].join(',')];
    data.forEach(r => csv.push([r.id, r.codigo || '', r.huesped, r.documento || '', r.habitacion, r.fechaEntrada, r.fechaSalida, r.estado, r.total, r.anticipo || 0, r.notas || ''].join(',')));
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `reservas_${this.todayIso}.csv`; a.click(); URL.revokeObjectURL(url);
  }
}