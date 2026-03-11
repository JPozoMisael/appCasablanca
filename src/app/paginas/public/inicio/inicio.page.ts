import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  locationOutline,
  flashOutline,
  sunnyOutline,
  wifiOutline,
  restaurantOutline,
  snowOutline,
  waterOutline,
  fitnessOutline,
  star,
  shieldCheckmarkOutline,
  checkmarkCircleOutline,
  tvOutline,
  imagesOutline,
  heartOutline,
  shareSocialOutline,
  homeOutline,
  bedOutline,
  logInOutline,
} from 'ionicons/icons';

import {
  SearchBarComponent,
  SearchBarValue,
} from '../../../shared/components/search-bar/search-bar.component';

import { BookingSummaryComponent } from '../../../shared/components/booking-summary/booking-summary.component';
import { AppHeaderComponent } from '@app/shared/components/app-header/app-header.component';
import { AppFooterComponent } from '@app/shared/components/app-footer/app-footer.component';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

type NavTabKey = 'alojamiento' | 'vuelos' | 'coches' | 'atracciones';

interface RoomOption {
  id: number;
  name: string;
  description: string;
  features: string[];
  oldPrice: number;
  price: number;
  selected: boolean;
}

interface ServiceItem {
  icon: string;
  name: string;
}

interface Testimonial {
  name: string;
  country: string;
  text: string;
  rating: number;
}

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonButton,
    IonIcon,
    RouterLink,
    SearchBarComponent,
    BookingSummaryComponent,
    AppHeaderComponent,
    AppFooterComponent,
  ],
})
export class InicioPage {
  currentYear = new Date().getFullYear();

  activeNav: NavTabKey = 'alojamiento';

  checkInDate: Date | null = null;
  checkOutDate: Date | null = null;

  adults = 2;
  children = 0;
  rooms = 1;
  withPets = false;

  roomsData: RoomOption[] = [
    {
      id: 1,
      name: 'Habitación Doble Deluxe',
      description: 'Cama king size · Vista al mar · Desayuno incluido',
      features: ['wifi-outline', 'snow-outline', 'tv-outline'],
      oldPrice: 120,
      price: 102,
      selected: true,
    },
    {
      id: 2,
      name: 'Habitación Familiar',
      description: '2 camas queen · Balcón · Desayuno incluido',
      features: ['wifi-outline', 'snow-outline', 'tv-outline', 'water-outline'],
      oldPrice: 140,
      price: 119,
      selected: false,
    },
  ];

  services: ServiceItem[] = [
    { icon: 'wifi-outline', name: 'WiFi gratis' },
    { icon: 'restaurant-outline', name: 'Desayuno incluido' },
    { icon: 'snow-outline', name: 'Aire acondicionado' },
    { icon: 'bed-outline', name: 'Habitaciones cómodas' },
    { icon: 'water-outline', name: 'Piscina' },
    { icon: 'fitness-outline', name: 'Gimnasio' },
  ];

  testimonials: Testimonial[] = [
    {
      name: 'Julian',
      country: 'Ecuador',
      text: 'Excelente ubicación frente al mar. Habitaciones cómodas y limpias.',
      rating: 5,
    },
    {
      name: 'María González',
      country: 'Colombia',
      text: 'Buena atención y buena ubicación. Volveríamos sin duda.',
      rating: 5,
    },
  ];

  // ✅ MAPA (Booking-like)
  mapEmbedUrl!: SafeResourceUrl;

  // Ajusta esto si quieres
  private readonly hotelAddress = 'Avenida Malecón de Salinas, Salinas, Ecuador';
  private readonly hotelLat = -2.2147;  // aprox. Salinas
  private readonly hotelLng = -80.9650; // aprox. Salinas
  private readonly mapsZoom = 16;

