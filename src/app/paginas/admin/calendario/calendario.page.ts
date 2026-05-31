import { Component, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import {
  IonIcon,
  IonButton,
  IonChip
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  chevronBackOutline,
  chevronForwardOutline,
  todayOutline,
  calendarOutline,
  addCircleOutline,
  personOutline,
  informationCircleOutline,
  closeOutline,
  createOutline,
  checkmarkCircleOutline,
  logInOutline,
  logOutOutline,
  trashOutline
} from 'ionicons/icons';

import { CalendarioService } from '@app/core/services/calendario.service';

type EstadoReserva =
  | 'CONFIRMADA'
  | 'PENDIENTE'
  | 'CHECKIN'
  | 'CHECKOUT'
  | 'CANCELADA';

interface HabitacionRow {
  id: number;
  codigo: string;
  tipo: string;
  piso?: string;
}

interface Reserva {
  id: number;
  huesped: string;
  habitacionId: number;
  checkIn: string;
  checkOut: string;
  estado: EstadoReserva;
  total: number;
}

interface Bar {
  reserva: Reserva;
  colStart: number;
  colEnd: number;
  clippedLeft: boolean;
  clippedRight: boolean;
}

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonIcon,
    IonButton,
    IonChip
  ],
  templateUrl: './calendario.page.html',
  styleUrls: ['./calendario.page.scss'],
})
export class CalendarioPage implements OnInit {
  viewDate = signal<Date>(this.startOfMonth(new Date()));
  selectedReservaId = signal<number | null>(null);
  loading = signal(true);

  selectedReserva = computed(() => {
    const id = this.selectedReservaId();
    if (!id) return null;
    return this.reservas().find(r => r.id === id) || null;
  });

  habitaciones = signal<HabitacionRow[]>([]);
  reservas = signal<Reserva[]>([]);

