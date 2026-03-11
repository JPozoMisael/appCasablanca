import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calendarOutline,
  bedOutline,
  locationOutline,
  chevronForwardOutline,
  closeCircleOutline,
  checkmarkCircleOutline,
  timeOutline,
} from 'ionicons/icons';

type EstadoReserva = 'CONFIRMADA' | 'PENDIENTE' | 'CANCELADA';

interface ReservaUI {
  id: number;
  codigo: string;
  hotel: string;
  habitacion: string;
  ubicacion: string;
  checkIn: string;   // YYYY-MM-DD
  checkOut: string;  // YYYY-MM-DD
  adultos: number;
  ninos: number;
  habitaciones: number;
  total: number;
  estado: EstadoReserva;
  creadaEn: string; // YYYY-MM-DD
}

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [CommonModule, IonContent, IonButton, IonIcon, RouterLink],
  templateUrl: './mis-reservas.page.html',
  styleUrls: ['./mis-reservas.page.scss'],
})
export class MisReservasPage implements OnInit {
  loading = true;
  reservas: ReservaUI[] = [];

  // filtros simples
  filtro: 'todas' | EstadoReserva = 'todas';

  constructor() {
    addIcons({
      calendarOutline,
      bedOutline,
      locationOutline,
      chevronForwardOutline,
      closeCircleOutline,
      checkmarkCircleOutline,
      timeOutline,
    });
  }

  ngOnInit() {
    // MOCK temporal (luego API)
    setTimeout(() => {
      this.reservas = [
        {
          id: 101,
          codigo: 'HCB-84321',
          hotel: 'Hotel Casa Blanca',
          habitacion: 'Suite con Vista al Mar',
          ubicacion: 'Salinas, Santa Elena',
          checkIn: '2026-01-20',
          checkOut: '2026-01-22',
          adultos: 2,
          ninos: 0,
          habitaciones: 1,
          total: 298,
          estado: 'CONFIRMADA',
          creadaEn: '2026-01-10',
        },
        {
          id: 102,
          codigo: 'HCB-11029',
          hotel: 'Hotel Casa Blanca',
          habitacion: 'Habitación Familiar',
          ubicacion: 'Salinas, Santa Elena',
          checkIn: '2026-02-03',
          checkOut: '2026-02-04',
          adultos: 2,
          ninos: 2,
          habitaciones: 1,
          total: 119,
          estado: 'PENDIENTE',
          creadaEn: '2026-01-12',
        },
        {
          id: 103,
          codigo: 'HCB-55902',
          hotel: 'Hotel Casa Blanca',
          habitacion: 'Habitación Doble Deluxe',
          ubicacion: 'Salinas, Santa Elena',
          checkIn: '2025-12-01',
          checkOut: '2025-12-03',
          adultos: 2,
          ninos: 0,
          habitaciones: 1,
          total: 204,
          estado: 'CANCELADA',
          creadaEn: '2025-11-20',
        },
      ];

      this.loading = false;
      console.log('[MisReservas] mock cargado:', this.reservas);
    }, 250);
  }

  get filtradas(): ReservaUI[] {
    if (this.filtro === 'todas') return this.reservas;
    return this.reservas.filter((r) => r.estado === this.filtro);
  }

  noches(r: ReservaUI): number {
    const a = new Date(r.checkIn + 'T00:00:00').getTime();
    const b = new Date(r.checkOut + 'T00:00:00').getTime();
    const diff = b - a;
    if (diff <= 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  etiquetaEstado(e: EstadoReserva) {
    if (e === 'CONFIRMADA') return 'Confirmada';
    if (e === 'PENDIENTE') return 'Pendiente';
    return 'Cancelada';
  }

  cancelar(r: ReservaUI) {
    console.log('[MisReservas] cancelar:', r.id);
    // luego: llamar API
    r.estado = 'CANCELADA';
  }

  verDetalle(r: ReservaUI) {
    console.log('[MisReservas] ver detalle:', r.id);
    // luego: navegar a /reserva-detalle/:id si lo haces
  }

  trackById(_: number, item: ReservaUI) {
    return item.id;
  }
}
