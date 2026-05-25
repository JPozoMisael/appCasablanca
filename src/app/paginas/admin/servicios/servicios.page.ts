import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonIcon, IonButton, IonChip, IonContent } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  restaurantOutline, 
  searchOutline, 
  addCircleOutline,
  createOutline,
  trashOutline,
  constructOutline,
  saveOutline,
  closeOutline,
  wifiOutline,
  waterOutline,
  carOutline,
  snowOutline,
  beerOutline
} from 'ionicons/icons';

interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  estado: 'activo' | 'inactivo';
  icono: string;
}

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [CommonModule, FormsModule, IonIcon, IonButton, IonChip, IonContent],
  templateUrl: './servicios.page.html',
  styleUrls: ['./servicios.page.scss'],
})
export class ServiciosPage implements OnInit {
  searchTerm = '';
  modalAbierto = false;
  editando = false;
  
  servicios = signal<Servicio[]>([
    { id: 1, nombre: 'Desayuno Buffet', descripcion: 'Desayuno americano completo', precio: 15, estado: 'activo', icono: 'restaurant-outline' },
    { id: 2, nombre: 'Spa', descripcion: 'Masajes y tratamientos', precio: 50, estado: 'activo', icono: 'water-outline' },
    { id: 3, nombre: 'Traslado Aeropuerto', descripcion: 'Ida y vuelta', precio: 35, estado: 'activo', icono: 'car-outline' },
  ]);

  formData = { nombre: '', descripcion: '', precio: 0, icono: 'restaurant-outline' };
  editId = 0;

  serviciosFiltrados = computed(() => {
    if (!this.searchTerm) return this.servicios();
    return this.servicios().filter(s => s.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()));
  });

  constructor() {
    addIcons({
      restaurantOutline,
      searchOutline,
      addCircleOutline,
      createOutline,
      trashOutline,
      constructOutline,
      saveOutline,
      closeOutline,
      wifiOutline,
      waterOutline,
      carOutline,
      snowOutline,
      beerOutline
    });
  }

  ngOnInit() {}

  abrirModal() {
    this.editando = false;
    this.formData = { nombre: '', descripcion: '', precio: 0, icono: 'restaurant-outline' };
    this.modalAbierto = true;
  }

  editar(s: Servicio) {
    this.editando = true;
    this.editId = s.id;
    this.formData = { nombre: s.nombre, descripcion: s.descripcion, precio: s.precio, icono: s.icono };
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  guardar() {
    if (this.editando) {
      this.servicios.set(this.servicios().map(s => s.id === this.editId ? { ...s, ...this.formData } : s));
    } else {
      const newId = Math.max(...this.servicios().map(s => s.id), 0) + 1;
      this.servicios.set([...this.servicios(), { id: newId, ...this.formData, estado: 'activo' }]);
    }
    this.cerrarModal();
  }

  eliminar(s: Servicio) {
    if (confirm(`¿Eliminar ${s.nombre}?`)) {
      this.servicios.set(this.servicios().filter(x => x.id !== s.id));
    }
  }
}