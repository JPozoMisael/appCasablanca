import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ReservasService } from '@app/core/services/reservas.service';
import { HuespedesService } from '@app/core/services/huespedes.service';

@Component({
  selector: 'app-reservar',
  templateUrl: './reservar.page.html',
  styleUrls: ['./reservar.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ReservarPage implements OnInit {

  room: any = null;

  guest = {
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    cedulaPasaporte: '',
    notas: ''
  };

  acceptingTerms = false;
  submitting = false;

  checkIn = '';
  checkOut = '';

  adults = 2;
  children = 0;

  nights = 0;
  guestsLabel = '';

  subtotal = 0;
  taxes = 0;
  total = 0;

  constructor(
    private reservasService: ReservasService,
    private huespedesService: HuespedesService,
    private router: Router
  ) {}

  // ================= INIT =================
  ngOnInit() {
    this.initData();
  }

  // ================= DATA INICIAL =================
  initData() {

    // 🔥 luego esto vendrá del backend / query params
    this.room = {
      id: 1,
      name: 'Habitación Deluxe',
      image: 'assets/default-room.jpg',
      location: 'Casa Blanca',
      pricePerNight: 100
    };

    this.checkIn = '2026-04-10';
    this.checkOut = '2026-04-12';

    this.updateGuestsLabel();
    this.calculateTotals();
  }

  // ================= LABEL =================
  updateGuestsLabel() {

    let t = `${this.adults} adulto${this.adults !== 1 ? 's' : ''}`;

    if (this.children > 0) {
      t += ` · ${this.children} niño${this.children !== 1 ? 's' : ''}`;
    }

    this.guestsLabel = t;
  }

  // ================= CALCULOS =================
  calculateTotals() {

    if (!this.checkIn || !this.checkOut) return;

    const a = new Date(this.checkIn).getTime();
    const b = new Date(this.checkOut).getTime();

    const diff = b - a;

    this.nights = diff > 0
      ? Math.ceil(diff / (1000 * 60 * 60 * 24))
      : 1;

    this.subtotal = this.room.pricePerNight * this.nights;
    this.taxes = this.subtotal * 0.12;
    this.total = this.subtotal + this.taxes;
  }

  // ================= CONFIRM =================
  confirmBooking() {

    if (!this.acceptingTerms) {
      alert('Debes aceptar los términos');
      return;
    }

    if (!this.guest.nombres || !this.guest.email) {
      alert('Completa los datos obligatorios');
      return;
    }

    this.submitting = true;

    const clientePayload = {
      nombres: this.guest.nombres,
      apellidos: this.guest.apellidos,
      email: this.guest.email,
      telefono: this.guest.telefono,
      documento: this.guest.cedulaPasaporte
    };

    this.huespedesService.create(clientePayload).subscribe({

      next: (cliente) => {

        // 🔥 FIX CRÍTICO
        if (!cliente) {
          console.error('Cliente null');
          this.submitting = false;
          alert('Error al crear huésped');
          return;
        }

        const reservaPayload = {
          huespedId: cliente.id,
          habitacionId: this.room.id,
          checkIn: this.checkIn,
          checkOut: this.checkOut,
          adultos: this.adults,
          ninos: this.children,
          total: this.total
        };

        this.reservasService.create(reservaPayload).subscribe({

          next: (reserva) => {

            if (!reserva) {
              this.submitting = false;
              alert('Error al crear la reserva');
              return;
            }

            this.submitting = false;

            // 🔥 REDIRECCIÓN PRO
            this.router.navigate(['/reserva-confirmada'], {
              queryParams: {
                roomId: this.room.id,
                checkIn: this.checkIn,
                checkOut: this.checkOut,
                adults: this.adults,
                children: this.children,
                guestName: this.guest.nombres,
                guestEmail: this.guest.email,
                guestPhone: this.guest.telefono,
                total: this.total,
                code: 'CB-' + Math.random().toString(36).substring(2, 8).toUpperCase()
              }
            });

          },

          error: (err) => {
            console.error(err);
            this.submitting = false;
            alert('Error al crear la reserva');
          }

        });

      },

      error: (err) => {
        console.error(err);
        this.submitting = false;
        alert('Error al crear huésped');
      }

    });
  }

  // ================= NAV =================
  backToRooms() {
    window.history.back();
  }

}