import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { HabitacionesService } from '@app/core/services/habitaciones.service';

@Component({
  selector: 'app-habitaciones',
  templateUrl: './habitaciones.page.html',
  styleUrls: ['./habitaciones.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ]
})
export class HabitacionesPage implements OnInit {

  // =====================================================
  // STATE
  // =====================================================

  loading = false;

  habitaciones: any[] = [];

  slug: string = '';

  filters: any = {};

  // =====================================================
  // UI FILTERS
  // =====================================================

  precioMin: number = 0;

  precioMax: number = 500;

  capacidad: number = 1;

  sort: string = 'recomendado';

  cancelacionGratis = false;

  desayunoIncluido = false;

  // =====================================================
  // PAGINATION
  // =====================================================

  page: number = 1;

  limit: number = 10;

  total: number = 0;

  pages: number = 0;

  // =====================================================
  // SEARCH INFO
  // =====================================================

  checkIn = '';

  checkOut = '';

  adults = 2;

  children = 0;

  rooms = 1;

  nights = 1;

  // =====================================================
  // HOTEL INFO
  // =====================================================

  hotelName = 'Casa Blanca';

  hotelLocation = 'Salinas, Ecuador';

  constructor(
    private habitacionesService: HabitacionesService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.slug =
      this.route.snapshot.paramMap.get('slug') || '';

    this.resolveHotelInfo();

    this.route.queryParams.subscribe(params => {

      // =================================================
      // SEARCH FILTERS
      // =================================================

      this.filters = {

        checkIn: params['checkIn'],

        checkOut: params['checkOut'],

        adults: Number(params['adults'] ?? 2),

        children: Number(params['children'] ?? 0),

        rooms: Number(params['rooms'] ?? 1),

        withPets: Number(params['withPets'] ?? 0)
      };

      // =================================================
      // SUMMARY
      // =================================================

      this.checkIn = params['checkIn'] || '';

      this.checkOut = params['checkOut'] || '';

      this.adults =
        Number(params['adults'] ?? 2);

      this.children =
        Number(params['children'] ?? 0);

      this.rooms =
        Number(params['rooms'] ?? 1);

      this.calculateNights();

      // =================================================
      // RESET PAGE
      // =================================================

      this.page = 1;

      this.loadHabitaciones();
    });
  }

  // =====================================================
  // LOAD
  // =====================================================

  loadHabitaciones(): void {

    this.loading = true;

    const finalFilters = {

      ...this.filters,

      precioMin: this.precioMin,

      precioMax: this.precioMax,

      capacidad: this.capacidad,

      sort: this.sort,

      page: this.page,

      limit: this.limit
    };

    this.habitacionesService
      .getDisponiblesByHotel(
        this.slug,
        finalFilters
      )
      .subscribe({

        next: (res) => {

          // =============================================
          // DATA
          // =============================================

          const data = res?.data || [];

          this.habitaciones = data.map((h: any) => ({

            ...h,

            rating:
              h.rating ||
              this.randomRating(),

            reviews:
              h.reviews ||
              this.randomReviews(),

            camas:
              h.camas || 1,

            score:
              h.score || 950,

            imagenUrl:
              h.imagenUrl ||
              'assets/img/default-room.jpg',

            descripcion:
              h.descripcion ||
              'Habitación moderna y confortable ideal para disfrutar tu estadía frente al mar.',

            precioNoche:
              h.precioNoche ||
              h.precio ||
              55
          }));

          // =============================================
          // META
          // =============================================

          this.total =
            res?.meta?.total || 0;

          this.pages =
            res?.meta?.pages || 0;

          this.loading = false;
        },

        error: (err) => {

          console.error(
            'ERROR CARGANDO HABITACIONES:',
            err
          );

          this.loading = false;
        }
      });
  }

  // =====================================================
  // HOTEL INFO
  // =====================================================

  resolveHotelInfo(): void {

    switch (this.slug) {

      case 'palmeras':

        this.hotelName =
          'Casa Blanca Palmeras';

        this.hotelLocation =
          'Salinas Centro';

        break;

      case 'chipipe':

        this.hotelName =
          'Casa Blanca Chipipe';

        this.hotelLocation =
          'Chipipe, Salinas';

        break;

      case 'ballenita':

        this.hotelName =
          'Casa Blanca Ballenita';

        this.hotelLocation =
          'Santa Elena, Ballenita';

        break;

      default:

        this.hotelName =
          'Casa Blanca';

        this.hotelLocation =
          'Salinas, Ecuador';
    }
  }

  // =====================================================
  // NIGHTS
  // =====================================================

  calculateNights(): void {

    if (!this.checkIn || !this.checkOut) {

      this.nights = 1;

      return;
    }

    const start =
      new Date(this.checkIn);

    const end =
      new Date(this.checkOut);

    const diff =
      end.getTime() - start.getTime();

    const total =
      Math.ceil(
        diff / (1000 * 60 * 60 * 24)
      );

    this.nights =
      total > 0 ? total : 1;
  }

  // =====================================================
  // FILTERS
  // =====================================================

  applyFilters(): void {

    this.page = 1;

    this.loadHabitaciones();
  }

  clearFilters(): void {

    this.precioMin = 0;

    this.precioMax = 500;

    this.capacidad = 1;

    this.cancelacionGratis = false;

    this.desayunoIncluido = false;

    this.sort = 'recomendado';

    this.applyFilters();
  }

  // =====================================================
  // PAGINATION
  // =====================================================

  nextPage(): void {

    if (this.page < this.pages) {

      this.page++;

      this.loadHabitaciones();
    }
  }

  prevPage(): void {

    if (this.page > 1) {

      this.page--;

      this.loadHabitaciones();
    }
  }

  // =====================================================
  // NAVIGATION
  // =====================================================

  goToDetalle(h: any): void {

    this.router.navigate(
      ['/habitacion-detalle', h.id],
      {
        queryParams: this.filters
      }
    );
  }

  editSearch(): void {

    this.router.navigate(
      ['/hotel', this.slug]
    );
  }

  // =====================================================
  // HELPERS
  // =====================================================

  guestsText(): string {

    const totalGuests =
      this.adults + this.children;

    return `${totalGuests} huésped(es), ${this.rooms} habitación(es)`;
  }

  randomRating(): number {

    return Number(
      (8 + Math.random() * 1.8).toFixed(1)
    );
  }

  randomReviews(): number {

    return Math.floor(
      120 + Math.random() * 1500
    );
  }

  getRatingText(rating: number): string {

    if (rating >= 9) {
      return 'Fantástico';
    }

    if (rating >= 8.5) {
      return 'Muy bien';
    }

    if (rating >= 8) {
      return 'Excelente';
    }

    return 'Bueno';
  }

  // =====================================================
  // TRACK
  // =====================================================

  trackById(
    index: number,
    item: any
  ): number {

    return item.id;
  }

}