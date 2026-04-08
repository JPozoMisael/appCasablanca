import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { HabitacionesService } from '@app/core/services/habitaciones.service';

@Component({
  selector: 'app-habitaciones',
  templateUrl: './habitaciones.page.html',
  styleUrls: ['./habitaciones.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class HabitacionesPage implements OnInit {

  // ================= ESTADO =================
  loading = false;
  habitaciones: any[] = [];

  // ================= FILTROS / INFO =================
  checkIn = '';
  checkOut = '';
  guestsLabel = '2 adultos';
  nights = 0;

  minPrice: number | null = null;
  maxPrice: number | null = null;

  sort: string = 'numero'; // 🔥 por defecto ordenado

  constructor(
    private habitacionesService: HabitacionesService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadHabitaciones();
  }

  // ================= CARGA DE DATA =================
  loadHabitaciones() {
    this.loading = true;

    this.habitacionesService.getAll().subscribe({
      next: (res: any) => {
        const data = res?.data ?? res ?? [];

        const mapped = data.map((h: any) => this.mapHabitacion(h));

        // 🔥 ORDENAMIENTO APLICADO AQUÍ
        this.habitaciones = this.applySort(mapped);

        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando habitaciones:', err);
        this.loading = false;
      }
    });
  }

  // ================= MAPEO =================
  mapHabitacion(h: any) {
    return {
      id: h.id,
      numero: h.numero || h.id,
      precio: h.precio || 0,
      descripcion: h.descripcion || 'Habitación cómoda y equipada',
      capacidad: h.capacidad || 2,
      camas: h.camas || 1,
      bano: h.bano ?? true,
      imagen: h.imagen || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2'
    };
  }

  // ================= ORDENAMIENTO =================
  applySort(data: any[]) {
    switch (this.sort) {

      case 'precio':
        return data.sort((a, b) => a.precio - b.precio);

      case 'numero':
        return data.sort((a, b) => Number(a.numero) - Number(b.numero));

      default:
        return data;
    }
  }

  setSort(value: string) {
    this.sort = value;
    this.habitaciones = this.applySort([...this.habitaciones]);
  }

  // ================= ACCIONES =================
  clearFilters() {
    this.minPrice = null;
    this.maxPrice = null;
    this.sort = 'numero';

    this.checkIn = '';
    this.checkOut = '';
    this.nights = 0;
    this.guestsLabel = '2 adultos';

    this.loadHabitaciones(); // 🔥 recarga limpia
  }

  openFilters() {
    console.log('Abrir filtros');
  }

  goToDetalle(h: any) {
    this.router.navigate(['/habitacion-detalle', h.id]);
  }

  // ================= UTILIDADES =================
  totalFor(h: any) {
    return h.precio;
  }

  trackById(index: number, item: any) {
    return item.id;
  }

}