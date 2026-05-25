import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonIcon, IonButton, IonChip, IonContent } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cardOutline, searchOutline, eyeOutline, downloadOutline } from 'ionicons/icons';

interface Pago {
  id: number;
  reserva: string;
  huesped: string;
  monto: number;
  fecha: string;
  metodo: 'tarjeta' | 'efectivo' | 'transferencia';
  estado: 'pagado' | 'pendiente' | 'reembolsado';
}

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [CommonModule, FormsModule, IonIcon, IonButton, IonChip, IonContent],
  templateUrl: './pagos.page.html',
  styleUrls: ['./pagos.page.scss'],
})
export class PagosPage implements OnInit {
  searchTerm = '';

  pagos = signal<Pago[]>([
    { id: 1, reserva: 'RES-3001', huesped: 'Carlos Ruiz', monto: 120, fecha: '2026-05-20', metodo: 'tarjeta', estado: 'pagado' },
    { id: 2, reserva: 'RES-3002', huesped: 'María Paredes', monto: 95, fecha: '2026-05-21', metodo: 'efectivo', estado: 'pagado' },
    { id: 3, reserva: 'RES-3003', huesped: 'Kevin Andrade', monto: 150, fecha: '2026-05-22', metodo: 'transferencia', estado: 'pendiente' },
  ]);

  pagosFiltrados = computed(() => {
    if (!this.searchTerm) return this.pagos();
    const term = this.searchTerm.toLowerCase();
    return this.pagos().filter(p => 
      p.reserva.toLowerCase().includes(term) || 
      p.huesped.toLowerCase().includes(term)
    );
  });

  constructor() {
    addIcons({ cardOutline, searchOutline, eyeOutline, downloadOutline });
  }

  ngOnInit() {}
}