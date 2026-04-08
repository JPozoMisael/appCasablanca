import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  nights = 0;
  guestsLabel = '2 adultos';

  subtotal = 0;
  taxes = 0;
  total = 0;

  adults = 2;
  children = 0;

  constructor(
    private reservasService: ReservasService,
    private huespedesService: HuespedesService
  ) {}

  ngOnInit() {
    this.initData();
  }

  initData() {
    this.room = {
      id: 1,
      name: 'Habitación Deluxe',
      image: 'assets/default-room.jpg',
      location: 'Casa Blanca',
      pricePerNight: 100
    };

    this.checkIn = '2026-04-10';
    this.checkOut = '2026-04-12';

    this.calculateTotals();
  }

  calculateTotals() {
    this.nights = 2;
    this.subtotal = this.room.pricePerNight * this.nights;
    this.taxes = this.subtotal * 0.12;
    this.total = this.subtotal + this.taxes;
  }

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

          next: () => {
            this.submitting = false;
            alert('Reserva confirmada correctamente');
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

  backToRooms() {
    window.history.back();
  }

}