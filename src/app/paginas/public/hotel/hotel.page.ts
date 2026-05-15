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
  carOutline,
  businessOutline,
  tvOutline,
 snowOutline,
  starOutline,
  heartOutline,
  timeOutline,
  mapOutline,
  heart,
  imagesOutline,
  chevronForwardOutline,
  navigateOutline

} from 'ionicons/icons';

import { HabitacionesService } from '@app/core/services/habitaciones.service';
import { HotelesService } from '@app/core/services/hotel.service';

/* ======================================================
   INTERFACES
====================================================== */

interface HotelServiceItem {

  name: string;

  icon: string;

}

interface NearbyPlace {

  name: string;

  distance: string;

  icon: string;

}

interface HotelReview {

  name: string;

  country: string;

  text: string;

  score: number;

}

interface HotelData {

  slug: string;

  name: string;

  location: string;

  address: string;

  description: string;

  heroImage: string;

  gallery: string[];

  lat: number;

  lng: number;

  score: number;

  reviews: number;

  price: number;

  oldPrice?: number;

  stars?: number;

  features: string[];

  services: HotelServiceItem[];

  nearbyPlaces: NearbyPlace[];

}

interface RoomData {

  id: number;

  numero: number;

  name: string;

  desc: string;

  price: number;

  oldPrice?: number;

  discount?: number;

  image: string;

  available: boolean;

  capacity?: number;

  size?: number;

  benefits?: string[];

}

