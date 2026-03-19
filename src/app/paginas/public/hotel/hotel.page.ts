import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';

import {
  locationOutline,
  sunnyOutline,
  wifiOutline,
  waterOutline,
  restaurantOutline,
  snowOutline,
  calendarOutline,
  peopleOutline,
  searchOutline,
  chevronDownOutline
} from 'ionicons/icons';


/* ================= MODELOS ================= */

interface HotelData {
  name: string;
  location: string;
  description: string;
  heroImage: string;
  gallery: string[];
}


/* ================= COMPONENT ================= */

@Component({
  selector: 'app-hotel',
  standalone: true,
  templateUrl: './hotel.page.html',
  styleUrls: ['./hotel.page.scss'],
  imports: [
    CommonModule,
    IonButton,
    IonIcon,
    RouterLink
  ],
})
export class HotelPage implements OnInit {

  slug!: string;
  hotel!: HotelData;


  /* ============================================================
     ESTADO DE DISPONIBILIDAD (IMPORTANTE)
     ============================================================ */

  checkIn: Date | null = null;
  checkOut: Date | null = null;

  adults = 2;
  children = 0;
  rooms = 1;


  /* ===== HABITACIONES DESTACADAS ===== */

  featuredRooms = [
    {
      name: 'Suite Vista al Mar',
      desc: 'Balcón privado · Desayuno incluido',
      price: 129,
      image: 'assets/img/1.PNG',
    },
    {
      name: 'Habitación Familiar',
      desc: 'Ideal para familias',
      price: 109,
      image: 'assets/img/4.PNG',
    },
  ];


  /* ===== DATA DE HOTELES ===== */

  private hotels: Record<string, HotelData> = {

    chipipe: {
      name: 'Casa Blanca Chipipe',
      location: 'Playa Chipipe · Salinas',
      description:
        'Hotel frente a la playa más tranquila de Salinas, ideal para familias y descanso.',
      heroImage: 'assets/img/26.jpeg',
      gallery: [
        'assets/img/1.PNG',
        'assets/img/4.PNG',
        'assets/img/9.PNG',
        'assets/img/8.PNG',
      ],
    },

    palmeras: {
      name: 'Casa Blanca Palmeras',
      location: 'Zona céntrica · Salinas',
      description:
        'Ubicado cerca de restaurantes y comercio.',
      heroImage: 'assets/img/25.jpeg',
      gallery: [
        'assets/img/1.PNG',
        'assets/img/4.PNG',
        'assets/img/9.PNG',
        'assets/img/8.PNG',
      ],
    },

    ballenita: {
      name: 'Casa Blanca Ballenita',
      location: 'Ballenita · Santa Elena',
      description:
        'Vista panorámica al océano en una zona tranquila.',
      heroImage: 'assets/img/27.jpeg',
      gallery: [
        'assets/img/28 ballenita.jpeg',
        'assets/img/29 ballenita.jpeg',
        'assets/img/30 ballenita.jpeg',
        'assets/img/31 ballenita.jpeg',
        'assets/img/32 ballenita.jpeg',
        'assets/img/33 ballenita.jpeg',
      ],
    },
  };


  /* ============================================================
     CONSTRUCTOR
     ============================================================ */

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    addIcons({
      locationOutline,
      sunnyOutline,
      wifiOutline,
      waterOutline,
      restaurantOutline,
      snowOutline,
      calendarOutline,
      peopleOutline,
      searchOutline,
      chevronDownOutline
    });
  }


  /* ============================================================
     INIT
     ============================================================ */

  ngOnInit() {

    // 🔹 Cargar hotel según slug
    this.route.paramMap.subscribe(params => {

      this.slug = params.get('slug') || 'chipipe';

      const hotelData = this.hotels[this.slug];

      this.hotel = hotelData || this.hotels['chipipe'];
    });

    // 🔹 Fechas por defecto tipo Booking
    this.setDefaultDates();
  }


  /* ============================================================
     FECHAS POR DEFECTO
     ============================================================ */

  setDefaultDates() {

    const today = new Date();

    const inDate = new Date(today);
    inDate.setDate(today.getDate() + 3);

    const outDate = new Date(inDate);
    outDate.setDate(inDate.getDate() + 2);

    this.checkIn = inDate;
    this.checkOut = outDate;
  }


  /* ============================================================
     ACCIONES AVAILABILITY BAR
     ============================================================ */

  // 👉 Ir a habitaciones con parámetros reales
  goToAvailability() {

    this.router.navigate(
      ['/hotel', this.slug, 'habitaciones'],
      {
        queryParams: {
          checkIn: this.formatDate(this.checkIn),
          checkOut: this.formatDate(this.checkOut),
          adults: this.adults,
          children: this.children,
          rooms: this.rooms
        }
      }
    );
  }


  // 👉 Selector de sucursal (placeholder)
  toggleBranchMenu() {
    console.log('Abrir selector de sucursal');
    // Aquí luego puedes abrir modal o dropdown
  }


  /* ============================================================
     HELPERS
     ============================================================ */

  private formatDate(d: Date | null): string {
    return d ? d.toISOString().split('T')[0] : '';
  }

}