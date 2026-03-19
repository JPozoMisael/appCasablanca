import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline } from 'ionicons/icons';

interface RoomInfo {
  id: number;
  name: string;
  location: string;
  pricePerNight: number;
  image: string;
}

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
  rooms = 1;
  withPets = 0;

  guestName = '';
  guestEmail = '';
  guestPhone = '';

  roomId = 0;
  room: RoomInfo | null = null;

  // Mock temporal
  private roomMap: RoomInfo[] = [
    {
      id: 1,
      name: 'Habitación Doble Deluxe',
      location: 'Malecón de Salinas · Frente al mar',
      pricePerNight: 102,
      image: 'assets/img/1.PNG',
    },
    {
      id: 2,
      name: 'Habitación Familiar',
      location: 'Zona céntrica · A 5 min de la playa',
      pricePerNight: 119,
      image: 'assets/img/4.PNG',
    },
    {
      id: 3,
      name: 'Suite con Vista al Mar',
      location: 'Malecón · Vista panorámica',
      pricePerNight: 149,
      image: 'assets/img/9.PNG',
    },
  ];

  constructor(private route: ActivatedRoute) {

    addIcons({ checkmarkCircleOutline });

    this.route.queryParamMap.subscribe((qp) => {

      this.roomId = Number(qp.get('roomId') ?? 0);
      this.checkIn = qp.get('checkIn') ?? '';
      this.checkOut = qp.get('checkOut') ?? '';

      this.adults = Number(qp.get('adults') ?? 2);
      this.children = Number(qp.get('children') ?? 0);
      this.rooms = Number(qp.get('rooms') ?? 1);
      this.withPets = Number(qp.get('withPets') ?? 0);

      this.guestName = qp.get('guestName') ?? '';
      this.guestEmail = qp.get('guestEmail') ?? '';
      this.guestPhone = qp.get('guestPhone') ?? '';

      this.reservationCode = qp.get('code') ?? this.generateCode();

      this.room =
        this.roomMap.find((r) => r.id === this.roomId) ??
        this.roomMap[0] ??
        null;
    });
  }

  get nights(): number {
    if (!this.checkIn || !this.checkOut) return 0;
    const a = new Date(this.checkIn).getTime();
    const b = new Date(this.checkOut).getTime();
    const diff = b - a;
    return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
  }

  get guestsLabel(): string {
    let t = `${this.adults} adulto${this.adults !== 1 ? 's' : ''}`;
    if (this.children > 0) t += ` · ${this.children} niño${this.children !== 1 ? 's' : ''}`;
    t += ` · ${this.rooms} habitación${this.rooms !== 1 ? 'es' : ''}`;
    if (this.withPets) t += ' · Mascotas';
    return t;
  }

  get total(): number {
    if (!this.room) return 0;
    const n = this.nights || 1;
    return this.room.pricePerNight * n;
  }

  private generateCode(): string {
    return 'CB-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}
