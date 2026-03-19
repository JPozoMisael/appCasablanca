import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonContent, IonButton } from '@ionic/angular/standalone';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface HabitacionDetalle {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  capacidad: string;
  servicios: string[];
  lat: number;
  lng: number;
  imagen: string;
}

@Component({
  selector: 'app-habitacion-detalle',
  standalone: true,
  imports: [CommonModule, IonContent, IonButton, RouterLink],
  templateUrl: './habitacion-detalle.page.html',
  styleUrls: ['./habitacion-detalle.page.scss'],
})
export class HabitacionDetallePage implements OnInit {

  roomId = 0;

  checkIn = '';
  checkOut = '';
  adults = 2;
  children = 0;
  rooms = 1;
  withPets = 0;

  habitacion: HabitacionDetalle | null = null;

  mapUrlSafe: SafeResourceUrl | null = null;

  // ===== MOCK (luego API) =====
  private mock: HabitacionDetalle[] = [
    {
      id: 1,
      nombre: 'Habitación Doble Deluxe',
      descripcion:
        'Habitación cómoda con acabados modernos, ideal para parejas.',
      precio: 102,
      capacidad: '2 adultos · 1 cama queen',
      servicios: ['Wi-Fi', 'Aire acondicionado', 'TV', 'Baño privado'],
      lat: -2.2149,
      lng: -80.951,
      imagen: 'assets/img/1.PNG',
    },
    {
      id: 2,
      nombre: 'Habitación Familiar',
      descripcion:
        'Espaciosa y confortable, perfecta para familias.',
      precio: 119,
      capacidad: '4 adultos · 2 camas',
      servicios: ['Wi-Fi', 'Estacionamiento', 'TV', 'Baño privado'],
      lat: -2.2149,
      lng: -80.951,
      imagen: 'assets/img/4.PNG',
    },
    {
      id: 3,
      nombre: 'Suite con Vista al Mar',
      descripcion:
        'Suite premium con vista panorámica al océano.',
      precio: 149,
      capacidad: '2 adultos · 1 cama king',
      servicios: ['Wi-Fi', 'Jacuzzi', 'Restaurante', 'TV'],
      lat: -2.2149,
      lng: -80.951,
      imagen: 'assets/img/9.PNG',
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {

    // ===== PARAM :id =====
    this.route.paramMap.subscribe((pm) => {
      this.roomId = Number(pm.get('id'));

      this.habitacion =
        this.mock.find((x) => x.id === this.roomId) ?? null;

      if (!this.habitacion) return;

      const url = `https://www.google.com/maps?q=${this.habitacion.lat},${this.habitacion.lng}&output=embed`;
      this.mapUrlSafe =
        this.sanitizer.bypassSecurityTrustResourceUrl(url);
    });

    // ===== QUERY PARAMS =====
    this.route.queryParamMap.subscribe((qp) => {
      this.checkIn = qp.get('checkIn') ?? '';
      this.checkOut = qp.get('checkOut') ?? '';
      this.adults = this.toNum(qp.get('adults'), 2);
      this.children = this.toNum(qp.get('children'), 0);
      this.rooms = this.toNum(qp.get('rooms'), 1);
      this.withPets = this.toNum(qp.get('withPets'), 0);
    });
  }

  // ===== CALCULOS =====

  get nights(): number {
    if (!this.checkIn || !this.checkOut) return 0;

    const a = new Date(this.checkIn + 'T00:00:00').getTime();
    const b = new Date(this.checkOut + 'T00:00:00').getTime();

    const diff = b - a;
    if (diff <= 0) return 0;

    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  get total(): number {
    if (!this.habitacion) return 0;
    const n = this.nights || 1;
    return this.habitacion.precio * n;
  }

  // ===== RESERVA =====

  reservar() {
    if (!this.habitacion) return;

    const queryParams = {
      roomId: this.habitacion.id,
      checkIn: this.checkIn,
      checkOut: this.checkOut,
      adults: this.adults,
      children: this.children,
      rooms: this.rooms,
      withPets: this.withPets,
    };

    this.router.navigate(['/reservar'], { queryParams });
  }

  // ===== UTILS =====

  private toNum(v: string | null, fallback: number): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }
}
