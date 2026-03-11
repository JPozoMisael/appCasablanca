import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  bedOutline,
  calendarOutline,
  peopleOutline,
  locationOutline,
  cardOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
} from 'ionicons/icons';

interface BookingGuest {
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  cedulaPasaporte: string;
  notas: string;
}

interface RoomInfo {
  id: number;
  name: string;
  location: string;
  pricePerNight: number;
  image: string;
}

@Component({
  selector: 'app-reservar',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonButton, IonIcon, RouterLink],
  templateUrl: './reservar.page.html',
  styleUrls: ['./reservar.page.scss'],
})
export class ReservarPage {
  // Query params
  roomId = 0;
  checkIn = '';
  checkOut = '';
  adults = 2;
  children = 0;
  rooms = 1;
  withPets = 0;

  // Datos del alojamiento (mock por ahora)
  room: RoomInfo | null = null;

  // Form
  guest: BookingGuest = {
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    cedulaPasaporte: '',
    notas: '',
  };

  acceptingTerms = false;
  submitting = false;

  // Mapa de habitaciones de ejemplo (igual que en /habitaciones)
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

  constructor(private route: ActivatedRoute, private router: Router) {
    addIcons({
      bedOutline,
      calendarOutline,
      peopleOutline,
      locationOutline,
      cardOutline,
      checkmarkCircleOutline,
      alertCircleOutline,
    });

    this.route.queryParamMap.subscribe((qp) => {
      this.roomId = this.toNum(qp.get('roomId'), 0);
      this.checkIn = qp.get('checkIn') ?? '';
      this.checkOut = qp.get('checkOut') ?? '';
      this.adults = this.toNum(qp.get('adults'), 2);
      this.children = this.toNum(qp.get('children'), 0);
      this.rooms = this.toNum(qp.get('rooms'), 1);
      this.withPets = this.toNum(qp.get('withPets'), 0);

      this.room = this.roomMap.find((r) => r.id === this.roomId) ?? this.roomMap[0] ?? null;
    });
  }

  // Helpers
  get nights(): number {
    if (!this.checkIn || !this.checkOut) return 0;
    const a = new Date(this.checkIn + 'T00:00:00').getTime();
    const b = new Date(this.checkOut + 'T00:00:00').getTime();
    const diff = b - a;
    if (diff <= 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  get guestsLabel(): string {
    const a = this.adults;
    const c = this.children;
    const r = this.rooms;
    let t = `${a} adulto${a !== 1 ? 's' : ''}`;
    if (c > 0) t += ` · ${c} niño${c !== 1 ? 's' : ''}`;
    t += ` · ${r} habitación${r !== 1 ? 'es' : ''}`;
    if (this.withPets) t += ` · Mascotas`;
    return t;
  }

  get subtotal(): number {
    if (!this.room) return 0;
    const n = this.nights || 1;
    return this.room.pricePerNight * n;
  }

  // Puedes ajustar tasas/impuestos luego
  get taxes(): number {
    return Math.round(this.subtotal * 0.12 * 100) / 100; // 12% ejemplo
  }

  get total(): number {
    return Math.round((this.subtotal + this.taxes) * 100) / 100;
  }

  validate(): string | null {
    if (!this.room) return 'No se pudo cargar la habitación.';
    if (!this.checkIn || !this.checkOut) return 'Selecciona fechas válidas.';
    if (this.nights <= 0) return 'La fecha de salida debe ser mayor a la de entrada.';

    if (!this.guest.nombres.trim()) return 'Ingresa tus nombres.';
    if (!this.guest.apellidos.trim()) return 'Ingresa tus apellidos.';
    if (!this.guest.email.trim()) return 'Ingresa tu email.';
    if (!this.guest.telefono.trim()) return 'Ingresa tu teléfono.';
    if (!this.acceptingTerms) return 'Debes aceptar los términos para continuar.';
    return null;
  }

  async confirmBooking() {
    const err = this.validate();
    if (err) {
      alert(err);
      return;
    }

    this.submitting = true;

    // ✅ Aquí luego conectamos tu API:
    // POST /api/v1/reservas (o el endpoint que definamos)
    // con: roomId, checkIn, checkOut, adults, children, rooms, guest...
    // Por ahora simulamos:
    setTimeout(() => {
      this.submitting = false;
      alert('✅ Reserva enviada (simulado). Luego lo conectamos a la API.');
      this.router.navigate(['/inicio']);
    }, 600);
  }

  backToRooms() {
    this.router.navigate(['/habitaciones'], {
      queryParams: {
        checkIn: this.checkIn,
        checkOut: this.checkOut,
        adults: this.adults,
        children: this.children,
        rooms: this.rooms,
        withPets: this.withPets,
      },
    });
  }

  private toNum(v: string | null, fallback: number): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }
}