/* ======================================================
   COMPONENT
====================================================== */

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

  slug = '';

  hotel: HotelData | null = null;

  featuredRooms: RoomData[] = [];

  loading = true;

  mapUrl!: SafeResourceUrl;

  roomsPreviewCount = 3;

  isFavorite = false;

  galleryOpen = false;

  selectedImageIndex = 0;

  /* ======================================================
     SEARCH
  ====================================================== */

  checkIn = '';

  checkOut = '';

  adults = 2;

  children = 0;

  rooms = 1;

  /* ======================================================
     REVIEWS
  ====================================================== */

  reviewCategories = [

    {
      name: 'Ubicación',
      value: 9.4
    },

    {
      name: 'Limpieza',
      value: 9.0
    },

    {
      name: 'Confort',
      value: 8.9
    },

    {
      name: 'Servicio',
      value: 9.2
    },

    {
      name: 'Relación calidad-precio',
      value: 8.8
    }

  ];

  hotelReviews: HotelReview[] = [

    {

      name: 'Carlos',
      country: 'Ecuador',
      text:
        'Excelente ubicación y habitaciones muy cómodas frente al mar.',

      score: 9

    },

    {

      name: 'Andrea',
      country: 'Colombia',
      text:
        'Muy buena atención y piscina espectacular.',

      score: 10

    },

    {

      name: 'John',
      country: 'Estados Unidos',
      text:
        'Muy limpio y tranquilo. Perfecto para descansar.',

      score: 9

    }

  ];

  /* ======================================================
     HOTELS
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
      carOutline,
      businessOutline,
      tvOutline,
      snowOutline,
      starOutline,
      heartOutline,
      timeOutline,
      mapOutline,
      heart,
      imagesOutline,
      chevronForwardOutline,
      navigateOutline

    });

  }

  /* ======================================================
     INIT
  ====================================================== */

  ngOnInit(): void {

    this.route.queryParamMap.subscribe(query => {

      this.checkIn =
        query.get('checkIn') || '';

      this.checkOut =
        query.get('checkOut') || '';

      this.adults =
        Number(query.get('adults')) || 2;

      this.children =
        Number(query.get('children')) || 0;

      this.rooms =
        Number(query.get('rooms')) || 1;

    });

    this.route.paramMap.subscribe(params => {

      this.slug =
        params.get('slug') || '';

      if (!this.slug) {

        console.error('Slug vacío');

        return;

      }

      this.loadHotel();

    });

  }

  /* ======================================================
     IMAGE FALLBACK
  ====================================================== */

  onImageError(event: any): void {

    event.target.src =
      'assets/img/default-room.jpg';

  }

  /* ======================================================
     GALLERY HELPERS
  ====================================================== */

  get validGallery(): string[] {

    if (
      !this.hotel?.gallery ||
      !this.hotel.gallery.length
    ) {

      return [

        'assets/img/1.PNG',
        'assets/img/2.PNG',
        'assets/img/3.PNG',
        'assets/img/4.PNG',
        'assets/img/5.PNG'

      ];

    }

    return this.hotel.gallery.filter(

      (img: string) =>

        !!img &&
        img !== 'null' &&
        img !== 'undefined'

    );

  }

  get coverImage(): string {

    return (

      this.validGallery[0] ||

      this.hotel?.heroImage ||

      'assets/img/default-room.jpg'

    );

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
                ?.toLowerCase()
                ?.includes(this.slug)

            );

          if (found) {

            this.hotel = {

              slug:
                found.slug,

              name:
                found.nombre,

              location:
                found.ciudad || 'Salinas',

              address:
                found.direccion ||
                'Salinas, Santa Elena',

              description:
                found.descripcion,

              heroImage:
                found.imagen ||
                'assets/img/1.PNG',

              gallery:

                Array.isArray(found.galeria) &&
                found.galeria.length

                  ? found.galeria

                  : [

                    found.imagen ||
                    'assets/img/1.PNG',

                    'assets/img/2.PNG',
                    'assets/img/3.PNG',
                    'assets/img/4.PNG',
                    'assets/img/5.PNG'

                  ],

              lat:
                found.lat || -2.2147,

              lng:
                found.lng || -80.9515,

              score:
                found.rating || 9.1,

              reviews:
                found.totalReviews || 324,

              price:
                found.precio_desde || 85,

              oldPrice:
                (found.precio_desde || 85) + 20,

              stars:
                4,

              features: [

                'Excelente ubicación',
                'Frente al mar',
                'Alta valoración'

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
                },

                {
                  name: 'TV Smart',
                  icon: 'tv-outline'
                },

                {
                  name: 'Aire acondicionado',
                  icon: 'snow-outline'
                }

              ],

              nearbyPlaces: [

                {
                  name: 'Playa principal',
                  distance: '120 m',
                  icon: 'walk-outline'
                },

                {
                  name: 'Malecón Salinas',
                  distance: '450 m',
                  icon: 'navigate-outline'
                },

                {
                  name: 'Zona gastronómica',
                  distance: '300 m',
                  icon: 'restaurant-outline'
                }

              ]

            };

            this.buildMap();

            this.loadRooms();

          }

          else {

            this.loadHotelFallback();

          }

        },

        error: () => {

          this.loadHotelFallback();

        }

      });

  }

  /* ======================================================
     FALLBACK
  ====================================================== */

  loadHotelFallback(): void {

    this.hotel = {

      slug: this.slug,

      name:
        `Casa Blanca ${this.slug}`,

      location:
        'Salinas',

      address:
        'Salinas, Ecuador',

      description:
        'Disfruta una experiencia premium frente al mar.',

      heroImage:
        'assets/img/1.PNG',

      gallery: [

        'assets/img/1.PNG',
        'assets/img/2.PNG',
        'assets/img/3.PNG',
        'assets/img/4.PNG',
        'assets/img/5.PNG'

      ],

      lat:
        -2.2147,

      lng:
        -80.9515,

      score:
        9.1,

      reviews:
        324,

      price:
        85,

      oldPrice:
        105,

      stars:
        4,

      features: [

        'Frente al mar',
        'Piscina',
        'Ideal para familias'

      ],

      services: [

        {
          name: 'WiFi',
          icon: 'wifi-outline'
        },

        {
          name: 'Piscina',
          icon: 'water-outline'
        }

      ],

      nearbyPlaces: [

        {
          name: 'Playa',
          distance: '120 m',
          icon: 'walk-outline'
        }

      ]

    };

    this.buildMap();

    this.loadRooms();

  }

  /* ======================================================
     MAP
  ====================================================== */

  buildMap(): void {

    if (
      !this.hotel?.lat ||
      !this.hotel?.lng
    ) {
      return;
    }

    this.mapUrl =
      this.sanitizer
        .bypassSecurityTrustResourceUrl(

          `https://www.google.com/maps?q=${this.hotel.lat},${this.hotel.lng}&z=15&output=embed`

        );

  }

  openGoogleMaps(): void {

    if (
      !this.hotel?.lat ||
      !this.hotel?.lng
    ) {
      return;
    }

    window.open(

      `https://www.google.com/maps?q=${this.hotel.lat},${this.hotel.lng}`,

      '_blank'

    );

  }

  /* ======================================================
     ROOMS
  ====================================================== */

  loadRooms(): void {

    this.loading = true;

    this.habitacionesService

      .getDisponiblesByHotel(

        this.slug,

        {

          checkIn:
            this.checkIn,

          checkOut:
            this.checkOut,

          adults:
            this.adults,

          children:
            this.children,

          rooms:
            this.rooms,

          limit:
            this.roomsPreviewCount

        }

      )

      .subscribe({

        next: (res: any) => {

          const rooms =
            res?.data || [];

          this.featuredRooms =

            rooms

            .map((r: any) => ({

              id:
                r.id,

              numero:
                Number(r.numero),

              name:

                r.tipo ||

                `Habitación ${r.numero}`,

              desc:

                r.descripcion ||

                'Habitación premium',

              price:
                r.precioNoche || 85,

              oldPrice:
                (r.precioNoche || 85) + 20,

              discount:
                20,

              image:

                r.imagenUrl ||

                this.coverImage ||

                'assets/img/default-room.jpg',

              available:
                r.estado === 'disponible',

              capacity:
                r.capacidad || 2,

              size:
                32,

              benefits: [

                'Cancelación flexible',
                'WiFi gratis',
                'Aire acondicionado'

              ]

            }))

            .sort(

              (a: RoomData, b: RoomData) =>

                a.numero - b.numero

            );

          this.loading = false;

        },

        error: (err: any) => {

          console.error(
            'Error habitaciones:',
            err
          );

          this.loading = false;

        }

      });

  }

  /* ======================================================
     GALLERY
  ====================================================== */

  openGallery(index = 0): void {

    this.selectedImageIndex =
      index;

    this.galleryOpen = true;

  }

  closeGallery(): void {

    this.galleryOpen = false;

  }

  nextImage(): void {

    if (!this.hotel) {
      return;
    }

    this.selectedImageIndex =

      (this.selectedImageIndex + 1) %

      this.hotel.gallery.length;

  }

  prevImage(): void {

    if (!this.hotel) {
      return;
    }

    this.selectedImageIndex =

      (
        this.selectedImageIndex - 1 +
        this.hotel.gallery.length
      ) %

      this.hotel.gallery.length;

  }

  /* ======================================================
     FAVORITES
  ====================================================== */

  toggleFavorite(): void {

    this.isFavorite =
      !this.isFavorite;

  }

  /* ======================================================
     SCROLL
  ====================================================== */

  scrollToRooms(): void {

    const el =
      document.getElementById('rooms-section');

    el?.scrollIntoView({

      behavior: 'smooth'

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

    ], {

      queryParams: {

        checkIn:
          this.checkIn,

        checkOut:
          this.checkOut,

        adults:
          this.adults,

        children:
          this.children,

        rooms:
          this.rooms

      }

    });

  }

  showAllRooms(): void {

    this.goToAvailability();

  }

  changeHotel(newSlug: string): void {

    if (newSlug === this.slug) {
      return;
    }

    this.router.navigate([

      '/hotel',
      newSlug

    ], {

      queryParamsHandling:
        'merge'

    });

  }

  /* ======================================================
     GETTERS
  ====================================================== */

  get availableRooms(): RoomData[] {

    return this.featuredRooms
      .filter(r => r.available);

  }

  get previewRooms(): RoomData[] {

    return this.availableRooms
      .slice(0, this.roomsPreviewCount);

  }

  get hasMoreRooms(): boolean {

    return this.availableRooms.length >
      this.roomsPreviewCount;

  }

}