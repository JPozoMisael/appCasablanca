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

  // esto es lo que usarás en el iframe
  mapUrlSafe: SafeResourceUrl | null = null;

  private mock: HabitacionDetalle[] = [
    {
      id: 1,
      nombre: 'Habitación Doble Deluxe',
      descripcion:
        'Habitación cómoda con acabados modernos, ideal para parejas. Incluye Wi-Fi, aire acondicionado y TV por cable.',
      precio: 102,
      capacidad: '2 adultos · 1 cama queen',
      servicios: ['Wi-Fi', 'Aire acondicionado', 'TV', 'Baño privado', 'Desayuno'],
      lat: -2.2149,
      lng: -80.951,
      imagen: 'assets/img/1.PNG',
    },
    {
      id: 2,
      nombre: 'Habitación Familiar',
      descripcion:
        'Espaciosa, pensada para familia. Excelente ubicación y comodidad para una estancia tranquila.',
      precio: 119,
      capacidad: '4 adultos · 2 camas',
      servicios: ['Wi-Fi', 'Aire acondicionado', 'Estacionamiento', 'TV', 'Baño privado'],
      lat: -2.2149,
      lng: -80.951,
      imagen: 'assets/img/4.PNG',
    },
    {
      id: 3,
      nombre: 'Suite con Vista al Mar',
      descripcion:
        'Suite premium con vista panorámica al mar. Perfecta para una experiencia más exclusiva.',
      precio: 149,
      capacidad: '2 adultos · 1 cama king · Vista al mar',
      servicios: ['Wi-Fi', 'Jacuzzi', 'Restaurante', 'TV', 'Baño privado'],
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
    // 1) leer :id y cargar habitación
    this.route.paramMap.subscribe((pm) => {
      const idStr = pm.get('id');
      this.roomId = Number(idStr);

      console.log('[HabitacionDetalle] param id:', idStr, '->', this.roomId);

      this.habitacion = this.mock.find((x) => x.id === this.roomId) ?? null;
      console.log('[HabitacionDetalle] habitacion cargada:', this.habitacion);

      if (!this.habitacion) {
        console.warn('[HabitacionDetalle] No se encontró habitación para id:', this.roomId);
        this.mapUrlSafe = null;
        return;
      }

      //  2) construir mapa seguro (arregla NG0904)
      const url = `https://www.google.com/maps?q=${this.habitacion.lat},${this.habitacion.lng}&output=embed`;
      this.mapUrlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(url);

      console.log('[HabitacionDetalle] map url:', url);
    });

    // 3) leer query params
    this.route.queryParamMap.subscribe((qp) => {
      this.checkIn = qp.get('checkIn') ?? '';
      this.checkOut = qp.get('checkOut') ?? '';
      this.adults = this.toNum(qp.get('adults'), 2);
      this.children = this.toNum(qp.get('children'), 0);
      this.rooms = this.toNum(qp.get('rooms'), 1);
      this.withPets = this.toNum(qp.get('withPets'), 0);

      console.log('[HabitacionDetalle] queryParams:', {
        checkIn: this.checkIn,
        checkOut: this.checkOut,
        adults: this.adults,
        children: this.children,
        rooms: this.rooms,
        withPets: this.withPets,
      });
    });
  }

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

    console.log('[HabitacionDetalle] Reservar -> /reservar con:', queryParams);

    // OJO: /reservar tiene authGuard, si no estás logueado te va a redirigir
    this.router.navigate(['/reservar'], { queryParams });
  }

  private toNum(v: string | null, fallback: number): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }
}
