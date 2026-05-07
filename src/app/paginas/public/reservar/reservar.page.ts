import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Router, ActivatedRoute } from '@angular/router';

import { ReservasService } from '@app/core/services/reservas.service';
import { HuespedesService } from '@app/core/services/huespedes.service';
import { HabitacionesService } from '@app/core/services/habitaciones.service';

@Component({
  selector: 'app-reservar',
  templateUrl: './reservar.page.html',
  styleUrls: ['./reservar.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ]
})
export class ReservarPage implements OnInit {

  // ================= ROOM =================
  room: any = null;

  // ================= GUEST =================
  guest = {
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    cedulaPasaporte: '',
    notas: ''
  };

  // ================= STATE =================
  acceptingTerms = false;
  submitting = false;

  // ================= SEARCH =================
  checkIn = '';
  checkOut = '';

  adults = 2;
  children = 0;

  // ================= TOTALS =================
  nights = 0;
  guestsLabel = '';

  subtotal = 0;
  taxes = 0;
  total = 0;

  constructor(
    private reservasService: ReservasService,
    private huespedesService: HuespedesService,
    private habitacionesService: HabitacionesService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  // ================= INIT =================
  ngOnInit() {

    this.route.queryParamMap.subscribe(params => {

      const roomId = Number(params.get('roomId'));

      this.checkIn = params.get('checkIn') || '';
      this.checkOut = params.get('checkOut') || '';

      this.adults = Number(params.get('adults') || 2);
      this.children = Number(params.get('children') || 0);

      if (!roomId) {
        console.error('roomId inválido');
        return;
      }

      this.habitacionesService.getById(roomId).subscribe({

        next: (h: any) => {

          if (!h) return;

          this.room = {
            id: h.id,
            name: h.tipo || `Habitación ${h.numero}`,
            image:
              h.imagenUrl ||
              'assets/default-room.jpg',

            location: 'Casa Blanca',

            pricePerNight:
              h.precioNoche ||
              h.precio ||
              0
          };

          this.updateGuestsLabel();
          this.calculateTotals();
        },

        error: (err: any) => {
          console.error('ERROR ROOM:', err);
        }

      });

    });

  }

  // ================= LABEL =================
  updateGuestsLabel() {

    let t =
      `${this.adults} adulto${this.adults !== 1 ? 's' : ''}`;

    if (this.children > 0) {
      t +=
        ` · ${this.children} niño${this.children !== 1 ? 's' : ''}`;
    }

    this.guestsLabel = t;
  }

  // ================= CALCULOS =================
  calculateTotals() {

    if (!this.checkIn || !this.checkOut || !this.room) {
      return;
    }

    const a = new Date(this.checkIn).getTime();
    const b = new Date(this.checkOut).getTime();

    const diff = b - a;

    this.nights =
      diff > 0
        ? Math.ceil(diff / (1000 * 60 * 60 * 24))
        : 1;

    this.subtotal =
      this.room.pricePerNight * this.nights;

    this.taxes =
      this.subtotal * 0.12;

    this.total =
      this.subtotal + this.taxes;
  }

  // ================= CONFIRM =================
  confirmBooking() {

    if (this.submitting) return;

    if (!this.acceptingTerms) {
      alert('Debes aceptar los términos');
      return;
    }

    if (
      !this.guest.nombres ||
      !this.guest.email
    ) {
      alert('Completa los datos obligatorios');
      return;
    }

    if (!this.room) {
      alert('Habitación inválida');
      return;
    }

    this.submitting = true;

    // ================= CLIENTE =================
    const clientePayload = {

      nombres: this.guest.nombres,

      apellidos: this.guest.apellidos,

      email: this.guest.email,

      telefono: this.guest.telefono,

      documento: this.guest.cedulaPasaporte
    };

    this.huespedesService
      .create(clientePayload)
      .subscribe({

        next: (cliente: any) => {

          if (!cliente) {

            console.error('Cliente null');

            this.submitting = false;

            alert('Error al crear huésped');

            return;
          }

          // ================= RESERVA =================
          const reservaPayload = {

            huespedId: cliente.id,

            habitacionId: this.room.id,

            checkIn: this.checkIn,

            checkOut: this.checkOut,

            adultos: this.adults,

            ninos: this.children,

            total: this.total
          };

          this.reservasService
            .create(reservaPayload)
            .subscribe({

              next: (reserva: any) => {

                if (!reserva) {

                  this.submitting = false;

                  alert('Error al crear la reserva');

                  return;
                }

                this.submitting = false;

                // ================= REDIRECT =================
                this.router.navigate(
                  ['/reserva-confirmada'],
                  {
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

                      code:
                        'CB-' +
                        Math.random()
                          .toString(36)
                          .substring(2, 8)
                          .toUpperCase()
                    }
                  }
                );

              },

              error: (err: any) => {

                console.error(err);

                this.submitting = false;

                alert('Error al crear la reserva');
              }

            });

        },

        error: (err: any) => {

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