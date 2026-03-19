import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';

import {
  waterOutline,
  peopleOutline,
  sunnyOutline,
  restaurantOutline,
  businessOutline,
  moonOutline,
  eyeOutline,
  leafOutline,
  bedOutline
} from 'ionicons/icons';

import {
  SearchBarComponent,
  SearchBarValue,
} from '../../../shared/components/search-bar/search-bar.component';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';


interface RoomOption {
  id: number;
  name: string;
  description: string;
  oldPrice: number;
  price: number;
  selected: boolean;
}

interface ServiceItem {
  icon: string;
  name: string;
}

@Component({
  selector: 'app-inicio',
  standalone: true,
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  imports: [
    CommonModule,
    IonButton,
    IonIcon,
    RouterLink,
    SearchBarComponent,
  ],
})
export class InicioPage {

  // ================= BUSCADOR =================

  checkInDate: Date | null = null;
  checkOutDate: Date | null = null;

  adults = 2;
  children = 0;
  rooms = 1;
  withPets = false;

  // ================= HABITACIONES =================

  roomsData: RoomOption[] = [
    {
      id: 1,
      name: 'Habitación Doble Deluxe',
      description: 'Vista al mar · Desayuno incluido',
      oldPrice: 120,
      price: 102,
      selected: true,
    },
    {
      id: 2,
      name: 'Habitación Familiar',
      description: 'Ideal para familias · Balcón',
      oldPrice: 140,
      price: 119,
      selected: false,
    },
  ];

  // ================= SERVICIOS =================

  services: ServiceItem[] = [
    { icon: 'wifi-outline', name: 'WiFi gratis' },
    { icon: 'restaurant-outline', name: 'Desayuno incluido' },
    { icon: 'snow-outline', name: 'Aire acondicionado' },
    { icon: 'water-outline', name: 'Piscina' },
    { icon: 'fitness-outline', name: 'Gimnasio' },
  ];

  // ================= MAPA =================

  mapEmbedUrl!: SafeResourceUrl;

  private readonly hotelLat = -2.2147;
  private readonly hotelLng = -80.9650;

  constructor(
    private router: Router,
    private sanitizer: DomSanitizer
  ) {

    addIcons({
      waterOutline,
      peopleOutline,
      sunnyOutline,
      restaurantOutline,
      businessOutline,
      moonOutline,
      eyeOutline,
      leafOutline,
      bedOutline
    });

    this.setDefaultDates();

    const embed =
      `https://www.google.com/maps?q=${this.hotelLat},${this.hotelLng}&output=embed`;

    this.mapEmbedUrl =
      this.sanitizer.bypassSecurityTrustResourceUrl(embed);
  }


  // ================= BUSCADOR =================

  onSearchValueChange(v: SearchBarValue) {
    this.checkInDate = v.checkIn;
    this.checkOutDate = v.checkOut;
    this.adults = v.adults;
    this.children = v.children;
    this.rooms = v.rooms;
    this.withPets = v.withPets;
  }


  // ⭐ SUBMIT CORRECTO MULTI-HOTEL

  onSearchSubmit(v: SearchBarValue) {

    this.onSearchValueChange(v);

    if (!v.branch) {
      alert('Seleccione una sucursal');
      return;
    }

    if (!v.checkIn || !v.checkOut) {
      alert('Seleccione fechas');
      return;
    }

    this.router.navigate(
      ['/hotel', v.branch, 'habitaciones'],
      {
        queryParams: {
          checkIn: this.formatDateForUrl(v.checkIn),
          checkOut: this.formatDateForUrl(v.checkOut),
          adults: v.adults,
          children: v.children,
          rooms: v.rooms,
          withPets: v.withPets ? 1 : 0,
        }
      }
    );

  }


  setDefaultDates() {
    const today = new Date();
    const inDate = new Date(today);
    inDate.setDate(today.getDate() + 3);

    const outDate = new Date(inDate);
    outDate.setDate(inDate.getDate() + 2);

    this.checkInDate = inDate;
    this.checkOutDate = outDate;
  }


  // ================= SELECCIÓN HABITACIÓN =================

  selectRoom(roomId: number) {
    this.roomsData = this.roomsData.map((r) => ({
      ...r,
      selected: r.id === roomId,
    }));
  }


  calculateNights(): number {
    if (!this.checkInDate || !this.checkOutDate) return 1;

    const diff =
      this.checkOutDate.getTime() - this.checkInDate.getTime();

    return Math.max(
      1,
      Math.ceil(diff / (1000 * 60 * 60 * 24))
    );
  }


  // ================= PARAMS =================

  getSearchParams() {
    return {
      checkIn: this.formatDateForUrl(this.checkInDate),
      checkOut: this.formatDateForUrl(this.checkOutDate),
      adults: this.adults,
      children: this.children,
      rooms: this.rooms,
      withPets: this.withPets ? 1 : 0,
    };
  }

  private formatDateForUrl(date: Date | null): string {
    return date ? date.toISOString().split('T')[0] : '';
  }


  // ================= MAPA =================

  openMap(event?: Event) {
    if (event) event.preventDefault();

    const url =
      'https://www.google.com/maps?q=-2.2147,-80.9650';

    window.open(url, '_blank');
  }

  trackById(_: number, item: { id: number }) {
    return item.id;
  }

}