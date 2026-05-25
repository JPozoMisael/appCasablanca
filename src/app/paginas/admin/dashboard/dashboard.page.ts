import {
  Component,
  computed,
  signal,
  OnInit,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import {
  DashboardService,
  DashboardStats,
  ReservaHoy,
} from '../../../core/services/dashboard.service';

import {
  IonIcon,
  IonButton,
  IonChip,
  IonHeader,
  IonCard,
  IonToolbar,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  bedOutline,
  calendarOutline,
  peopleOutline,
  cashOutline,
  addCircleOutline,
  chevronForwardOutline,
  timeOutline,
  clipboardOutline,
  trendingUpOutline,
  trendingDownOutline,
  logInOutline,
  logOutOutline,
  alertCircleOutline,
  pricetagOutline,
  restaurantOutline,
  cardOutline,
  analyticsOutline,
} from 'ionicons/icons';

type EstadoReserva =
  | 'CONFIRMADA'
  | 'PENDIENTE'
  | 'CHECKIN'
  | 'CHECKOUT'
  | 'CANCELADA';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    IonToolbar,
    IonCard,
    IonHeader,
    CommonModule,
    RouterModule,
    IonIcon,
    IonButton,
    IonChip,
  ],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  // ======================================================
  // NUEVAS PROPIEDADES PARA EL HEADER
  // ======================================================
  todayDate: string = '';
  userName: string = 'Administrador';
  userRole: string = 'Super Administrador';
  userInitials: string = 'AD';

  // ======================================================
  // SIGNALS — estado principal
  // ======================================================
  totalHabitaciones   = signal(0);
  habitacionesOcupadas = signal(0);
  ingresosMes          = signal(0);
  reservasHoy          = signal<ReservaHoy[]>([]);

  ingresosMesAnterior  = signal(0);
  reservasAyer         = signal(0);
  disponiblesAyer      = signal(0);

  loadingStats    = signal(true);
  loadingReservas = signal(true);

  // ======================================================
  // COMPUTED — derivados automáticos
  // ======================================================
  reservasHoyCount = computed(() => this.reservasHoy().length);
  habitacionesDisponibles = computed(() => this.totalHabitaciones() - this.habitacionesOcupadas());

  ocupacionPorcentaje = computed(() =>
    this.totalHabitaciones() === 0
      ? 0
      : Math.round((this.habitacionesOcupadas() / this.totalHabitaciones()) * 100)
  );

  tendenciaIngresos = computed(() => {
    const ant = this.ingresosMesAnterior();
    const act = this.ingresosMes();
    if (ant === 0) return null;
    return Math.round(((act - ant) / ant) * 100);
  });

  tendenciaReservas = computed(() => {
    const ayer = this.reservasAyer();
    if (ayer === 0) return null;
    return this.reservasHoyCount() - ayer;
  });

  tendenciaDisponibles = computed(() => {
    const ayer = this.disponiblesAyer();
    if (ayer === 0) return null;
    return this.habitacionesDisponibles() - ayer;
  });

  checkins = computed(() =>
    this.reservasHoy().filter((r) => r.estado === 'CHECKIN')
  );

  checkouts = computed(() =>
    this.reservasHoy().filter((r) => r.estado === 'CHECKOUT')
  );

  pendientes = computed(() =>
    this.reservasHoy().filter(
      (r) => r.estado === 'PENDIENTE' || r.estado === 'CONFIRMADA'
    )
  );

  canceladas = computed(() =>
    this.reservasHoy().filter((r) => r.estado === 'CANCELADA')
  );

  hayReservas = computed(
    () =>
      this.checkins().length > 0 ||
      this.checkouts().length > 0 ||
      this.pendientes().length > 0 ||
      this.canceladas().length > 0
  );

  ingresosMesFormateado = computed(() =>
    this.ingresosMes().toLocaleString('es-EC', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  );

  constructor(private dashboardService: DashboardService) {
    addIcons({
      bedOutline,
      calendarOutline,
      peopleOutline,
      cashOutline,
      addCircleOutline,
      chevronForwardOutline,
      timeOutline,
      clipboardOutline,
      trendingUpOutline,
      trendingDownOutline,
      logInOutline,
      logOutOutline,
      alertCircleOutline,
      pricetagOutline,
      restaurantOutline,
      cardOutline,
      analyticsOutline,
    });
  }

  ngOnInit(): void {
    this.loadStats();
    this.loadReservasHoy();
    this.setTodayDate();
    this.loadUserData();
  }

  // ======================================================
  // HEADER METHODS
  // ======================================================
  setTodayDate() {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    this.todayDate = today.toLocaleDateString('es-EC', options);
  }

  loadUserData() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.userName = (user.nombre + ' ' + user.apellido) || 'Administrador';
        this.userRole = this.getRoleLabel(user.rol);
        this.userInitials = (user.nombre?.charAt(0) || 'A') + (user.apellido?.charAt(0) || 'D');
      } catch (e) {
        console.error('Error parsing user', e);
      }
    }
  }

  getRoleLabel(rol: string): string {
    const roles: Record<string, string> = {
      super_admin: 'Super Administrador',
      admin: 'Administrador',
      recepcion: 'Recepcionista',
      cliente: 'Cliente'
    };
    return roles[rol] || 'Usuario';
  }

  // ======================================================
  // LOAD STATS & RESERVAS
  // ======================================================
  loadStats(): void {
    this.loadingStats.set(true);
    this.dashboardService.getStats().subscribe({
      next: (data: DashboardStats) => {
        this.totalHabitaciones.set(data?.totalHabitaciones ?? 0);
        this.habitacionesOcupadas.set(data?.habitacionesOcupadas ?? 0);
        this.ingresosMes.set(Number(data?.ingresosMes ?? 0));
        this.ingresosMesAnterior.set(Number(data?.ingresosMesAnterior ?? 0));
        this.reservasAyer.set(Number(data?.reservasAyer ?? 0));
        this.disponiblesAyer.set(Number(data?.disponiblesAyer ?? 0));
        this.loadingStats.set(false);
      },
      error: (err) => {
        console.error('Error dashboard stats:', err);
        this.totalHabitaciones.set(0);
        this.habitacionesOcupadas.set(0);
        this.ingresosMes.set(0);
        this.loadingStats.set(false);
      },
    });
  }

  loadReservasHoy(): void {
    this.loadingReservas.set(true);
    this.dashboardService.getReservasHoy().subscribe({
      next: (reservas: ReservaHoy[]) => {
        this.reservasHoy.set(Array.isArray(reservas) ? reservas : []);
        this.loadingReservas.set(false);
      },
      error: (err) => {
        console.error('Error reservas hoy:', err);
        this.reservasHoy.set([]);
        this.loadingReservas.set(false);
      },
    });
  }

  // ======================================================
  // HELPERS
  // ======================================================
  colorEstado(estado: string): string {
    const colores: Record<string, string> = {
      CHECKIN:    'success',
      CONFIRMADA: 'primary',
      PENDIENTE:  'warning',
      CANCELADA:  'danger',
      CHECKOUT:   'medium',
    };
    return colores[estado] ?? 'medium';
  }

  iniciales(nombre: string): string {
    if (!nombre) return '?';
    return nombre
      .split(' ')
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase();
  }

  formatoFechaCorta(iso: string): string {
    if (!iso) return '-';
    const parts = iso.split('-');
    if (parts.length !== 3) return iso;
    return `${parts[2]}/${parts[1]}`;
  }

  labelTendencia(delta: number | null, unidad = ''): string {
    if (delta === null) return '';
    const signo = delta >= 0 ? '+' : '';
    return `${signo}${delta}${unidad}`;
  }
}