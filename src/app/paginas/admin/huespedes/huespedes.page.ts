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
  peopleOutline,
  personOutline,
  callOutline,
  mailOutline,
  idCardOutline,
  starOutline,
  shieldCheckmarkOutline,
  calendarOutline,
  downloadOutline,
  trashOutline
} from 'ionicons/icons';

type TipoHuesped = 'NORMAL' | 'FRECUENTE' | 'VIP';

interface Huesped {
  id: number;
  nombres: string;
  documento: string;
  telefono?: string;
  email?: string;
  tipo: TipoHuesped;
  createdAt: string;
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
  huespedes = signal<Huesped[]>([
    { id: 4001, nombres: 'Carlos Ruiz', documento: '0901234567', telefono: '0999999999', email: 'carlos@correo.com', tipo: 'FRECUENTE', createdAt: '2026-01-05', notas: 'Prefiere habitación silenciosa.' },
    { id: 4002, nombres: 'María Paredes', documento: '0912345678', telefono: '0988888888', email: 'maria@correo.com', tipo: 'VIP', createdAt: '2026-01-10', notas: 'Check-in temprano si es posible.' },
    { id: 4003, nombres: 'Kevin Andrade', documento: '0923456789', telefono: '0977777777', email: 'kevin@correo.com', tipo: 'NORMAL', createdAt: '2025-12-20' },
    { id: 4004, nombres: 'Ana Cedeño', documento: '0934567890', telefono: '0966666666', email: 'ana@correo.com', tipo: 'NORMAL', createdAt: '2026-01-12' },
  ]);

  reservasActivasDoc = signal<string[]>(['0912345678', '0901234567']);

  q = signal('');
  fTipo = signal<TipoHuesped | 'TODOS'>('TODOS');
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

  constructor() {
    addIcons({
      searchOutline, addCircleOutline, createOutline, eyeOutline, closeOutline,
      syncOutline, peopleOutline, personOutline, callOutline, mailOutline,
      idCardOutline, starOutline, shieldCheckmarkOutline, calendarOutline,
      downloadOutline, trashOutline
    });
  }

  total = () => this.huespedes().length;
  nuevosMes = () => {
    const today = new Date();
    const ym = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    return this.huespedes().filter(h => h.createdAt.startsWith(ym)).length;
  };
  frecuentes = () => this.huespedes().filter(h => h.tipo === 'FRECUENTE' || h.tipo === 'VIP').length;
  conReservasActivas = () => this.huespedes().filter(h => this.reservasActivasDoc().includes(h.documento)).length;

  filtrados = computed(() => {
    let items = this.huespedes();
    const query = this.q().trim().toLowerCase();
    const tipo = this.fTipo();

    if (query) items = items.filter(h => 
      h.nombres.toLowerCase().includes(query) || 
      h.documento.toLowerCase().includes(query) ||
      (h.email || '').toLowerCase().includes(query) ||
      (h.telefono || '').toLowerCase().includes(query)
    );
    if (tipo !== 'TODOS') items = items.filter(h => h.tipo === tipo);
    return items.sort((a, b) => b.id - a.id);
  });

  setTipoFilter(v: string) { this.fTipo.set(v as any); }

  getTipoClass(tipo: TipoHuesped): string {
    return { NORMAL: 'normal', FRECUENTE: 'frecuente', VIP: 'vip' }[tipo] || '';
  }

  formatTipo(tipo: TipoHuesped): string {
    return { NORMAL: 'Normal', FRECUENTE: 'Frecuente', VIP: 'VIP' }[tipo] || tipo;
  }

  getInitials(nombre: string): string {
    return nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }

  openCreate() {
    this.modalMode.set('create');
    this.form.set({ id: 0, nombres: '', documento: '', telefono: '', email: '', tipo: 'NORMAL', createdAt: this.todayIso(), notas: '' });
    this.modalOpen.set(true);
  }

  openEdit(h: Huesped) { this.modalMode.set('edit'); this.form.set({ ...h }); this.modalOpen.set(true); }
  openDetail(h: Huesped) { alert(`Huésped: ${h.nombres}\nDocumento: ${h.documento}\nTipo: ${this.formatTipo(h.tipo)}\nTeléfono: ${h.telefono || '—'}\nEmail: ${h.email || '—'}\nNotas: ${h.notas || 'Ninguna'}`); }
  closeModal() { this.modalOpen.set(false); }

  patch<K extends keyof Huesped>(key: K, value: Huesped[K]) { this.form.set({ ...this.form(), [key]: value }); }

  save() {
    const f = this.form();
    if (!f.nombres.trim() || !f.documento.trim()) { alert('Nombres y documento son obligatorios'); return; }
    if (this.modalMode() === 'create') {
      const nextId = Math.max(0, ...this.huespedes().map(x => x.id), 0) + 1;
      this.huespedes.set([{ ...f, id: nextId }, ...this.huespedes()]);
    } else {
      this.huespedes.set(this.huespedes().map(x => x.id === f.id ? { ...f } : x));
    }
    this.closeModal();
  }

  cycleTipo(h: Huesped) {
    const order: TipoHuesped[] = ['NORMAL', 'FRECUENTE', 'VIP'];
    const idx = order.indexOf(h.tipo);
    const next = order[(idx + 1) % order.length];
    this.huespedes.set(this.huespedes().map(x => x.id === h.id ? { ...x, tipo: next } : x));
  }

  confirmDelete(h: Huesped) {
    if (confirm(`¿Eliminar a ${h.nombres}?`)) {
      this.huespedes.set(this.huespedes().filter(x => x.id !== h.id));
    }
  }

  exportData() {
    const data = this.filtrados();
    const csv = [['ID', 'Nombres', 'Documento', 'Teléfono', 'Email', 'Tipo', 'Fecha registro', 'Notas'].join(',')];
    data.forEach(h => csv.push([h.id, h.nombres, h.documento, h.telefono || '', h.email || '', h.tipo, h.createdAt, h.notas || ''].join(',')));
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'huespedes.csv'; a.click(); URL.revokeObjectURL(url);
  }

  private todayIso(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}