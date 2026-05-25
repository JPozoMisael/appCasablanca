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
  closeOutline
} from 'ionicons/icons';

interface Tarifa {
  id: number;
  tipo: string;
  temporada: string;
  precio: number;
  estado: 'activo' | 'inactivo';
}

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
  
  tarifas = signal<Tarifa[]>([
    { id: 1, tipo: 'Simple', temporada: 'Alta', precio: 120, estado: 'activo' },
    { id: 2, tipo: 'Doble', temporada: 'Alta', precio: 180, estado: 'activo' },
    { id: 3, tipo: 'Suite', temporada: 'Alta', precio: 250, estado: 'activo' },
    { id: 4, tipo: 'Simple', temporada: 'Baja', precio: 80, estado: 'activo' },
  ]);

  formData = { tipo: '', temporada: '', precio: 0 };
  editId = 0;

  tarifasFiltradas = computed(() => {
    if (!this.searchTerm) return this.tarifas();
    const term = this.searchTerm.toLowerCase();
    return this.tarifas().filter(t => t.tipo.toLowerCase().includes(term));
  });

  constructor() {
    addIcons({
      pricetagOutline,
      searchOutline,
      addCircleOutline,
      createOutline,
      trashOutline,
      constructOutline,
      saveOutline,
      closeOutline
    });
  }

  ngOnInit() {}

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
    if (this.editando) {
      this.tarifas.set(this.tarifas().map(t => t.id === this.editId ? { ...t, ...this.formData } : t));
    } else {
      const newId = Math.max(...this.tarifas().map(t => t.id), 0) + 1;
      this.tarifas.set([...this.tarifas(), { id: newId, ...this.formData, estado: 'activo' }]);
    }
    this.cerrarModal();
  }

  eliminar(t: Tarifa) {
    if (confirm(`¿Eliminar tarifa para ${t.tipo} - ${t.temporada}?`)) {
      this.tarifas.set(this.tarifas().filter(x => x.id !== t.id));
    }
  }
}