import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';

import {
  locationOutline,
  searchOutline,
  calendarOutline,
  peopleOutline,
  wifiOutline,
  waterOutline,
  restaurantOutline,
  sunnyOutline,
  thermometerOutline
} from 'ionicons/icons';

import { HabitacionesService } from '@app/core/services/habitaciones.service';

@Component({
  selector: 'app-hotel',
  standalone: true,
  templateUrl: './hotel.page.html',
  styleUrls: ['./hotel.page.scss'],
  imports: [
    CommonModule,
    RouterModule,
    IonButton,
    IonIcon
  ]
})
export class HotelPage implements OnInit {

  slug: string = '';

  hotel: any = null;
  featuredRooms: any[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private habitacionesService: HabitacionesService
  ) {
    addIcons({
      locationOutline,
      searchOutline,
      calendarOutline,
      peopleOutline,
      wifiOutline,
      waterOutline,
      restaurantOutline,
      sunnyOutline,
      thermometerOutline
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.slug = params.get('slug') || '';

      if (!this.slug) {
        console.error('Slug vacío');
        return;
      }

      this.loadHotel();
      this.loadRooms();
    });
  }

  // ================= HOTEL =================

  loadHotel() {

    const hotelesMock: any = {
      chipipe: {
        name: 'Casa Blanca Chipipe',
        location: 'Chipipe, Salinas',
        description: 'Frente a la playa más tranquila de Salinas',
        heroImage: 'assets/img/26.jpeg',
        gallery: [
          'assets/img/26.jpeg',
          'assets/img/26.jpeg',
          'assets/img/26.jpeg'
        ]
      },
      palmeras: {
        name: 'Casa Blanca Palmeras',
        location: 'Palmeras, Salinas',
        description: 'Zona céntrica cerca de restaurantes',
        heroImage: 'assets/img/25.jpeg',
        gallery: [
          'assets/img/25.jpeg',
          'assets/img/25.jpeg',
          'assets/img/25.jpeg'
        ]
      },
      ballenita: {
        name: 'Casa Blanca Ballenita',
        location: 'Ballenita, Santa Elena',
        description: 'Vista panorámica y tranquilidad',
        heroImage: 'assets/img/27.jpeg',
        gallery: [
          'assets/img/27.jpeg',
          'assets/img/27.jpeg',
          'assets/img/27.jpeg'
        ]
      }
    };

    this.hotel = hotelesMock[this.slug] || null;
  }

  // ================= ROOMS =================

  loadRooms() {

    this.loading = true;

    this.habitacionesService.getByHotel(this.slug).subscribe({
      next: (rooms) => {

        this.featuredRooms = (rooms || [])
          .slice(0, 3)
          .map((r: any) => ({
            id: r.id,
            name: `Habitación ${r.numero}`,
            desc: r.descripcion,
            price: r.precioNoche,
            image: r.imagenUrl
          }));

        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando habitaciones:', err);
        this.loading = false;
      }
    });
  }

  // ================= NAV =================

  goToAvailability() {
    this.router.navigate([
      '/hotel',
      this.slug,
      'habitaciones'
    ]);
  }

}