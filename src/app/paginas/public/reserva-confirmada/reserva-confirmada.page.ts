import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-reserva-confirmada',
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon, RouterLink],
  templateUrl: './reserva-confirmada.page.html',
  styleUrls: ['./reserva-confirmada.page.scss'],
})
export class ReservaConfirmadaPage {

  reservationCode = '';

  checkIn = '';
  checkOut = '';

  adults = 2;
  children = 0;

  guestName = '';
  guestEmail = '';
  guestPhone = '';

  roomId = 0;
  room: any = null;

  total = 0;

  loading = true;

  constructor(private route: ActivatedRoute) {

    addIcons({ checkmarkCircleOutline });

    this.route.queryParamMap.subscribe((qp) => {

      // ================= DATOS =================
      this.roomId = Number(qp.get('roomId') ?? 0);

      this.checkIn = qp.get('checkIn') ?? '';
      this.checkOut = qp.get('checkOut') ?? '';

      this.adults = Number(qp.get('adults') ?? 2);
      this.children = Number(qp.get('children') ?? 0);

      this.guestName = qp.get('guestName') ?? '';
      this.guestEmail = qp.get('guestEmail') ?? '';
      this.guestPhone = qp.get('guestPhone') ?? '';

      this.total = Number(qp.get('total') ?? 0);

      this.reservationCode =
        qp.get('code') ?? this.generateCode();

      // 🔥 MOCK CONTROLADO (solo visual)
      this.room = this.getRoomFallback(this.roomId);

      this.loading = false;
    });
  }

  // ================= NOCHES =================
  get nights(): number {

    if (!this.checkIn || !this.checkOut) return 0;

    const a = new Date(this.checkIn).getTime();
    const b = new Date(this.checkOut).getTime();

    const diff = b - a;

    return diff > 0
      ? Math.ceil(diff / (1000 * 60 * 60 * 24))
      : 1;
  }

  // ================= LABEL =================
  get guestsLabel(): string {

    let t = `${this.adults} adulto${this.adults !== 1 ? 's' : ''}`;

    if (this.children > 0) {
      t += ` · ${this.children} niño${this.children !== 1 ? 's' : ''}`;
    }

    return t;
  }

  // ================= FALLBACK VISUAL =================
  private getRoomFallback(id: number) {

    const rooms = [
      {
        id: 1,
        name: 'Habitación Deluxe',
        location: 'Casa Blanca · Salinas',
        image: 'assets/img/1.PNG'
      },
      {
        id: 2,
        name: 'Suite Vista al Mar',
        location: 'Malecón · Frente al mar',
        image: 'assets/img/4.PNG'
      },
      {
        id: 3,
        name: 'Habitación Familiar',
        location: 'Zona céntrica',
        image: 'assets/img/9.PNG'
      }
    ];

    return rooms.find(r => r.id === id) || rooms[0];
  }

  // ================= CODIGO =================
  private generateCode(): string {
    return 'CB-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }

}