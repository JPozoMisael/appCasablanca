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
  optionsOutline,
  calendarOutline,
  timeOutline,
  personOutline,
  bedOutline,
  checkmarkCircleOutline,
  warningOutline,
  logInOutline,
  logOutOutline,
} from 'ionicons/icons';

type EstadoReserva =
  | 'PENDIENTE'
  | 'CONFIRMADA'
  | 'CHECKIN'
  | 'CHECKOUT'
  | 'CANCELADA';

interface Reserva {
  id: number;
  codigo?: string; // opcional: RES-0001
  huesped: string;
  documento?: string;
  habitacion: string; // "Doble · 204"
  fechaEntrada: string; // YYYY-MM-DD
  fechaSalida: string;  // YYYY-MM-DD
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
  // ===== data mock (luego API) =====
  reservas = signal<Reserva[]>([
    {
      id: 3001,
      codigo: 'RES-3001',
      huesped: 'Carlos Ruiz',
      documento: '0901234567',
      habitacion: 'Doble · 204',
      fechaEntrada: '2026-01-14',
      fechaSalida: '2026-01-16',
      estado: 'CONFIRMADA',
      total: 120,
      anticipo: 50,
    },
    {
      id: 3002,
      codigo: 'RES-3002',
      huesped: 'María Paredes',
      documento: '0912345678',
      habitacion: 'Suite · 301',
      fechaEntrada: '2026-01-14',
      fechaSalida: '2026-01-15',
      estado: 'CHECKIN',
      total: 95,
      anticipo: 95,
    },
    {
      id: 3003,
      codigo: 'RES-3003',
      huesped: 'Kevin Andrade',
      documento: '0923456789',
      habitacion: 'Simple · 105',
      fechaEntrada: '2026-01-18',
      fechaSalida: '2026-01-21',
      estado: 'PENDIENTE',
      total: 150,
      anticipo: 0,
    },
    {
      id: 3004,
      codigo: 'RES-3004',
      huesped: 'Ana Cedeño',
      documento: '0934567890',
      habitacion: 'Doble · 210',
      fechaEntrada: '2026-01-20',
      fechaSalida: '2026-01-22',
      estado: 'CONFIRMADA',
      total: 180,
      anticipo: 80,
      notas: 'Solicita cama adicional.',
    },
    {
      id: 3005,
      codigo: 'RES-3005',
      huesped: 'Jorge Vera',
      documento: '0945678901',
      habitacion: 'Suite · 303',
      fechaEntrada: '2026-01-22',
      fechaSalida: '2026-01-23',
      estado: 'CANCELADA',
      total: 0,
      anticipo: 0,
    },
  ]);

  // (mock) catálogo de habitaciones para el formulario
  habitaciones = signal<string[]>([
    'Simple · 101',
    'Simple · 105',
    'Doble · 204',
    'Doble · 210',
    'Suite · 301',
    'Suite · 303',
  ]);

  // ===== filtros =====
  q = signal('');
  fEstado = signal<EstadoReserva | 'TODOS'>('TODOS');
  fDesde = signal<string>(''); // YYYY-MM-DD
  fHasta = signal<string>(''); // YYYY-MM-DD

  // ===== modal =====
  modalOpen = signal(false);
  modalMode = signal<ModalMode>('create');

  form = signal<Reserva>({
    id: 0,
    codigo: '',
    huesped: '',
    documento: '',
    habitacion: this.habitaciones()[0] ?? 'Simple · 101',
    fechaEntrada: '',
    fechaSalida: '',
    estado: 'PENDIENTE',
    total: 0,
    anticipo: 0,
    notas: '',
  });

  // ===== KPIs =====
  todayIso = this.toISO(new Date());

  reservasHoy = computed(() =>
    this.reservas().filter((r) => r.fechaEntrada === this.todayIso || r.fechaSalida === this.todayIso)
      .filter(r => r.estado !== 'CANCELADA').length
  );

  checkinHoy = computed(() =>
    this.reservas().filter((r) => r.fechaEntrada === this.todayIso && r.estado !== 'CANCELADA').length
  );

  checkoutHoy = computed(() =>
    this.reservas().filter((r) => r.fechaSalida === this.todayIso && r.estado !== 'CANCELADA').length
  );

