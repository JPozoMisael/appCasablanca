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
  beerOutline, refreshOutline } from 'ionicons/icons';
import { ServiciosService, Servicio } from '@app/core/services/servicios.service';

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
  loading = signal(true);
  
  servicios = signal<Servicio[]>([]);

  formData = { nombre: '', descripcion: '', precio: 0, icono: 'restaurant-outline' };
  editId = 0;

  serviciosFiltrados = computed(() => {
    if (!this.searchTerm) return this.servicios();
    return this.servicios().filter(s => s.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()));
  });

  constructor(private serviciosService: ServiciosService) {
    addIcons({addCircleOutline,refreshOutline,searchOutline,restaurantOutline,createOutline,trashOutline,closeOutline,constructOutline,saveOutline,wifiOutline,waterOutline,carOutline,snowOutline,beerOutline});
  }

  ngOnInit() {
    this.cargarServicios();
  }

  cargarServicios() {
    this.loading.set(true);
    this.serviciosService.getAll().subscribe({
      next: (servicios) => {
        this.servicios.set(servicios);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargar servicios:', err);
        this.loading.set(false);
      }
    });
  }

  abrirModal() {
    this.editando = false;
    this.formData = { nombre: '', descripcion: '', precio: 0, icono: 'restaurant-outline' };
    this.modalAbierto = true;
  }

  editar(s: Servicio) {
    this.editando = true;
    this.editId = s.id;
    this.formData = { 
      nombre: s.nombre, 
      descripcion: s.descripcion, 
      precio: s.precio, 
      icono: s.icono 
    };
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  guardar() {
    if (this.formData.nombre && this.formData.precio > 0) {
      if (this.editando) {
        this.serviciosService.update(this.editId, this.formData).subscribe({
          next: () => this.cargarServicios(),
          error: (err) => console.error('Error actualizar:', err)
        });
      } else {
        this.serviciosService.create(this.formData).subscribe({
          next: () => this.cargarServicios(),
          error: (err) => console.error('Error crear:', err)
        });
      }
    }
    this.cerrarModal();
  }

  eliminar(s: Servicio) {
    if (confirm(`¿Eliminar ${s.nombre}?`)) {
      this.serviciosService.delete(s.id).subscribe({
        next: (success) => {
          if (success) this.cargarServicios();
        },
        error: (err) => console.error('Error eliminar:', err)
      });
    }
  }
}