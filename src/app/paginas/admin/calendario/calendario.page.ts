import { Component, computed, signal } from '@angular/core';
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
} from 'ionicons/icons';

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

export class CalendarioPage {

  // =====================================================
  // STATE
  // =====================================================

  viewDate =
    signal<Date>(
      this.startOfMonth(
        new Date()
      )
    );

  selectedReservaId =
    signal<number | null>(null);


  // =====================================================
  // HABITACIONES
  // =====================================================

  habitaciones =
    signal<HabitacionRow[]>([

      {
        id: 1,
        codigo: '101',
        tipo: 'Simple',
        piso: '1'
      },

      {
        id: 2,
        codigo: '105',
        tipo: 'Simple',
        piso: '1'
      },

      {
        id: 3,
        codigo: '204',
        tipo: 'Doble',
        piso: '2'
      },

      {
        id: 4,
        codigo: '210',
        tipo: 'Doble',
        piso: '2'
      },

      {
        id: 5,
        codigo: '301',
        tipo: 'Suite',
        piso: '3'
      },

      {
        id: 6,
        codigo: '303',
        tipo: 'Suite',
        piso: '3'
      },
    ]);


  // =====================================================
  // RESERVAS
  // =====================================================

  reservas =
    signal<Reserva[]>([

      {
        id: 2001,
        huesped: 'Carlos Ruiz',
        habitacionId: 3,
        checkIn: '2026-01-14',
        checkOut: '2026-01-16',
        estado: 'CONFIRMADA',
        total: 120,
      },

      {
        id: 2002,
        huesped: 'María Paredes',
        habitacionId: 5,
        checkIn: '2026-01-14',
        checkOut: '2026-01-15',
        estado: 'CHECKIN',
        total: 95,
      },

      {
        id: 2003,
        huesped: 'Kevin Andrade',
        habitacionId: 2,
        checkIn: '2026-01-18',
        checkOut: '2026-01-21',
        estado: 'PENDIENTE',
        total: 150,
      },

      {
        id: 2004,
        huesped: 'Ana Cedeño',
        habitacionId: 4,
        checkIn: '2026-01-20',
        checkOut: '2026-01-22',
        estado: 'CONFIRMADA',
        total: 180,
      },

      {
        id: 2005,
        huesped: 'Jorge Vera',
        habitacionId: 6,
        checkIn: '2026-01-22',
        checkOut: '2026-01-23',
        estado: 'CANCELADA',
        total: 0,
      },
    ]);


  // =====================================================
  // COMPUTED
  // =====================================================

  monthLabel = computed(() =>
    this.formatMonthYear(
      this.viewDate()
    )
  );


  days = computed(() => {

    const start =
      this.startOfMonth(
        this.viewDate()
      );

    const daysInMonth =
      this.daysInMonth(start);

    const out: {
      day: number;
      iso: string;
      isToday: boolean;
    }[] = [];

    const todayIso =
      this.toISO(new Date());

    for (
      let d = 1;
      d <= daysInMonth;
      d++
    ) {

      const date =
        new Date(
          start.getFullYear(),
          start.getMonth(),
          d
        );

      const iso =
        this.toISO(date);

      out.push({

        day: d,

        iso,

        isToday:
          iso === todayIso
      });
    }

    return out;
  });


  daysCount =
    computed(() =>
      this.days().length
    );


  gridTemplate =
    computed(() =>

      `240px repeat(${this.daysCount()}, minmax(28px, 1fr))`
    );


  reservasHoyCount =
    computed(() =>
      this.reservas().length
    );


  // =====================================================
  // OPTIMIZED BARS MAP
  // =====================================================

  barsMap = computed(() => {

    console.log(
      '[CALENDARIO] Recalculando barsMap'
    );

    const monthStart =
      this.startOfMonth(
        this.viewDate()
      );

    const monthEnd =
      this.endOfMonth(
        this.viewDate()
      );

    const map =
      new Map<number, Bar[]>();


    for (
      const room of this.habitaciones()
    ) {

      const bars =

        this.reservas()

          .filter(

            (r) =>

              r.habitacionId === room.id &&

              r.estado !== 'CANCELADA'
          )

          .map((r) => {

            const inD =
              this.parseISO(
                r.checkIn
              );

            const outD =
              this.parseISO(
                r.checkOut
              );

            const occupyEnd =
              new Date(outD);

            occupyEnd.setDate(
              occupyEnd.getDate() - 1
            );

            const clippedLeft =
              inD < monthStart;

            const clippedRight =
              occupyEnd > monthEnd;

            const start =
              clippedLeft
                ? monthStart
                : inD;

            const end =
              clippedRight
                ? monthEnd
                : occupyEnd;

            const colStart =
              start.getDate();

            const colEnd =
              end.getDate() + 1;

            return {

              reserva: r,

              colStart,

              colEnd,

              clippedLeft,

              clippedRight
            };
          })

          .sort(

            (a, b) =>

              a.colStart - b.colStart
          );

      map.set(
        room.id,
        bars
      );
    }

    return map;
  });


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor() {

    addIcons({

      chevronBackOutline,

      chevronForwardOutline,

      todayOutline,

      calendarOutline,

      addCircleOutline,
    });
  }


  // =====================================================
  // NAVIGATION
  // =====================================================

  prevMonth() {

    const d =
      new Date(
        this.viewDate()
      );

    d.setMonth(
      d.getMonth() - 1
    );

    this.viewDate.set(
      this.startOfMonth(d)
    );

    this.selectedReservaId.set(null);
  }


  nextMonth() {

    const d =
      new Date(
        this.viewDate()
      );

    d.setMonth(
      d.getMonth() + 1
    );

    this.viewDate.set(
      this.startOfMonth(d)
    );

    this.selectedReservaId.set(null);
  }


  goToday() {

    const today =
      new Date();

    this.viewDate.set(
      this.startOfMonth(today)
    );

    this.selectedReservaId.set(null);
  }


  // =====================================================
  // UI
  // =====================================================

  selectReserva(id: number) {

    this.selectedReservaId.set(id);
  }


  isSelected(id: number): boolean {

    return (
      this.selectedReservaId() === id
    );
  }


  colorEstado(
    estado: EstadoReserva
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


  // =====================================================
  // HELPERS
  // =====================================================

  private toISO(d: Date): string {

    const y =
      d.getFullYear();

    const m =
      String(
        d.getMonth() + 1
      ).padStart(2, '0');

    const day =
      String(
        d.getDate()
      ).padStart(2, '0');

    return `${y}-${m}-${day}`;
  }


  private parseISO(
    iso: string
  ): Date {

    const [
      y,
      m,
      d
    ] = iso
      .split('-')
      .map(Number);

    return new Date(
      y,
      (m ?? 1) - 1,
      d ?? 1
    );
  }


  private startOfMonth(
    d: Date
  ): Date {

    return new Date(
      d.getFullYear(),
      d.getMonth(),
      1
    );
  }


  private endOfMonth(
    d: Date
  ): Date {

    return new Date(
      d.getFullYear(),
      d.getMonth() + 1,
      0
    );
  }


  private daysInMonth(
    d: Date
  ): number {

    return new Date(
      d.getFullYear(),
      d.getMonth() + 1,
      0
    ).getDate();
  }


  private formatMonthYear(
    d: Date
  ): string {

    const months = [

      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',

      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];

    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  }

}