  proximas = computed(() =>
    this.reservas().filter((r) => r.fechaEntrada > this.todayIso && r.estado !== 'CANCELADA').length
  );

  // ===== lista filtrada =====
  filtradas = computed(() => {
    const q = this.q().trim().toLowerCase();
    const est = this.fEstado();
    const desde = this.fDesde();
    const hasta = this.fHasta();

    return this.reservas()
      .filter((r) => {
        const okQ =
          !q ||
          (r.codigo || '').toLowerCase().includes(q) ||
          r.huesped.toLowerCase().includes(q) ||
          (r.documento || '').toLowerCase().includes(q) ||
          r.habitacion.toLowerCase().includes(q);

        const okE = est === 'TODOS' ? true : r.estado === est;

        // filtro por rango: si pones desde/hasta, se compara contra entrada
        const okD = !desde || r.fechaEntrada >= desde;
        const okH = !hasta || r.fechaEntrada <= hasta;

        return okQ && okE && okD && okH;
      })
      .sort((a, b) => (a.fechaEntrada.localeCompare(b.fechaEntrada)) || (b.id - a.id));
  });

  constructor() {
    addIcons({
      searchOutline,
      addCircleOutline,
      createOutline,
      eyeOutline,
      closeOutline,
      optionsOutline,
      calendarOutline,
      timeOutline,
      personOutline,
      bedOutline,
      checkmarkCircleOutline,
      warningOutline,
      logInOutline,
      logOutOutline,
    });
  }

  // ===== UI =====
  setEstadoFilter(v: string) {
    this.fEstado.set(v as any);
  }

  estadoColor(estado: EstadoReserva): string {
    switch (estado) {
      case 'CHECKIN':
        return 'success';
      case 'CONFIRMADA':
        return 'primary';
      case 'PENDIENTE':
        return 'warning';
      case 'CANCELADA':
        return 'danger';
      case 'CHECKOUT':
        return 'medium';
      default:
        return 'medium';
    }
  }

  openCreate() {
    this.modalMode.set('create');
    this.form.set({
      id: 0,
      codigo: '',
      huesped: '',
      documento: '',
      habitacion: this.habitaciones()[0] ?? 'Simple · 101',
      fechaEntrada: this.todayIso,
      fechaSalida: this.todayIso,
      estado: 'PENDIENTE',
      total: 0,
      anticipo: 0,
      notas: '',
    });
    this.modalOpen.set(true);
  }

  openEdit(r: Reserva) {
    this.modalMode.set('edit');
    this.form.set({ ...r });
    this.modalOpen.set(true);
  }

  closeModal() {
    this.modalOpen.set(false);
  }

  save() {
    const f = this.form();

    const huesped = f.huesped.trim();
    const habitacion = f.habitacion.trim();
    const entrada = f.fechaEntrada;
    const salida = f.fechaSalida;

    if (!huesped || !habitacion || !entrada || !salida) return;

    if (salida < entrada) return;

    if (this.modalMode() === 'create') {
      const nextId = Math.max(0, ...this.reservas().map((x) => x.id)) + 1;
      const code = `RES-${nextId}`;
      const nuevo: Reserva = { ...f, id: nextId, codigo: code, huesped, habitacion };
      this.reservas.set([nuevo, ...this.reservas()]);
    } else {
      this.reservas.set(this.reservas().map((x) => (x.id === f.id ? { ...f, huesped, habitacion } : x)));
    }

    this.modalOpen.set(false);
  }

  // cambio rápido de estado (cicla)
  cycleEstado(r: Reserva) {
    const order: EstadoReserva[] = ['PENDIENTE', 'CONFIRMADA', 'CHECKIN', 'CHECKOUT', 'CANCELADA'];
    const idx = order.indexOf(r.estado);
    const next = order[(idx + 1) % order.length];

    this.reservas.set(this.reservas().map((x) => (x.id === r.id ? { ...x, estado: next } : x)));
  }

  patch<K extends keyof Reserva>(key: K, value: Reserva[K]) {
    this.form.set({ ...this.form(), [key]: value });
  }

  // ===== helpers =====
  private toISO(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  short(iso: string): string {
    const parts = iso.split('-');
    if (parts.length !== 3) return iso;
    return `${parts[2]}/${parts[1]}`;
  }
}
