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

  loading = false;
  habitaciones: any[] = [];
  slug: string = '';

  filters: any = {};

  constructor(
    private habitacionesService: HabitacionesService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {

    this.slug = this.route.snapshot.paramMap.get('slug') || '';
    console.log('HOTEL SLUG:', this.slug);

    this.route.queryParams.subscribe(params => {

      console.log('FILTROS RECIBIDOS:', params);

      this.filters = {
        checkIn: params['checkIn'],
        checkOut: params['checkOut'],
        adults: params['adults'],
        children: params['children'],
        rooms: params['rooms'],
        withPets: params['withPets']
      };

      this.loadHabitaciones();
    });
  }

  loadHabitaciones() {
  this.loading = true;

  const hasFilters = this.filters?.checkIn && this.filters?.checkOut;

  const request$ = hasFilters
    ? this.habitacionesService.getDisponiblesByHotel(this.slug, this.filters)
    : this.habitacionesService.getByHotel(this.slug);

  request$.subscribe({

    next: (res: any[]) => {

      console.log('HABITACIONES RESULTADO:', res);

      this.habitaciones = res.sort(
        (a: any, b: any) => Number(a.numero) - Number(b.numero)
      );

      this.loading = false;
    },

    error: (err) => {
      console.error('ERROR CARGANDO HABITACIONES:', err);
      this.loading = false;
    }
  });
}

  mapHabitacion(h: any) {
    return {
      id: h.id,
      numero: h.numero || h.numero_habitacion || h.id,
      precio: h.precio || h.precioNoche || 0,
      descripcion:
        h.descripcion ||
        'Habitación cómoda con excelente ubicación',
      capacidad: h.capacidad || 2,
      camas: h.camas || 1,
      bano: h.bano ?? true,
      imagen:
        h.imagen ||
        h.imagenUrl ||
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2'
    };
  }

  goToDetalle(h: any) {
    this.router.navigate(['/habitacion-detalle', h.id], {
      queryParams: this.filters 
    });
  }

  trackById(index: number, item: any) {
    return item.id;
  }
}