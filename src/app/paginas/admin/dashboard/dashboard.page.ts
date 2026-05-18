import { Component, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { DashboardService, ReservaHoy } from '../../../core/services/dashboard.service';

import {
  IonIcon,
  IonButton,
  IonChip,
  IonHeader,
  IonCard,
  IonToolbar
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
    IonChip
  ],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  // ===== Signals principales =====
  totalHabitaciones = signal(0);
  habitacionesOcupadas = signal(0);
  ingresosMes = signal(0);

  reservasHoy = signal<ReservaHoy[]>([]);

  // ===== KPIs calculados =====
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
    });

  }

  ngOnInit(): void {

  // =====================================
  // STATS
  // =====================================

  this.dashboardService
    .getStats()

    .subscribe({

      next: (response: any) => {

        const data =
          response?.data || {};


        this.totalHabitaciones.set(
          data?.habitaciones?.total ?? 0
        );


        this.habitacionesOcupadas.set(

          (data?.habitaciones?.total ?? 0)

          -

          (data?.habitaciones?.disponibles ?? 0)
        );


        this.ingresosMes.set(
          data?.ingresosTotales ?? 0
        );
      },


      error: (err) => {

        console.error(
          'Error dashboard stats:',
          err
        );
      }
    });


  // =====================================
  // RESERVAS HOY
  // =====================================

  this.dashboardService
    .getReservasHoy()

    .subscribe({

      next: (response: any) => {

        this.reservasHoy.set(
          response?.data ?? []
        );
      },


      error: (err) => {

        console.error(
          'Error reservas hoy:',
          err
        );
      }
    });
}

  colorEstado(estado: string): string {

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

  formatoFechaCorta(iso: string): string {

    const parts = iso.split('-');

    if (parts.length !== 3) return iso;

    return `${parts[2]}/${parts[1]}`;

  }

}