  constructor(private calendarioService: CalendarioService) {
    addIcons({
      chevronBackOutline,
      chevronForwardOutline,
      todayOutline,
      calendarOutline,
      addCircleOutline,
      personOutline,
      informationCircleOutline,
      closeOutline,
      createOutline,
      checkmarkCircleOutline,
      logInOutline,
      logOutOutline,
      trashOutline
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    Promise.all([
      this.calendarioService.getHabitaciones().toPromise(),
      this.calendarioService.getReservas().toPromise()
    ]).then(([habitaciones, reservas]) => {
      if (habitaciones) this.habitaciones.set(habitaciones);
      if (reservas) this.reservas.set(reservas);
      this.loading.set(false);
    }).catch(err => {
      console.error('Error cargando datos del calendario:', err);
      this.loading.set(false);
    });
  }

  // =================== Navegación ===================
  prevMonth() {
    const d = new Date(this.viewDate());
    d.setMonth(d.getMonth() - 1);
    this.viewDate.set(this.startOfMonth(d));
    this.selectedReservaId.set(null);
  }

  nextMonth() {
    const d = new Date(this.viewDate());
    d.setMonth(d.getMonth() + 1);
    this.viewDate.set(this.startOfMonth(d));
    this.selectedReservaId.set(null);
  }

  goToday() {
    const today = new Date();
    this.viewDate.set(this.startOfMonth(today));
    this.selectedReservaId.set(null);
  }

  // =================== UI Actions ===================
  selectReserva(id: number) {
    this.selectedReservaId.set(id);
  }

  closeDetail() {
    this.selectedReservaId.set(null);
  }

  confirmarReserva() {
    const reserva = this.selectedReserva();
    if (!reserva) return;
    this.calendarioService.actualizarEstado(reserva.id, 'CONFIRMADA').subscribe({
      next: () => this.loadData(),
      error: (err) => console.error('Error confirmar reserva:', err)
    });
  }

  checkinReserva() {
    const reserva = this.selectedReserva();
    if (!reserva) return;
    this.calendarioService.realizarCheckIn(reserva.id).subscribe({
      next: () => this.loadData(),
      error: (err) => console.error('Error check-in:', err)
    });
  }

  checkoutReserva() {
    const reserva = this.selectedReserva();
    if (!reserva) return;
    this.calendarioService.realizarCheckOut(reserva.id).subscribe({
      next: () => this.loadData(),
      error: (err) => console.error('Error check-out:', err)
    });
  }

  cancelarReserva() {
    const reserva = this.selectedReserva();
    if (!reserva) return;
    this.calendarioService.cancelarReserva(reserva.id).subscribe({
      next: () => this.loadData(),
      error: (err) => console.error('Error cancelar reserva:', err)
    });
  }

  private updateReservaEstado(id: number, nuevoEstado: EstadoReserva) {
    const reservas = this.reservas().map(r => 
      r.id === id ? { ...r, estado: nuevoEstado } : r
    );
    this.reservas.set(reservas);
    this.closeDetail();
  }

  isSelected(id: number): boolean {
    return this.selectedReservaId() === id;
  }

  getRoomName(habitacionId: number): string {
    const room = this.habitaciones().find(r => r.id === habitacionId);
    return room ? `${room.codigo} - ${room.tipo}` : 'No asignada';
  }

  formatEstado(estado: EstadoReserva): string {
    const map: Record<EstadoReserva, string> = {
      CONFIRMADA: 'Confirmada',
      PENDIENTE: 'Pendiente',
      CHECKIN: 'Check-in',
      CHECKOUT: 'Check-out',
      CANCELADA: 'Cancelada'
    };
    return map[estado] || estado;
  }

  colorEstado(estado: EstadoReserva): string {
    const map: Record<EstadoReserva, string> = {
      CHECKIN: 'success',
      CONFIRMADA: 'primary',
      PENDIENTE: 'warning',
      CANCELADA: 'danger',
      CHECKOUT: 'medium'
    };
    return map[estado] || 'medium';
  }

  // =================== Computed ===================
  monthLabel = computed(() => this.formatMonthYear(this.viewDate()));

  days = computed(() => {
    const start = this.startOfMonth(this.viewDate());
    const daysInMonth = this.daysInMonth(start);
    const todayIso = this.toISO(new Date());
    const out: { day: number; iso: string; isToday: boolean }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(start.getFullYear(), start.getMonth(), d);
      const iso = this.toISO(date);
      out.push({ day: d, iso, isToday: iso === todayIso });
    }
    return out;
  });

  daysCount = computed(() => this.days().length);
  gridTemplate = computed(() => `240px repeat(${this.daysCount()}, minmax(32px, 1fr))`);

  barsMap = computed(() => {
    const monthStart = this.startOfMonth(this.viewDate());
    const monthEnd = this.endOfMonth(this.viewDate());
    const map = new Map<number, Bar[]>();

    for (const room of this.habitaciones()) {
      const bars = this.reservas()
        .filter(r => r.habitacionId === room.id && r.estado !== 'CANCELADA')
        .map(r => {
          const inD = this.parseISO(r.checkIn);
          const outD = this.parseISO(r.checkOut);
          const occupyEnd = new Date(outD);
          occupyEnd.setDate(occupyEnd.getDate() - 1);
          const clippedLeft = inD < monthStart;
          const clippedRight = occupyEnd > monthEnd;
          const start = clippedLeft ? monthStart : inD;
          const end = clippedRight ? monthEnd : occupyEnd;
          const colStart = start.getDate();
          const colEnd = end.getDate() + 1;
          return { reserva: r, colStart, colEnd, clippedLeft, clippedRight };
        })
        .sort((a, b) => a.colStart - b.colStart);
      map.set(room.id, bars);
    }
    return map;
  });

  // =================== Helpers ===================
  private toISO(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private parseISO(iso: string): Date {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, (m ?? 1) - 1, d ?? 1);
  }

  private startOfMonth(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }

  private endOfMonth(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth() + 1, 0);
  }

  private daysInMonth(d: Date): number {
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  }

  private formatMonthYear(d: Date): string {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  }
}