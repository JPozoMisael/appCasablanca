import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { FormsModule } from '@angular/forms';
import {
  locationOutline,
  optionsOutline,
  funnelOutline,
  bedOutline,
  wifiOutline,
  restaurantOutline,
  snowOutline,
  carOutline,
  waterOutline,
  star,
} from 'ionicons/icons';

type SortKey = 'recomendado' | 'precio_asc' | 'precio_desc' | 'rating_desc';

interface RoomCard {
  id: number;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  pricePerNight: number;
  oldPricePerNight?: number;
  image: string;
  badges: string[];
  features: string[];
}

@Component({
  selector: 'app-habitaciones',
  standalone: true,
  imports: [CommonModule, IonContent, IonButton, IonIcon, FormsModule, RouterLink],
  templateUrl: './habitaciones.page.html',
  styleUrls: ['./habitaciones.page.scss'],
})
export class HabitacionesPage {
  checkIn = '';
  checkOut = '';
  adults = 2;
  children = 0;
  rooms = 1;
  withPets = 0;

  sort: SortKey = 'recomendado';

  minPrice: number | null = null;
  maxPrice: number | null = null;

  all: RoomCard[] = [
    {
      id: 1,
      name: 'Habitación Doble Deluxe',
      location: 'Malecón de Salinas · Frente al mar',
      rating: 8.9,
      reviews: 652,
      pricePerNight: 102,
      oldPricePerNight: 120,
      image: 'assets/img/1.PNG',
      badges: ['Cancelación gratis', 'Desayuno incluido'],
      features: ['wifi-outline', 'snow-outline', 'restaurant-outline'],
    },
    {
      id: 2,
      name: 'Habitación Familiar',
      location: 'Zona céntrica · A 5 min de la playa',
      rating: 8.6,
      reviews: 421,
      pricePerNight: 119,
      oldPricePerNight: 140,
      image: 'assets/img/4.PNG',
      badges: ['Ideal familias', 'Mejor precio'],
      features: ['wifi-outline', 'snow-outline', 'car-outline'],
    },
    {
      id: 3,
      name: 'Suite con Vista al Mar',
      location: 'Malecón · Vista panorámica',
      rating: 9.1,
      reviews: 312,
      pricePerNight: 149,
      oldPricePerNight: 169,
      image: 'assets/img/9.PNG',
      badges: ['Vista al mar', 'Alta demanda'],
      features: ['wifi-outline', 'water-outline', 'restaurant-outline'],
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    addIcons({
      locationOutline,
      optionsOutline,
      funnelOutline,
      bedOutline,
      wifiOutline,
      restaurantOutline,
      snowOutline,
      carOutline,
      waterOutline,
      star,
    });

    // LOG: cada vez que cambian los query params
    this.route.queryParamMap.subscribe((qp) => {
      this.checkIn = qp.get('checkIn') ?? '';
      this.checkOut = qp.get('checkOut') ?? '';
      this.adults = this.toNum(qp.get('adults'), 2);
      this.children = this.toNum(qp.get('children'), 0);
      this.rooms = this.toNum(qp.get('rooms'), 1);
      this.withPets = this.toNum(qp.get('withPets'), 0);

      console.log('[Habitaciones] queryParams:', {
        checkIn: this.checkIn,
        checkOut: this.checkOut,
        adults: this.adults,
        children: this.children,
        rooms: this.rooms,
        withPets: this.withPets,
      });
    });
  }

  // CLICK handler para depurar navegación
  async verOpcion(r: RoomCard) {
    const queryParams = {
      roomId: r.id,
      checkIn: this.checkIn,
      checkOut: this.checkOut,
      adults: this.adults,
      children: this.children,
      rooms: this.rooms,
      withPets: this.withPets,
    };

    console.log('[Habitaciones] Click Ver opción:', r);
    console.log('[Habitaciones] Navegando a /habitacion-detalle/:id con queryParams:', queryParams);
    console.log('[Habitaciones] URL actual antes de navegar:', this.router.url);

    // RECOMENDADO: ir a detalle (si ya la creaste)
    const ok = await this.router.navigate(['/habitacion-detalle', r.id], { queryParams });

    console.log('[Habitaciones] navigate() result:', ok);
    console.log('[Habitaciones] URL después de navegar:', this.router.url);
  }

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

  get results(): RoomCard[] {
    let list = [...this.all];
    if (this.minPrice !== null) list = list.filter((x) => x.pricePerNight >= this.minPrice!);
    if (this.maxPrice !== null) list = list.filter((x) => x.pricePerNight <= this.maxPrice!);
    list = this.applySort(list, this.sort);
    return list;
  }

  totalFor(card: RoomCard): number {
    const n = this.nights || 1;
    return card.pricePerNight * n;
  }

  setSort(key: SortKey) {
    this.sort = key;
  }

  clearFilters() {
    this.minPrice = null;
    this.maxPrice = null;
    this.sort = 'recomendado';
  }

  private applySort(list: RoomCard[], key: SortKey): RoomCard[] {
    if (key === 'precio_asc') return list.sort((a, b) => a.pricePerNight - b.pricePerNight);
    if (key === 'precio_desc') return list.sort((a, b) => b.pricePerNight - a.pricePerNight);
    if (key === 'rating_desc') return list.sort((a, b) => b.rating - a.rating);
    return list;
  }

  private toNum(v: string | null, fallback: number): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }

  trackById(_: number, item: { id: number }) {
    return item.id;
  }
}
