import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import {
  DomSanitizer,
  SafeResourceUrl
} from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { SearchBarComponent } from '@app/shared/components/search-bar/search-bar.component';
import { HotelesService } from '@app/core/services/hotel.service';
import { Hotel } from '@app/shared/models/hotel.model';

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
export class InicioPage implements OnInit {

  /* ======================================================
     DATA
  ====================================================== */

  hoteles: Hotel[] = [];

  featuredHotel: Hotel | null = null;

  loading = true;

  /* ======================================================
     SERVICES
  ====================================================== */

  services = [

    {
      name: 'WiFi gratis',
      icon: 'wifi-outline'
    },

    {
      name: 'Piscina',
      icon: 'water-outline'
    },

    {
      name: 'Aire acondicionado',
      icon: 'snow-outline'
    },

    {
      name: 'Restaurante',
      icon: 'restaurant-outline'
    },

    {
      name: 'Frente al mar',
      icon: 'sunny-outline'
    },

    {
      name: 'Parqueadero',
      icon: 'car-outline'
    },

    {
      name: 'Recepción 24/7',
      icon: 'time-outline'
    },

    {
      name: 'Habitaciones familiares',
      icon: 'people-outline'
    }

  ];

  /* ======================================================
     EXPERIENCIAS
  ====================================================== */

  experiencias = [

    {
      title: 'Frente al mar',

      desc:
        'Despierta con vistas únicas de Salinas',

      image:
        'assets/img/exp-mar.jpg',

      badge:
        'Más reservado',

      button:
        'Ver habitaciones',

      route:
        '/hotel/chipipe',

      badgeClass:
        ''
    },

    {
      title: 'Piscina & relax',

      desc:
        'Suites diseñadas para desconectarte',

      image:
        'assets/img/exp-piscina.jpg',

      badge:
        'Relax premium',

      button:
        'Explorar suites',

      route:
        '/hotel/palmeras',

      badgeClass:
        'secondary'
    },

    {
      title: 'Gastronomía',

      desc:
        'Restaurantes y experiencias frente al mar',

      image:
        'assets/img/exp-food.jpg',

      badge:
        'Experiencia top',

      button:
        'Descubrir',

      route:
        '/hotel/palmeras',

      badgeClass:
        'dark'
    }

  ];

  /* ======================================================
     MAP
  ====================================================== */

  mapEmbedUrl: SafeResourceUrl;

  constructor(
    private sanitizer: DomSanitizer,
    private hotelesService: HotelesService
  ) {

    this.mapEmbedUrl =
      this.sanitizer.bypassSecurityTrustResourceUrl(
        'https://www.google.com/maps?q=Salinas+Ecuador&output=embed'
      );

  }

  /* ======================================================
     INIT
  ====================================================== */

  ngOnInit(): void {

    this.loadHoteles();

    this.loadFeaturedHotel();

  }

  /* ======================================================
     LOAD HOTELES
  ====================================================== */

  loadHoteles(): void {

    this.loading = true;

    this.hotelesService
      .getResumen()
      .subscribe({

        next: (hoteles) => {

          this.hoteles = hoteles.map(h => ({

            ...h,

            imagen:
              this.getImage(
                h.imagen
              ),

            rating:
              Number(
                (h as any).rating
              ) || 4

          }));

          this.loading = false;
        },

        error: (err) => {

          console.error(
            'Error cargando hoteles:',
            err
          );

          this.loading = false;
        }

      });

  }

  /* ======================================================
     FEATURED HOTEL
  ====================================================== */

  loadFeaturedHotel(): void {

    this.hotelesService
      .getFeatured()
      .subscribe({

        next: (hotel) => {

          if (!hotel) {

            this.featuredHotel = null;

            return;
          }

          this.featuredHotel = {

            ...hotel,

            imagen:
              this.getImage(
                hotel.imagen
              ),

            rating:
              Number(
                (hotel as any).rating
              ) || 4
          };
        },

        error: (err) => {

          console.error(
            'Error featured hotel:',
            err
          );

          this.featuredHotel = null;
        }

      });

  }

  /* ======================================================
     IMAGE
  ====================================================== */

  getImage(img?: string): string {

    return img && img.trim() !== ''
      ? img
      : 'assets/img/default.jpg';

  }

  /* ======================================================
     STARS
  ====================================================== */

  getStars(rating: number): string[] {

    const stars: string[] = [];

    const fullStars =
      Math.round(rating);

    for (let i = 0; i < 5; i++) {

      stars.push(

        i < fullStars
          ? 'star'
          : 'star-outline'

      );

    }

    return stars;

  }

  /* ======================================================
     RATING TEXT
  ====================================================== */

  getRatingText(rating: number): string {

    if (rating >= 4.5) {
      return 'Excepcional';
    }

    if (rating >= 4) {
      return 'Muy bueno';
    }

    if (rating >= 3) {
      return 'Bueno';
    }

    if (rating >= 2) {
      return 'Aceptable';
    }

    return 'Básico';

  }

  /* ======================================================
     MAP
  ====================================================== */

  openMap(event?: Event): void {

    if (event) {

      event.preventDefault();

    }

    window.open(
      'https://maps.google.com/?q=Salinas+Ecuador',
      '_blank'
    );

  }

  /* ======================================================
     TRACK BY
  ====================================================== */

  trackById(
    index: number,
    item: Hotel
  ): number {

    return item.id;

  }

}