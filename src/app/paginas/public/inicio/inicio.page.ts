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

  services = [
    { name: 'WiFi gratis', icon: 'wifi-outline' },
    { name: 'Piscina', icon: 'water-outline' },
    { name: 'Aire acondicionado', icon: 'snow-outline' },
    { name: 'Restaurante', icon: 'restaurant-outline' },
  ];

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

  roomsData = [
    {
      id: 1,
      name: 'Suite Vista al Mar',
      description: 'Habitación amplia con balcón',
      price: 120,
    },
    {
      id: 2,
      name: 'Habitación Doble',
      description: 'Ideal para parejas',
      price: 80,
    }
  ];

  trackById(index: number, item: any) {
    return item.id;
  }
}