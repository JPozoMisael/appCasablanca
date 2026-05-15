import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonIcon,
  IonButton
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {

  peopleOutline,
  bedOutline,
  wifiOutline,
  waterOutline,
  snowOutline,
  starOutline,
  searchOutline,
  businessOutline,
  calendarOutline,
  heartOutline,
  checkmarkOutline,
  locationOutline,
  checkmarkCircleOutline,
  sparklesOutline

} from 'ionicons/icons';

/* ======================================================
   TYPES
====================================================== */

interface Habitacion {

  id: number;
  tipo: string;
  capacidad: number;
  camas: number;
  precioNoche: number;
  tarifa?: number;
  rating: number;
  imagenUrl: string;
  imagen?:string;
  descripcion: string;
  amenities: string[];
  totalReviews?: number;

}

/* ======================================================
   COMPONENT
====================================================== */

@Component({

  selector: 'app-habitaciones',

  standalone: true,

  imports: [

    CommonModule,
    FormsModule,
    IonIcon,
    IonButton

  ],

  templateUrl: './habitaciones.page.html',

  styleUrls: ['./habitaciones.page.scss']

})

export class HabitacionesPage {

  /* ======================================================
     SEARCH INFO
  ====================================================== */

  checkIn = '15 May';

  checkOut = '17 May';

  adults = 2;

  rooms = 1;

  hotelName = 'Casa Blanca Chipipe';

  nights = 2;

  /* ======================================================
     FILTERS
  ====================================================== */

  loading = false;

  sort:
    | 'recomendado'
    | 'precio_asc'
    | 'precio_desc'
    = 'recomendado';

  precioMax = 500;

  capacidad = 1;

  /* ======================================================
     HOTEL ACTUAL
     🔥 CAMBIAR AQUÍ:
     chipipe
     palmeras
     ballenita
  ====================================================== */

  hotelSlug = 'chipipe';

  /* ======================================================
     DATA
  ====================================================== */

  habitaciones = signal<Habitacion[]>([

    /* ==================================================
       CHIPIPE
    =================================================== */

    {

      id: 1,

      tipo: 'Suite Ocean Front',

      capacidad: 3,

      camas: 2,

      precioNoche: 145,

      tarifa: 145,

      rating: 9.2,

      totalReviews: 421,

      /*
      ===================================================
      🔥 CAMBIAR IMAGEN AQUÍ
      ===================================================
      */

      imagenUrl:
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1400&auto=format&fit=crop',

      descripcion:
        'Suite premium frente al mar con balcón privado y acceso exclusivo a piscina.',

      amenities: [

        'WiFi gratis',
        'Vista al mar',
        'Piscina',
        'Aire acondicionado'

      ]

    },

    {

      id: 2,

      tipo: 'Habitación Doble Deluxe',

      capacidad: 2,

      camas: 2,

      precioNoche: 95,

      tarifa: 95,

      rating: 8.8,

      totalReviews: 287,

      imagenUrl:
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1400&auto=format&fit=crop',

      descripcion:
        'Habitación elegante con desayuno incluido y excelente ubicación.',

      amenities: [

        'WiFi gratis',
        'TV Smart',
        'Desayuno incluido'

      ]

    },

    {

      id: 3,

      tipo: 'Habitación Simple',

      capacidad: 1,

      camas: 1,

      precioNoche: 65,

      tarifa: 65,

      rating: 8.4,

      totalReviews: 143,

      imagenUrl:
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1400&auto=format&fit=crop',

      descripcion:
        'Ideal para viajes rápidos y cómodos cerca de la playa.',

      amenities: [

        'WiFi gratis',
        'Aire acondicionado'

      ]

    },

    /* ==================================================
       PALMERAS
       🔥 DESCOMENTA CUANDO QUIERAS USARLAS
    =================================================== */

    /*
    {

      id: 4,

      tipo: 'Suite Ejecutiva',

      capacidad: 2,

      camas: 1,

      precioNoche: 120,

      tarifa: 120,

      rating: 9.0,

      totalReviews: 312,

      imagenUrl:
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1400&auto=format&fit=crop',

      descripcion:
        'Suite moderna en zona urbana premium.',

      amenities: [

        'WiFi gratis',
        'Smart TV',
        'Rooftop'

      ]

    },
    */

    /* ==================================================
       BALLENITA
       🔥 DESCOMENTA CUANDO QUIERAS USARLAS
    =================================================== */

    /*
    {

      id: 5,

      tipo: 'Suite Sunset',

      capacidad: 4,

      camas: 2,

      precioNoche: 180,

      tarifa: 180,

      rating: 9.5,

      totalReviews: 501,

      imagenUrl:
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1400&auto=format&fit=crop',

      descripcion:
        'Suite de lujo con vista panorámica al océano.',

      amenities: [

        'Jacuzzi',
        'Vista panorámica',
        'Piscina infinita'

      ]

    },
    */

  ]);

  /* ======================================================
     FILTERED
  ====================================================== */

  filtradas = computed(() => {

    let rooms = this.habitaciones()

      .filter(h =>

        h.precioNoche <= this.precioMax &&

        h.capacidad >= this.capacidad

      );

    /* ==================================================
       SORT
    =================================================== */

    if (this.sort === 'precio_asc') {

      rooms = [...rooms].sort(

        (a, b) =>

          a.precioNoche -
          b.precioNoche

      );

    }

    if (this.sort === 'precio_desc') {

      rooms = [...rooms].sort(

        (a, b) =>

          b.precioNoche -
          a.precioNoche

      );

    }

    if (this.sort === 'recomendado') {

      rooms = [...rooms].sort(

        (a, b) =>

          b.rating -
          a.rating

      );

    }

    return rooms;

  });

  /* ======================================================
     TOTAL
  ====================================================== */

  total = computed(() =>

    this.filtradas().length

  );

  /* ======================================================
     CONSTRUCTOR
  ====================================================== */

  constructor() {

    addIcons({

      peopleOutline,
      bedOutline,
      wifiOutline,
      waterOutline,
      snowOutline,
      starOutline,
      searchOutline,
      businessOutline,
      calendarOutline,
      heartOutline,
      checkmarkOutline,
      locationOutline,
      checkmarkCircleOutline,
      sparklesOutline

    });

  }

  /* ======================================================
     LOAD
  ====================================================== */

  loadHabitaciones(): void {

    this.loading = true;

    setTimeout(() => {

      this.loading = false;

    }, 250);

  }

  /* ======================================================
     IMAGE FALLBACK
  ====================================================== */

  onImageError(event: any): void {

    /*
    =====================================================
    🔥 IMAGEN FALLBACK
    =====================================================
    */

    event.target.src =
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1400&auto=format&fit=crop';

  }

  /* ======================================================
     TRACKBY
  ====================================================== */

  trackById(
    index: number,
    item: Habitacion
  ): number {

    return item.id;

  }

  /* ======================================================
     DETAIL
  ====================================================== */

  goToDetalle(h: Habitacion): void {

    /*
    =====================================================
     AQUÍ LUEGO IRÁ:
    this.router.navigate(...)
    =====================================================
    */

    console.log(

      'Abrir detalle:',

      h

    );

  }

}