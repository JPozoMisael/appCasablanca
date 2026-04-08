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

  constructor(
    private habitacionesService: HabitacionesService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    //  CLAVE: obtener slug del hotel
    this.slug = this.route.snapshot.paramMap.get('slug') || '';

    console.log('HOTEL SLUG:', this.slug);

    this.loadHabitaciones();
  }

  loadHabitaciones() {
    this.loading = true;

    //  CLAVE: usar filtro por hotel
    this.habitacionesService.getByHotel(this.slug).subscribe({
      next: (res: any) => {

        console.log('HABITACIONES POR HOTEL:', res);

        this.habitaciones = res
          .map((h: any) => this.mapHabitacion(h))
          .sort((a: any, b: any) => Number(a.numero) - Number(b.numero));

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
      descripcion: h.descripcion || 'Habitación cómoda con excelente ubicación',
      capacidad: h.capacidad || 2,
      camas: h.camas || 1,
      bano: h.bano ?? true,
      imagen: h.imagen || h.imagenUrl || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2'
    };
  }

  goToDetalle(h: any) {
    this.router.navigate(['/habitacion-detalle', h.id]);
  }

  trackById(index: number, item: any) {
    return item.id;
  }
}