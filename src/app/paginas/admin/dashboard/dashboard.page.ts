import {
  Component,
  computed,
  signal,
  OnInit
} from '@angular/core';

import { CommonModule }
  from '@angular/common';

import { RouterModule }
  from '@angular/router';

import {
  DashboardService,
  ReservaHoy
} from '../../../core/services/dashboard.service';

import {

  IonIcon,

  IonButton,

  IonChip,

  IonHeader,

  IonCard,

  IonToolbar

} from '@ionic/angular/standalone';

import { addIcons }
  from 'ionicons';

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


// =========================================
// TIPOS
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

    IonChip
  ],

  templateUrl:
    './dashboard.page.html',

  styleUrls:
    ['./dashboard.page.scss'],
})

export class DashboardPage
  implements OnInit {


  // =======================================
  // SIGNALS
  // =======================================

  totalHabitaciones =
    signal(0);

  habitacionesOcupadas =
    signal(0);

  ingresosMes =
    signal(0);

  reservasHoy =
    signal<ReservaHoy[]>([]);


  // =======================================
  // COMPUTED
  // =======================================

  reservasHoyCount =
    computed(() =>
      this.reservasHoy().length
    );


  habitacionesDisponibles =
    computed(() =>

      this.totalHabitaciones()

      -

      this.habitacionesOcupadas()
    );


  ocupacionPorcentaje =
    computed(() =>

      this.totalHabitaciones() === 0

        ? 0

        : Math.round(

            (

              this.habitacionesOcupadas()

              /

              this.totalHabitaciones()

            ) * 100
          )
    );


  // =======================================
  // CONSTRUCTOR
  // =======================================

  constructor(

    private dashboardService:
      DashboardService

  ) {

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

    this.dashboardService

      .getStats()

      .subscribe({

        next: (data: any) => {


          // ===============================
          // HABITACIONES
          // ===============================

          const total =

            data?.habitaciones?.total ?? 0;


          const disponibles =

            data?.habitaciones?.disponibles ?? 0;


          const ocupadas =
            total - disponibles;


          this.totalHabitaciones.set(
            total
          );


          this.habitacionesOcupadas.set(
            ocupadas
          );


          // ===============================
          // INGRESOS
          // ===============================

          this.ingresosMes.set(

            Number(
              data?.ingresosTotales ?? 0
            )
          );
        },


        error: (err) => {

          console.error(

            'Error dashboard stats:',

            err
          );


          // =============================
          // FALLBACK SEGURO
          // =============================

          this.totalHabitaciones.set(0);

          this.habitacionesOcupadas.set(0);

          this.ingresosMes.set(0);
        }
      });
  }


  // =======================================
  // LOAD RESERVAS
  // =======================================

  loadReservasHoy(): void {

    this.dashboardService

      .getReservasHoy()

      .subscribe({

        next: (
          reservas: ReservaHoy[]
        ) => {

          this.reservasHoy.set(

            Array.isArray(reservas)

              ? reservas

              : []
          );
        },


        error: (err) => {

          console.error(

            'Error reservas hoy:',

            err
          );


          this.reservasHoy.set([]);
        }
      });
  }


  // =======================================
  // COLOR ESTADO
  // =======================================

  colorEstado(
    estado: string
  ): string {

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


  // =======================================
  // FECHA CORTA
  // =======================================

  formatoFechaCorta(
    iso: string
  ): string {

    if (!iso) {
      return '-';
    }


    const parts =
      iso.split('-');


    if (parts.length !== 3) {
      return iso;
    }


    return `${parts[2]}/${parts[1]}`;
  }

}