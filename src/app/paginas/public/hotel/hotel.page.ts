import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  ActivatedRoute,
  Router,
  RouterModule
} from '@angular/router';

import {
  DomSanitizer,
  SafeResourceUrl
} from '@angular/platform-browser';

import {
  IonButton,
  IonIcon
} from '@ionic/angular/standalone';

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
  thermometerOutline,
  bedOutline,
  shieldCheckmarkOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  walkOutline,
  cafeOutline,
  carOutline
} from 'ionicons/icons';

import { HabitacionesService } from '@app/core/services/habitaciones.service';
import { HotelesService } from '@app/core/services/hotel.service';

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

  /* ======================================================
     STATE
  ====================================================== */

  slug: string = '';

  hotel: any = null;

  featuredRooms: any[] = [];

  loading = true;

  showAll = false;

  mapUrl!: SafeResourceUrl;

  /* ======================================================
     HOTEL SWITCH
  ====================================================== */

  hotelList = [

    {
      id: 'chipipe',
      name: 'Chipipe'
    },

    {
      id: 'palmeras',
      name: 'Palmeras'
    },

    {
      id: 'ballenita',
      name: 'Ballenita'
    }

  ];

  /* ======================================================
     CONSTRUCTOR
  ====================================================== */

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private habitacionesService: HabitacionesService,
    private hotelesService: HotelesService,
    private sanitizer: DomSanitizer
  ) {

    addIcons({

      locationOutline,
      searchOutline,
      calendarOutline,
      peopleOutline,
      bedOutline,
      sunnyOutline,
      waterOutline,
      shieldCheckmarkOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      restaurantOutline,
      thermometerOutline,
      wifiOutline,
      walkOutline,
      cafeOutline,
      carOutline

    });

  }

  /* ======================================================
     INIT
  ====================================================== */

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {

      this.slug =
        params.get('slug') || '';

      if (!this.slug) {

        console.error(
          'Slug vacío'
        );

        return;
      }

      this.loadHotel();

      this.loadRooms();

    });

  }

  /* ======================================================
     HOTEL
  ====================================================== */

  loadHotel(): void {

    this.hotelesService
      .getAll()
      .subscribe({

        next: (res: any) => {

          const hoteles =
            res.data || [];

          const found =
            hoteles.find((h: any) =>

              h.slug === this.slug ||

              h.nombre
                .toLowerCase()
                .includes(this.slug)

            );

          if (found) {

            this.hotel = {

              name:
                found.nombre,

              location:
                `${found.ciudad}`,

              description:
                found.descripcion,

              heroImage:
                found.imagen ||
                'assets/img/default.jpg',

              features: [

                'Ubicación privilegiada',
                'Alta valoración',
                'Confort garantizado'

              ],

              services: [

                {
                  name: 'WiFi gratis',
                  icon: 'wifi-outline'
                },

                {
                  name: 'Piscina',
                  icon: 'water-outline'
                },

                {
                  name: 'Restaurante',
                  icon: 'restaurant-outline'
                },

                {
                  name: 'Parqueadero',
                  icon: 'car-outline'
                }

              ],

              gallery: [

                found.imagen || 'assets/img/default.jpg',
                found.imagen || 'assets/img/default.jpg',
                found.imagen || 'assets/img/default.jpg',
                found.imagen || 'assets/img/default.jpg',
                found.imagen || 'assets/img/default.jpg'

              ]

            };

            this.buildMap();

          } else {

            this.loadHotelFallback();

          }

        },

        error: () => {

          console.warn(
            'Backend no disponible, usando fallback'
          );

          this.loadHotelFallback();

        }

      });

  }

  /* ======================================================
     FALLBACK
  ====================================================== */

  loadHotelFallback(): void {

    const hotelesMock: any = {

      chipipe: {

        name:
          'Casa Blanca Chipipe',

        location:
          'Chipipe, Salinas',

        description:
          'Frente a la playa más tranquila de Salinas.',

        heroImage:
          'assets/img/26.jpeg',

        features: [

          'Ambiente familiar',
          'Playa tranquila',
          'Ideal para descanso'

        ],

        services: [

          {
            name: 'Piscina',
            icon: 'water-outline'
          },

          {
            name: 'WiFi',
            icon: 'wifi-outline'
          },

          {
            name: 'Aire acondicionado',
            icon: 'thermometer-outline'
          },

          {
            name: 'Frente al mar',
            icon: 'sunny-outline'
          }

        ],

        gallery: [

          'assets/img/26.jpeg',
          'assets/img/26.jpeg',
          'assets/img/26.jpeg',
          'assets/img/26.jpeg',
          'assets/img/26.jpeg'

        ]

      },

      palmeras: {

        name:
          'Casa Blanca Palmeras',

        location:
          'Centro, Salinas',

        description:
          'Zona céntrica, restaurantes y vida nocturna.',

        heroImage:
          'assets/img/25.jpeg',

        features: [

          'Zona céntrica',
          'Cerca de bares',
          'Ambiente activo'

        ],

        services: [

          {
            name: 'Restaurante',
            icon: 'restaurant-outline'
          },

          {
            name: 'WiFi',
            icon: 'wifi-outline'
          },

          {
            name: 'Frente al mar',
            icon: 'sunny-outline'
          }

        ],

        gallery: [

          'assets/img/25.jpeg',
          'assets/img/25.jpeg',
          'assets/img/25.jpeg',
          'assets/img/25.jpeg',
          'assets/img/25.jpeg'

        ]

      },

      ballenita: {

        name:
          'Casa Blanca Ballenita',

        location:
          'Ballenita, Santa Elena',

        description:
          'Vista panorámica y máxima tranquilidad.',

        heroImage:
          'assets/img/27.jpeg',

        features: [

          'Vista al mar',
          'Zona tranquila',
          'Atardeceres únicos'

        ],

        services: [

          {
            name: 'Piscina',
            icon: 'water-outline'
          },

          {
            name: 'Vista al mar',
            icon: 'sunny-outline'
          },

          {
            name: 'WiFi',
            icon: 'wifi-outline'
          }

        ],

        gallery: [

          'assets/img/27.jpeg',
          'assets/img/27.jpeg',
          'assets/img/27.jpeg',
          'assets/img/27.jpeg',
          'assets/img/27.jpeg'

        ]

      }

    };

    this.hotel =
      hotelesMock[this.slug] || null;

    this.buildMap();

  }

  /* ======================================================
     MAP
  ====================================================== */

  buildMap(): void {

    const query =
      encodeURIComponent(

        this.hotel?.location ||
        'Salinas Ecuador'

      );

    this.mapUrl =
      this.sanitizer
        .bypassSecurityTrustResourceUrl(

          `https://www.google.com/maps?q=${query}&output=embed`

        );

  }

  /* ======================================================
     ROOMS
  ====================================================== */

  loadRooms(): void {

    this.loading = true;

    this.habitacionesService
      .getByHotel(this.slug)
      .subscribe({

        next: (rooms) => {

          console.log(
            'Rooms raw:',
            rooms
          );

          this.featuredRooms =
            (rooms || [])

            .map((r: any) => ({

              id:
                r.id,

              numero:
                Number(r.numero),

              name:
                `Habitación ${r.numero}`,

              desc:
                r.descripcion ||
                `Piso ${r.piso}`,

              price:
                r.precioNoche,

              image:
                r.imagenUrl ||
                'assets/img/default-room.jpg',

              available:
                r.disponible ?? true

            }))

            .sort(

              (a: any, b: any) =>
                a.numero - b.numero

            );

          this.loading = false;

        },

        error: (err: any) => {

          console.error(
            'Error cargando habitaciones:',
            err
          );

          this.loading = false;

        }

      });

  }

  /* ======================================================
     NAVIGATION
  ====================================================== */

  goToAvailability(): void {

    this.router.navigate([

      '/hotel',
      this.slug,
      'habitaciones'

    ]);

  }

  changeHotel(newSlug: string): void {

    if (newSlug === this.slug) {
      return;
    }

    this.router.navigate([

      '/hotel',
      newSlug

    ], {

      queryParamsHandling: 'merge'

    });

  }

  /* ======================================================
     ROOMS GETTERS
  ====================================================== */

  get availableRooms() {

    return this.featuredRooms
      .filter(r => r.available);

  }

  get unavailableRooms() {

    return this.featuredRooms
      .filter(r => !r.available);

  }

}