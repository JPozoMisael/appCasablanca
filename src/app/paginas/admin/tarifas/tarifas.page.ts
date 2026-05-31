import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonIcon, 
  IonButton, 
  IonChip, 
  IonContent, 
  IonHeader, 
  IonToolbar, 
  IonTitle
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  pricetagOutline, 
  searchOutline, 
  addCircleOutline,
  createOutline,
  trashOutline,
  constructOutline,
  saveOutline,
  closeOutline, refreshOutline } from 'ionicons/icons';
import { TarifasService, Tarifa } from '@app/core/services/tarifas.service';

@Component({
  selector: 'app-tarifas',
  standalone: true,
  imports: [CommonModule, FormsModule, IonIcon, IonButton, IonChip, IonContent, IonHeader, IonToolbar, IonTitle],
  templateUrl: './tarifas.page.html',
  styleUrls: ['./tarifas.page.scss'],
})
export class TarifasPage implements OnInit {
  searchTerm: string = '';
  modalAbierto = false;
  editando = false;
  loading = signal(true);
  
  tarifas = signal<Tarifa[]>([]);

  formData = { tipo: '', temporada: '', precio: 0 };
  editId = 0;

  tarifasFiltradas = computed(() => {
    if (!this.searchTerm) return this.tarifas();
    const term = this.searchTerm.toLowerCase();
    return this.tarifas().filter(t => t.tipo.toLowerCase().includes(term));
  });

  constructor(private tarifasService: TarifasService) {
    addIcons({addCircleOutline,refreshOutline,searchOutline,pricetagOutline,createOutline,trashOutline,closeOutline,constructOutline,saveOutline});
  }

  ngOnInit() {
    this.cargarTarifas();
  }

  cargarTarifas() {
    this.loading.set(true);
    this.tarifasService.getAll().subscribe({
      next: (tarifas) => {
        this.tarifas.set(tarifas);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargar tarifas:', err);
        this.loading.set(false);
      }
    });
  }

  abrirModal() {
    this.editando = false;
    this.formData = { tipo: '', temporada: '', precio: 0 };
    this.modalAbierto = true;
  }

  editar(t: Tarifa) {
    this.editando = true;
    this.editId = t.id;
    this.formData = { tipo: t.tipo, temporada: t.temporada, precio: t.precio };
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  guardar() {
    if (this.formData.tipo && this.formData.precio > 0) {
      if (this.editando) {
        this.tarifasService.update(this.editId, this.formData).subscribe({
          next: () => this.cargarTarifas(),
          error: (err) => console.error('Error actualizar:', err)
        });
      } else {
        this.tarifasService.create(this.formData).subscribe({
          next: () => this.cargarTarifas(),
          error: (err) => console.error('Error crear:', err)
        });
      }
    }
    this.cerrarModal();
  }

  eliminar(t: Tarifa) {
    if (confirm(`¿Eliminar tarifa para ${t.tipo} - ${t.temporada}?`)) {
      this.tarifasService.delete(t.id).subscribe({
        next: (success) => {
          if (success) this.cargarTarifas();
        },
        error: (err) => console.error('Error eliminar:', err)
      });
    }
  }
}