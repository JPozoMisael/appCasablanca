import { Component, computed, signal, OnInit } from '@angular/core';
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
import { HuespedesService } from '@app/core/services/huespedes.service';
import { Huesped as HuespedModel } from '@app/shared/models/huesped.model';

type TipoHuesped = 'NORMAL' | 'FRECUENTE' | 'VIP';

interface Huesped {
  id: number;
  nombres: string;
  apellidos: string;
  documento?: string | null;
  email?: string | null;
  telefono?: string | null;
  nacionalidad?: string | null;
  fechaNacimiento?: string | null;
  tipo: TipoHuesped;
  notas?: string;
  creadoEn?: string;
}

type ModalMode = 'create' | 'edit';

@Component({
  selector: 'app-admin-huespedes',
  standalone: true,
  imports: [CommonModule, IonIcon, IonButton, IonChip],
  templateUrl: './huespedes.page.html',
  styleUrls: ['./huespedes.page.scss'],
})
export class AdminHuespedesPage implements OnInit {
  huespedes = signal<Huesped[]>([]);
  loading = signal(true);
  
  reservasActivasDoc = signal<string[]>([]);

  q = signal('');
  fTipo = signal<TipoHuesped | 'TODOS'>('TODOS');
  modalOpen = signal(false);
  modalMode = signal<ModalMode>('create');

  form = signal<Huesped>({
    id: 0,
    nombres: '',
    apellidos: '',
    documento: '',
    telefono: '',
    email: '',
    nacionalidad: '',
    fechaNacimiento: '',
    tipo: 'NORMAL',
    notas: '',
    creadoEn: this.todayIso(),
  });

  constructor(private huespedesService: HuespedesService) {
    addIcons({
      searchOutline, addCircleOutline, createOutline, eyeOutline, closeOutline,
      syncOutline, peopleOutline, personOutline, callOutline, mailOutline,
      idCardOutline, starOutline, shieldCheckmarkOutline, calendarOutline,
      downloadOutline, trashOutline
    });
  }

  ngOnInit() {
    this.cargarHuespedes();
  }

  cargarHuespedes() {
    this.loading.set(true);
    this.huespedesService.getAll().subscribe({
      next: (huespedes) => {
        const transformed = huespedes.map(h => this.transformHuesped(h));
        this.huespedes.set(transformed);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargar huéspedes:', err);
        this.loading.set(false);
      }
    });
  }

  private transformHuesped(h: HuespedModel): Huesped {
    return {
      id: h.id,
      nombres: h.nombres,
      apellidos: h.apellidos,
      documento: h.documento || '',
      email: h.email || '',
      telefono: h.telefono || '',
      nacionalidad: h.nacionalidad || '',
      fechaNacimiento: h.fechaNacimiento || '',
      tipo: 'NORMAL',
      notas: '',
      creadoEn: h.creadoEn || this.todayIso()
    };
  }

  total = () => this.huespedes().length;
  
  nuevosMes = () => {
    const today = new Date();
    const ym = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    return this.huespedes().filter(h => (h.creadoEn || '').startsWith(ym)).length;
  };
  
  frecuentes = () => this.huespedes().filter(h => h.tipo === 'FRECUENTE' || h.tipo === 'VIP').length;
  conReservasActivas = () => this.huespedes().filter(h => this.reservasActivasDoc().includes(h.documento || '')).length;

  filtrados = computed(() => {
    let items = this.huespedes();
    const query = this.q().trim().toLowerCase();
    const tipo = this.fTipo();

    if (query) items = items.filter(h => 
      (h.nombres + ' ' + h.apellidos).toLowerCase().includes(query) || 
      (h.documento || '').toLowerCase().includes(query) ||
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

  getInitials(nombres: string, apellidos: string): string {
    return (nombres.charAt(0) + apellidos.charAt(0)).toUpperCase();
  }

  openCreate() {
    this.modalMode.set('create');
    this.form.set({
      id: 0,
      nombres: '',
      apellidos: '',
      documento: '',
      telefono: '',
      email: '',
      nacionalidad: '',
      fechaNacimiento: '',
      tipo: 'NORMAL',
      notas: '',
      creadoEn: this.todayIso()
    });
    this.modalOpen.set(true);
  }

  openEdit(h: Huesped) { 
    this.modalMode.set('edit'); 
    this.form.set({ ...h }); 
    this.modalOpen.set(true); 
  }
  
  openDetail(h: Huesped) { 
    alert(`Huésped: ${h.nombres} ${h.apellidos}\nDocumento: ${h.documento || '—'}\nTipo: ${this.formatTipo(h.tipo)}\nTeléfono: ${h.telefono || '—'}\nEmail: ${h.email || '—'}\nNacionalidad: ${h.nacionalidad || '—'}\nNotas: ${h.notas || 'Ninguna'}`); 
  }
  
  closeModal() { this.modalOpen.set(false); }

  patch<K extends keyof Huesped>(key: K, value: Huesped[K]) { 
    this.form.set({ ...this.form(), [key]: value }); 
  }

  save() {
  const f = this.form();
  if (!f.nombres.trim() || !f.apellidos.trim()) { 
    alert('Nombres y apellidos son obligatorios'); 
    return; 
  }
  
  // ✅ Payload sin 'tipo' (solo los campos del modelo Huesped)
  const payload = {
    nombres: f.nombres.trim(),
    apellidos: f.apellidos.trim(),
    documento: f.documento || null,
    telefono: f.telefono || null,
    email: f.email || null,
    nacionalidad: f.nacionalidad || null,
    fechaNacimiento: f.fechaNacimiento || null
  };

  if (this.modalMode() === 'create') {
    this.huespedesService.create(payload).subscribe({
      next: () => this.cargarHuespedes(),
      error: (err) => console.error('Error crear:', err)
    });
  } else {
    this.huespedesService.update(f.id, payload).subscribe({
      next: () => this.cargarHuespedes(),
      error: (err) => console.error('Error actualizar:', err)
    });
  }
  this.closeModal();
}

  cycleTipo(h: Huesped) {
    const order: TipoHuesped[] = ['NORMAL', 'FRECUENTE', 'VIP'];
    const idx = order.indexOf(h.tipo);
    const next = order[(idx + 1) % order.length];
    
    this.huespedesService.update(h.id, { tipo: next }).subscribe({
      next: () => this.cargarHuespedes(),
      error: (err) => console.error('Error cambiar tipo:', err)
    });
  }

  confirmDelete(h: Huesped) {
    if (confirm(`¿Eliminar a ${h.nombres} ${h.apellidos}?`)) {
      this.huespedesService.delete(h.id).subscribe({
        next: (success) => {
          if (success) this.cargarHuespedes();
        },
        error: (err) => console.error('Error eliminar:', err)
      });
    }
  }

  exportData() {
    const data = this.filtrados();
    const csv = [['ID', 'Nombres', 'Apellidos', 'Documento', 'Teléfono', 'Email', 'Tipo', 'Nacionalidad', 'Notas'].join(',')];
    data.forEach(h => csv.push([
      h.id, h.nombres, h.apellidos, h.documento || '', h.telefono || '', 
      h.email || '', h.tipo, h.nacionalidad || '', h.notas || ''
    ].join(',')));
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'huespedes.csv'; a.click(); 
    URL.revokeObjectURL(url);
  }

  private todayIso(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}