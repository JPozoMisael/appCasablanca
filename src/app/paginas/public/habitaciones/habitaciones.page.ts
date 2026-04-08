import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HabitacionesService } from '@app/core/services/habitaciones.service';

@Component({
  selector: 'app-habitaciones',
  templateUrl: './habitaciones.page.html',
  styleUrls: ['./habitaciones.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class HabitacionesPage implements OnInit {

  results: any[] = [];
  loading = false;

  // 🔹 variables usadas en HTML
  checkIn = '';
  checkOut = '';
  guestsLabel = '2 adultos';
  nights = 0;

  minPrice: number | null = null;
  maxPrice: number | null = null;

  sort: string = 'recomendado';

  constructor(private habitacionesService: HabitacionesService) {}

  ngOnInit() {
    this.loadHabitaciones();
  }

  loadHabitaciones() {
    this.loading = true;

    this.habitacionesService.getAll().subscribe({
      next: (res: any) => {
        const data = res.data ? res.data : res;
        this.results = data.map((h: any) => this.mapHabitacion(h));
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  mapHabitacion(h: any) {
    return {
      id: h.id,
      name: h.nombre || 'Habitación',
      image: h.imagen || 'assets/default-room.jpg',
      location: 'Casa Blanca',
      rating: 4.5,
      reviews: 0,
      badges: ['Disponible'],
      features: ['wifi-outline', 'car-outline'],
      pricePerNight: h.precio || 0
    };
  }

  trackById(index: number, item: any) {
    return item.id;
  }

  setSort(value: string) {
    this.sort = value;
  }

  clearFilters() {
    this.minPrice = null;
    this.maxPrice = null;
    this.sort = 'recomendado';
  }

  totalFor(r: any) {
    return r.pricePerNight;
  }

  verOpcion(r: any) {
    console.log(r);
  }

}