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
} from 'ionicons/icons';


// =========================================
// TIPOS LOCALES
// =========================================

type EstadoReserva =
  | 'CONFIRMADA'
  | 'PENDIENTE'
  | 'CHECKIN'
  | 'CHECKOUT'
  | 'CANCELADA';


// =========================================
// COMPONENT
// =========================================

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

  // =======================================
  // SIGNALS — estado principal
  // =======================================

  totalHabitaciones   = signal(0);
  habitacionesOcupadas = signal(0);
  ingresosMes          = signal(0);
  reservasHoy          = signal<ReservaHoy[]>([]);

  // Para tendencias (opcionales, vienen del servicio)
  ingresosMesAnterior  = signal(0);
  reservasAyer         = signal(0);
  disponiblesAyer      = signal(0);

  // Estado de carga
  loadingStats    = signal(true);
  loadingReservas = signal(true);


  // =======================================
  // COMPUTED — derivados automáticos
  // =======================================

  reservasHoyCount = computed(() => this.reservasHoy().length);

  habitacionesDisponibles = computed(
    () => this.totalHabitaciones() - this.habitacionesOcupadas()
  );

  ocupacionPorcentaje = computed(() =>
    this.totalHabitaciones() === 0
      ? 0
      : Math.round(
          (this.habitacionesOcupadas() / this.totalHabitaciones()) * 100
        )
  );

  // Tendencia ingresos vs mes anterior
  tendenciaIngresos = computed(() => {
    const ant = this.ingresosMesAnterior();
    const act = this.ingresosMes();
    if (ant === 0) return null;
    return Math.round(((act - ant) / ant) * 100);
  });

  // Tendencia reservas vs ayer
  tendenciaReservas = computed(() => {
    const ayer = this.reservasAyer();
    if (ayer === 0) return null;
    return this.reservasHoyCount() - ayer;
  });

  // Tendencia disponibles vs ayer
  tendenciaDisponibles = computed(() => {
    const ayer = this.disponiblesAyer();
    if (ayer === 0) return null;
    return this.habitacionesDisponibles() - ayer;
  });

  // Reservas agrupadas por tipo de movimiento
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

  // ¿Hay algún grupo con datos?
  hayReservas = computed(
    () =>
      this.checkins().length > 0 ||
      this.checkouts().length > 0 ||
      this.pendientes().length > 0 ||
      this.canceladas().length > 0
  );

  // Ingresos formateados con separador de miles
  ingresosMesFormateado = computed(() =>
    this.ingresosMes().toLocaleString('es-EC', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  );


  // =======================================
  // CONSTRUCTOR
  // =======================================

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
    });
  }


  // =======================================
  // INIT
  // =======================================

  ngOnInit(): void {
    this.loadStats();
    this.loadReservasHoy();
  }


  // =======================================
  // LOAD STATS
  // =======================================

  loadStats(): void {
    this.loadingStats.set(true);

    this.dashboardService.getStats().subscribe({
      next: (data: DashboardStats) => {
        this.totalHabitaciones.set(data?.totalHabitaciones ?? 0);
        this.habitacionesOcupadas.set(data?.habitacionesOcupadas ?? 0);
        this.ingresosMes.set(Number(data?.ingresosMes ?? 0));

        // Tendencias opcionales — solo si el servicio las devuelve
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


  // =======================================
  // LOAD RESERVAS
  // =======================================

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


  // =======================================
  // COLOR ESTADO (Ion chip)
  // =======================================

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


  // =======================================
  // INICIALES DE HUÉSPED
  // =======================================

  iniciales(nombre: string): string {
    if (!nombre) return '?';
    return nombre
      .split(' ')
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase();
  }


  // =======================================
  // FORMATO FECHA CORTA  "DD/MM"
  // =======================================

  formatoFechaCorta(iso: string): string {
    if (!iso) return '-';
    const parts = iso.split('-');
    if (parts.length !== 3) return iso;
    return `${parts[2]}/${parts[1]}`;
  }


  // =======================================
  // LABEL DE TENDENCIA
  // =======================================

  labelTendencia(delta: number | null, unidad = ''): string {
    if (delta === null) return '';
    const signo = delta >= 0 ? '+' : '';
    return `${signo}${delta}${unidad}`;
  }
}