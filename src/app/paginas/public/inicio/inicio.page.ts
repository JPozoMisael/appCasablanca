import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { SearchBarComponent } from '@app/shared/components/search-bar/search-bar.component';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    RouterModule,
    SearchBarComponent
  ],
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage {

  // ================= SEARCH =================
  checkInDate: Date | null = null;
  checkOutDate: Date | null = null;

  adults: number = 2;
  children: number = 0;
  rooms: number = 1;
  withPets: boolean = false;

  // ================= SERVICIOS =================
  services = [
    { name: 'WiFi gratis', icon: 'wifi-outline' },
    { name: 'Piscina', icon: 'water-outline' },
    { name: 'Aire acondicionado', icon: 'snow-outline' },
    { name: 'Restaurante', icon: 'restaurant-outline' },
  ];

  // ================= MAPA =================
  mapEmbedUrl: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    this.mapEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://www.google.com/maps?q=Salinas+Ecuador&output=embed'
    );
  }

  openMap(event?: Event) {
    if (event) event.preventDefault();
    window.open('https://maps.google.com/?q=Salinas+Ecuador', '_blank');
  }

  // ================= HABITACIONES DEMO =================
  roomsData = [
    {
      id: 1,
      name: 'Suite Vista al Mar',
      description: 'Habitación amplia con balcón',
      price: 120,
      oldPrice: 150,
      selected: false
    },
    {
      id: 2,
      name: 'Habitación Doble',
      description: 'Ideal para parejas',
      price: 80,
      oldPrice: 100,
      selected: false
    }
  ];

  selectRoom(id: number) {
    this.roomsData = this.roomsData.map(r => ({
      ...r,
      selected: r.id === id
    }));
  }

  trackById(index: number, item: any) {
    return item.id;
  }

  calculateNights(): number {
    if (!this.checkInDate || !this.checkOutDate) return 1;

    const diff = this.checkOutDate.getTime() - this.checkInDate.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  getSearchParams() {
    return {
      checkIn: this.checkInDate ? this.formatDate(this.checkInDate) : '',
      checkOut: this.checkOutDate ? this.formatDate(this.checkOutDate) : '',
      adults: this.adults,
      children: this.children,
      rooms: this.rooms,
      withPets: this.withPets ? 1 : 0
    };
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

}