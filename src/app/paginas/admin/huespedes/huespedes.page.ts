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
  peopleOutline,
  personOutline,
  callOutline,
  mailOutline,
  idCardOutline,
  starOutline,
  shieldCheckmarkOutline,
  calendarOutline,
} from 'ionicons/icons';

type TipoHuesped = 'NORMAL' | 'FRECUENTE' | 'VIP';

interface Huesped {
  id: number;
  nombres: string;
  documento: string; // cédula/pasaporte
  telefono?: string;
  email?: string;
  tipo: TipoHuesped;
  createdAt: string; // YYYY-MM-DD (para KPI "nuevos mes")
  notas?: string;
}

type ModalMode = 'create' | 'edit';

@Component({
  selector: 'app-admin-huespedes',
  standalone: true,
  imports: [CommonModule, IonIcon, IonButton, IonChip],
  templateUrl: './huespedes.page.html',
  styleUrls: ['./huespedes.page.scss'],
})
export class AdminHuespedesPage {
  // ===== mock data (luego API) =====
  huespedes = signal<Huesped[]>([
    {
      id: 4001,
      nombres: 'Carlos Ruiz',
      documento: '0901234567',
      telefono: '0999999999',
      email: 'carlos@correo.com',
      tipo: 'FRECUENTE',
      createdAt: '2026-01-05',
      notas: 'Prefiere habitación silenciosa.',
    },
    {
      id: 4002,
      nombres: 'María Paredes',
      documento: '0912345678',
      telefono: '0988888888',
      email: 'maria@correo.com',
      tipo: 'VIP',
      createdAt: '2026-01-10',
      notas: 'Check-in temprano si es posible.',
    },
    {
      id: 4003,
      nombres: 'Kevin Andrade',
      documento: '0923456789',
      telefono: '0977777777',
      email: 'kevin@correo.com',
      tipo: 'NORMAL',
      createdAt: '2025-12-20',
    },
    {
      id: 4004,
      nombres: 'Ana Cedeño',
      documento: '0934567890',
      telefono: '0966666666',
      email: 'ana@correo.com',
      tipo: 'NORMAL',
      createdAt: '2026-01-12',
    },
  ]);

  // (mock) reservas activas por documento (para KPI rápido)
  reservasActivasDoc = signal<string[]>(['0912345678', '0901234567']);

  // ===== filtros =====
  q = signal('');
  fTipo = signal<TipoHuesped | 'TODOS'>('TODOS');

  // ===== modal =====
  modalOpen = signal(false);
  modalMode = signal<ModalMode>('create');

  form = signal<Huesped>({
    id: 0,
    nombres: '',
    documento: '',
    telefono: '',
    email: '',
    tipo: 'NORMAL',
    createdAt: this.todayIso(),
    notas: '',
  });

  // ===== KPIs =====
  total = computed(() => this.huespedes().length);

  nuevosMes = computed(() => {
    const today = new Date();
    const ym = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    return this.huespedes().filter(h => h.createdAt.startsWith(ym)).length;
  });

  frecuentes = computed(() =>
    this.huespedes().filter(h => h.tipo === 'FRECUENTE' || h.tipo === 'VIP').length
  );

  conReservasActivas = computed(() =>
    this.huespedes().filter(h => this.reservasActivasDoc().includes(h.documento)).length
  );

  // ===== lista filtrada =====
  filtrados = computed(() => {
    const q = this.q().trim().toLowerCase();
    const tipo = this.fTipo();

    return this.huespedes()
      .filter(h => {
        const okQ =
          !q ||
          h.nombres.toLowerCase().includes(q) ||
          h.documento.toLowerCase().includes(q) ||
          (h.email || '').toLowerCase().includes(q) ||
          (h.telefono || '').toLowerCase().includes(q);

        const okT = tipo === 'TODOS' ? true : h.tipo === tipo;

        return okQ && okT;
      })
      .sort((a, b) => b.id - a.id);
  });

  constructor() {
    addIcons({
      searchOutline,
      addCircleOutline,
      createOutline,
      eyeOutline,
      closeOutline,
      optionsOutline,
      peopleOutline,
      personOutline,
      callOutline,
      mailOutline,
      idCardOutline,
      starOutline,
      shieldCheckmarkOutline,
      calendarOutline,
    });
  }

  // ===== UI =====
  setTipoFilter(v: string) {
    this.fTipo.set(v as any);
  }

  tipoColor(tipo: TipoHuesped): string {
    switch (tipo) {
      case 'VIP': return 'danger';
      case 'FRECUENTE': return 'warning';
      default: return 'medium';
    }
  }

  openCreate() {
    this.modalMode.set('create');
    this.form.set({
      id: 0,
      nombres: '',
      documento: '',
      telefono: '',
      email: '',
      tipo: 'NORMAL',
      createdAt: this.todayIso(),
      notas: '',
    });
    this.modalOpen.set(true);
  }

  openEdit(h: Huesped) {
    this.modalMode.set('edit');
    this.form.set({ ...h });
    this.modalOpen.set(true);
  }

  closeModal() {
    this.modalOpen.set(false);
  }

  save() {
    const f = this.form();
    const nombres = f.nombres.trim();
    const documento = f.documento.trim();

    if (!nombres || !documento) return;

    if (this.modalMode() === 'create') {
      const nextId = Math.max(0, ...this.huespedes().map(x => x.id)) + 1;
      const nuevo: Huesped = { ...f, id: nextId, nombres, documento };
      this.huespedes.set([nuevo, ...this.huespedes()]);
    } else {
      this.huespedes.set(this.huespedes().map(x => (x.id === f.id ? { ...f, nombres, documento } : x)));
    }

    this.modalOpen.set(false);
  }

  // Quick: ciclar tipo (NORMAL -> FRECUENTE -> VIP -> NORMAL)
  cycleTipo(h: Huesped) {
    const order: TipoHuesped[] = ['NORMAL', 'FRECUENTE', 'VIP'];
    const idx = order.indexOf(h.tipo);
    const next = order[(idx + 1) % order.length];

    this.huespedes.set(this.huespedes().map(x => (x.id === h.id ? { ...x, tipo: next } : x)));
  }

  patch<K extends keyof Huesped>(key: K, value: Huesped[K]) {
    this.form.set({ ...this.form(), [key]: value });
  }

  private todayIso(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
