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
  calendarOutline,
  timeOutline,
  personOutline,
  bedOutline,
  logInOutline,
  logOutOutline,
  downloadOutline,
  closeCircleOutline, refreshOutline } from 'ionicons/icons';
import { ReservasService } from '@app/core/services/reservas.service';
import { Reserva as ReservaModel, EstadoReserva } from '@app/shared/models/reserva.model';

interface ReservaUI {
  id: number;
  codigo?: string;
  huesped: string;
  documento?: string;
  habitacion: string;
  habitacionId: number;
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
export class AdminReservasPage implements OnInit {
  reservas = signal<ReservaUI[]>([]);
  loading = signal(true);
  
  habitaciones = signal<{ id: number; nombre: string }[]>([
    { id: 1, nombre: 'Simple · 101' },
    { id: 2, nombre: 'Simple · 105' },
    { id: 3, nombre: 'Doble · 204' },
    { id: 4, nombre: 'Doble · 210' },
    { id: 5, nombre: 'Suite · 301' },
    { id: 6, nombre: 'Suite · 303' }
  ]);

  q = signal('');
  fEstado = signal<EstadoReserva | 'TODOS'>('TODOS');
  fDesde = signal('');
  fHasta = signal('');
  modalOpen = signal(false);
  modalMode = signal<ModalMode>('create');

  form = signal<ReservaUI>({
    id: 0, codigo: '', huesped: '', documento: '', habitacion: this.habitaciones()[0].nombre,
    habitacionId: this.habitaciones()[0].id,
    fechaEntrada: '', fechaSalida: '', estado: 'PENDIENTE', total: 0, anticipo: 0, notas: ''
  });

  constructor(private reservasService: ReservasService) {
    addIcons({addCircleOutline,calendarOutline,logInOutline,logOutOutline,timeOutline,refreshOutline,searchOutline,downloadOutline,bedOutline,eyeOutline,createOutline,syncOutline,closeCircleOutline,closeOutline,personOutline});
  }

  ngOnInit() {
    this.cargarReservas();
  }

  cargarReservas() {
    this.loading.set(true);
    this.reservasService.getAll().subscribe({
      next: (reservas) => {
        const transformed = reservas.map(r => this.transformReserva(r));
        this.reservas.set(transformed);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargar reservas:', err);
        this.loading.set(false);
      }
    });
  }

  private transformReserva(r: ReservaModel): ReservaUI {
    return {
      id: r.id,
      codigo: r.codigo || `RES-${r.id}`,
      huesped: `Huésped ${r.huespedId}`,
      documento: undefined,
      habitacion: `Habitación ${r.habitacionId}`,
      habitacionId: r.habitacionId,
      fechaEntrada: r.checkIn,
      fechaSalida: r.checkOut,
      estado: r.estado,
      total: r.total,
      anticipo: undefined,
      notas: undefined
    };
  }

  get todayIso() { return new Date().toISOString().split('T')[0]; }

  reservasHoy = computed(() => this.reservas().filter(r => r.fechaEntrada === this.todayIso || r.fechaSalida === this.todayIso).filter(r => r.estado !== 'CANCELADA').length);
  checkinHoy = computed(() => this.reservas().filter(r => r.fechaEntrada === this.todayIso && r.estado !== 'CANCELADA').length);
  checkoutHoy = computed(() => this.reservas().filter(r => r.fechaSalida === this.todayIso && r.estado !== 'CANCELADA').length);
  proximas = computed(() => this.reservas().filter(r => r.fechaEntrada > this.todayIso && r.estado !== 'CANCELADA').length);

  filtradas = computed(() => {
    let items = this.reservas();
    const query = this.q().trim().toLowerCase();
    if (query) {
      items = items.filter(r => 
        (r.codigo || '').toLowerCase().includes(query) || 
        r.huesped.toLowerCase().includes(query) || 
        r.habitacion.toLowerCase().includes(query)
      );
    }
    if (this.fEstado() !== 'TODOS') items = items.filter(r => r.estado === this.fEstado());
    if (this.fDesde()) items = items.filter(r => r.fechaEntrada >= this.fDesde());
    if (this.fHasta()) items = items.filter(r => r.fechaEntrada <= this.fHasta());
    return items.sort((a, b) => a.fechaEntrada.localeCompare(b.fechaEntrada) || b.id - a.id);
  });

  setEstadoFilter(v: string) { this.fEstado.set(v as EstadoReserva); }
  
  getInitials(nombre: string) { 
    return nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase(); 
  }
  
  formatDate(iso: string) { 
    if (!iso) return '';
    const parts = iso.split('-'); 
    return `${parts[2]}/${parts[1]}`; 
  }

  getEstadoClass(estado: EstadoReserva): string {
    const map: Record<EstadoReserva, string> = {
      PENDIENTE: 'pendiente',
      CONFIRMADA: 'confirmada',
      CHECKIN: 'checkin',
      CHECKOUT: 'checkout',
      CANCELADA: 'cancelada'
    };
    return map[estado] || '';
  }