  constructor(
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    this.setDefaultDates();

    addIcons({
      locationOutline,
      flashOutline,
      sunnyOutline,
      wifiOutline,
      restaurantOutline,
      snowOutline,
      waterOutline,
      fitnessOutline,
      star,
      shieldCheckmarkOutline,
      checkmarkCircleOutline,
      tvOutline,
      imagesOutline,
      heartOutline,
      shareSocialOutline,
      homeOutline,
      bedOutline,
      logInOutline,
    });

    // ✅ Google Maps embed (sin API Key)
    const embed = `https://www.google.com/maps?q=${this.hotelLat},${this.hotelLng}&z=${this.mapsZoom}&output=embed`;
    this.mapEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embed);
  }

  setActiveNav(key: NavTabKey) {
    this.activeNav = key;
  }

  onSearchValueChange(v: SearchBarValue) {
    this.checkInDate = v.checkIn;
    this.checkOutDate = v.checkOut;
    this.adults = v.adults;
    this.children = v.children;
    this.rooms = v.rooms;
    this.withPets = v.withPets;
  }

  onSearchSubmit(v: SearchBarValue) {
    this.onSearchValueChange(v);
    this.router.navigate(['/habitaciones'], { queryParams: this.getSearchParams() });
  }

  setDefaultDates() {
    const today = new Date();
    const inDate = new Date(today);
    inDate.setDate(today.getDate() + 3);

    const outDate = new Date(inDate);
    outDate.setDate(inDate.getDate() + 3);

    this.checkInDate = inDate;
    this.checkOutDate = outDate;
  }

  selectRoom(roomId: number) {
    this.roomsData = this.roomsData.map((r) => ({ ...r, selected: r.id === roomId }));
  }

  getSelectedRoom(): RoomOption {
    return this.roomsData.find((r) => r.selected) ?? this.roomsData[0];
  }

  calculateNights(): number {
    if (!this.checkInDate || !this.checkOutDate) return 0;
    const diff = this.checkOutDate.getTime() - this.checkInDate.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  calculateOldTotal(): number {
    const room = this.getSelectedRoom();
    return room.oldPrice * this.calculateNights();
  }

  calculateTotal(): number {
    const room = this.getSelectedRoom();
    return room.price * this.calculateNights();
  }

  getSearchParams() {
    return {
      checkIn: this.checkInDate ? this.formatDateForUrl(this.checkInDate) : '',
      checkOut: this.checkOutDate ? this.formatDateForUrl(this.checkOutDate) : '',
      adults: this.adults,
      children: this.children,
      rooms: this.rooms,
      withPets: this.withPets ? 1 : 0,
    };
  }

  getBookingParams() {
    const room = this.getSelectedRoom();
    return {
      roomId: room.id,
      checkIn: this.checkInDate ? this.formatDateForUrl(this.checkInDate) : '',
      checkOut: this.checkOutDate ? this.formatDateForUrl(this.checkOutDate) : '',
      adults: this.adults,
      children: this.children,
      rooms: this.rooms,
      withPets: this.withPets ? 1 : 0,
      total: this.calculateTotal(),
    };
  }

  getFeatureName(featureIcon: string): string {
    const map: Record<string, string> = {
      'wifi-outline': 'WiFi',
      'snow-outline': 'Aire acond.',
      'tv-outline': 'TV',
      'water-outline': 'Vista al mar',
      'restaurant-outline': 'Restaurante',
      'bed-outline': 'Habitación',
    };
    return map[featureIcon] ?? 'Servicio';
  }

  openMap(event?: Event) {
    if (event) event.preventDefault();
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.hotelAddress)}`;
    window.open(url, '_blank');
  }

  goToGallery() {
    this.router.navigate(['/galeria']);
  }

  scrollToSection(sectionId: string) {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  formatShortDate(date: Date): string {
    return date.toLocaleDateString('es-EC', { day: 'numeric', month: 'short' });
  }

  private formatDateForUrl(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  trackById(_: number, item: { id: number }) {
    return item.id;
  }
}
