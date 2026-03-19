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

  // 🔴 IMPORTANTE — slug del hotel
  slug = '';

  checkIn = '';
  checkOut = '';
  adults = 2;
  children = 0;
  rooms = 1;
  withPets = 0;

  sort: SortKey = 'recomendado';

  minPrice: number | null = null;
  maxPrice: number | null = null;

  // 🔴 Lista final que se muestra
  all: RoomCard[] = [];

  // 🟢 HABITACIONES POR HOTEL
  private roomsByHotel: Record<string, RoomCard[]> = {

    chipipe: [
      {
        id: 1,
        name: 'Suite Vista al Mar',
        location: 'Chipipe · Frente al mar',
        rating: 9.2,
        reviews: 820,
        pricePerNight: 129,
        oldPricePerNight: 150,
        image: 'assets/img/1.PNG',
        badges: ['Vista directa al mar'],
        features: ['wifi-outline','snow-outline','restaurant-outline'],
      },
    ],

    palmeras: [
      {
        id: 2,
        name: 'Habitación Ejecutiva',
        location: 'Zona céntrica',
        rating: 8.7,
        reviews: 510,
        pricePerNight: 99,
        oldPricePerNight: 120,
        image: 'assets/img/4.PNG',
        badges: ['Mejor precio'],
        features: ['wifi-outline','snow-outline','car-outline'],
      },
    ],

    ballenita: [
      {
        id: 3,
        name: 'Suite Panorámica',
        location: 'Vista al océano',
        rating: 9.4,
        reviews: 340,
        pricePerNight: 149,
        oldPricePerNight: 169,
        image: 'assets/img/9.PNG',
        badges: ['Alta demanda'],
        features: ['wifi-outline','water-outline','restaurant-outline'],
      },
    ],
  };

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

    // 🔴 OBTENER SLUG DEL HOTEL
    this.route.paramMap.subscribe(pm => {

      this.slug = pm.get('slug') || 'chipipe';

      // 🔥 CARGAR HABITACIONES SEGÚN HOTEL
      this.all =
        this.roomsByHotel[this.slug] ||
        this.roomsByHotel['chipipe'];

      console.log('[Habitaciones] Hotel actual:', this.slug);
    });

    // 🔴 OBTENER QUERY PARAMS
    this.route.queryParamMap.subscribe((qp) => {

      this.checkIn = qp.get('checkIn') ?? '';
      this.checkOut = qp.get('checkOut') ?? '';
      this.adults = this.toNum(qp.get('adults'), 2);
      this.children = this.toNum(qp.get('children'), 0);
      this.rooms = this.toNum(qp.get('rooms'), 1);
      this.withPets = this.toNum(qp.get('withPets'), 0);
    });
  }

  // ================= FUNCIONES EXISTENTES =================

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

    await this.router.navigate(
      ['/hotel', this.slug, 'habitacion', r.id],
      { queryParams }
    );
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

    if (this.minPrice !== null)
      list = list.filter(x => x.pricePerNight >= this.minPrice!);

    if (this.maxPrice !== null)
      list = list.filter(x => x.pricePerNight <= this.maxPrice!);

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

    if (key === 'precio_asc')
      return list.sort((a, b) => a.pricePerNight - b.pricePerNight);

    if (key === 'precio_desc')
      return list.sort((a, b) => b.pricePerNight - a.pricePerNight);

    if (key === 'rating_desc')
      return list.sort((a, b) => b.rating - a.rating);

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