  formatEstado(estado: EstadoReserva): string {
    const map: Record<EstadoReserva, string> = {
      PENDIENTE: 'Pendiente',
      CONFIRMADA: 'Confirmada',
      CHECKIN: 'Check-in',
      CHECKOUT: 'Check-out',
      CANCELADA: 'Cancelada'
    };
    return map[estado] || estado;
  }

  openCreate() { 
    this.modalMode.set('create'); 
    const defaultHab = this.habitaciones()[0];
    this.form.set({ 
      id: 0, codigo: '', huesped: '', documento: '', 
      habitacion: defaultHab.nombre,
      habitacionId: defaultHab.id,
      fechaEntrada: this.todayIso, fechaSalida: this.todayIso, 
      estado: 'PENDIENTE', total: 0, anticipo: 0, notas: '' 
    }); 
    this.modalOpen.set(true); 
  }
  
  openEdit(r: ReservaUI) { 
    this.modalMode.set('edit'); 
    this.form.set({ ...r }); 
    this.modalOpen.set(true); 
  }
  
  openDetail(r: ReservaUI) { 
    alert(`Reserva ${r.codigo || r.id}\nHuésped: ${r.huesped}\nHabitación: ${r.habitacion}\nEntrada: ${r.fechaEntrada}\nSalida: ${r.fechaSalida}\nEstado: ${this.formatEstado(r.estado)}\nTotal: $${r.total}`); 
  }
  
  closeModal() { this.modalOpen.set(false); }
  
  patch<K extends keyof ReservaUI>(key: K, value: ReservaUI[K]) { 
    this.form.set({ ...this.form(), [key]: value }); 
  }

  onHabitacionChange(event: any) {
    const nombre = event.target.value;
    const habitacion = this.habitaciones().find(h => h.nombre === nombre);
    if (habitacion) {
      this.form.set({ 
        ...this.form(), 
        habitacion: habitacion.nombre,
        habitacionId: habitacion.id
      });
    }
  }

  save() {
    const f = this.form();
    if (!f.habitacion || !f.fechaEntrada || !f.fechaSalida) { 
      alert('Complete los campos obligatorios'); 
      return; 
    }
    if (f.fechaSalida < f.fechaEntrada) { 
      alert('La fecha de salida debe ser posterior a la entrada'); 
      return; 
    }
    
    // ✅ FORMATO CORRECTO para tu servicio
    const payload = {
      cliente_id: 1,        // TODO: Seleccionar cliente real
      hotel_id: 1,          // TODO: Seleccionar hotel real
      fecha_entrada: f.fechaEntrada,
      fecha_salida: f.fechaSalida,
      num_huespedes: 1,     // TODO: Calcular desde adultos + niños
      habitaciones: [
        { habitacion_id: f.habitacionId }
      ],
      observaciones: f.notas
    };

    if (this.modalMode() === 'create') {
      this.reservasService.create(payload).subscribe({
        next: () => this.cargarReservas(),
        error: (err) => console.error('Error crear reserva:', err)
      });
    } else {
      // Para actualizar, solo algunos campos son permitidos
      const updatePayload = {
        fecha_entrada: f.fechaEntrada,
        fecha_salida: f.fechaSalida,
        num_huespedes: 1,
        observaciones: f.notas,
        estado: f.estado
      };
      this.reservasService.update(f.id, updatePayload).subscribe({
        next: () => this.cargarReservas(),
        error: (err) => console.error('Error actualizar reserva:', err)
      });
    }
    this.closeModal();
  }

  cycleEstado(r: ReservaUI) {
    const order: EstadoReserva[] = ['PENDIENTE', 'CONFIRMADA', 'CHECKIN', 'CHECKOUT', 'CANCELADA'];
    const idx = order.indexOf(r.estado);
    const nextEstado = order[(idx + 1) % order.length];
    
    this.reservasService.update(r.id, { estado: nextEstado }).subscribe({
      next: () => this.cargarReservas(),
      error: (err) => console.error('Error cambiar estado:', err)
    });
  }

  confirmCancel(r: ReservaUI) {
    if (confirm(`¿Cancelar reserva ${r.codigo || r.id}?`)) {
      this.reservasService.cancel(r.id).subscribe({
        next: () => this.cargarReservas(),
        error: (err) => console.error('Error cancelar reserva:', err)
      });
    }
  }

  exportData() {
    const data = this.filtradas();
    const csv = [['ID', 'Código', 'Huésped', 'Habitación', 'Entrada', 'Salida', 'Estado', 'Total'].join(',')];
    data.forEach(r => csv.push([r.id, r.codigo || '', r.huesped, r.habitacion, r.fechaEntrada, r.fechaSalida, r.estado, r.total].join(',')));
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `reservas_${this.todayIso}.csv`; a.click(); 
    URL.revokeObjectURL(url);
  }
}