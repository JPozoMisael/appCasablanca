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
  imports: [IonicModule, CommonModule, FormsModule]
})
export class HabitacionesPage implements OnInit {

  // ================= STATE =================
  loading = false;
  habitaciones: any[] = [];
  slug: string = '';

  filters: any = {};

  // 🔥 FILTROS UI
  precioMin: number = 0;
  precioMax: number = 500;
  capacidad: number = 1;
  sort: string = 'precio_asc';

  // 🔥 PAGINACIÓN
  page: number = 1;
  limit: number = 10;
  total: number = 0;
  pages: number = 0;

  constructor(
    private habitacionesService: HabitacionesService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  // ================= INIT =================
  ngOnInit() {

    this.slug = this.route.snapshot.paramMap.get('slug') || '';

    this.route.queryParams.subscribe(params => {

      this.filters = {
        checkIn: params['checkIn'],
        checkOut: params['checkOut'],
        adults: Number(params['adults'] ?? 2),
        children: Number(params['children'] ?? 0),
        rooms: Number(params['rooms'] ?? 1),
        withPets: Number(params['withPets'] ?? 0)
      };

      // RESET PAGINACIÓN
      this.page = 1;

      this.loadHabitaciones();
    });
  }

  // ================= LOAD =================
  loadHabitaciones() {

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
      .getDisponiblesByHotel(this.slug, finalFilters)
      .subscribe({

        next: (res) => {

          // 🔥 DATA
          this.habitaciones = res?.data || [];

          // 🔥 META
          this.total = res?.meta?.total || 0;
          this.pages = res?.meta?.pages || 0;

          this.loading = false;
        },

        error: (err) => {
          console.error('ERROR CARGANDO HABITACIONES:', err);
          this.loading = false;
        }
      });
  }

  // ================= FILTROS =================
  applyFilters() {
    this.page = 1;
    this.loadHabitaciones();
  }

  // ================= PAGINACIÓN =================
  nextPage() {
    if (this.page < this.pages) {
      this.page++;
      this.loadHabitaciones();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadHabitaciones();
    }
  }

  // ================= NAV =================
  goToDetalle(h: any) {
    this.router.navigate(['/habitacion-detalle', h.id], {
      queryParams: this.filters
    });
  }

  // ================= PERF =================
  trackById(index: number, item: any) {
    return item.id;
  }

}