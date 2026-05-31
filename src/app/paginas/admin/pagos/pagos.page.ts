import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonIcon, IonButton, IonChip, IonContent } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cardOutline, searchOutline, eyeOutline, downloadOutline } from 'ionicons/icons';
import { PagosService, Pago } from '@app/core/services/pagos.service';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonIcon, 
    IonButton, 
    IonChip, 
    IonContent
  ],
  templateUrl: './pagos.page.html',
  styleUrls: ['./pagos.page.scss'],
})
export class PagosPage implements OnInit {
  searchTerm = '';
  loading = signal(true);
  pagos = signal<Pago[]>([]);

  pagosFiltrados = computed(() => {
    if (!this.searchTerm) return this.pagos();
    const term = this.searchTerm.toLowerCase();
    return this.pagos().filter(p => 
      (p.codigo_reserva || '').toLowerCase().includes(term) || 
      (p.huesped || '').toLowerCase().includes(term)
    );
  });

  constructor(private pagosService: PagosService) {
    addIcons({ cardOutline, searchOutline, eyeOutline, downloadOutline });
  }

  ngOnInit() {
    this.cargarPagos();
  }

  cargarPagos() {
    this.loading.set(true);
    this.pagosService.getAll().subscribe({
      next: (pagos) => {
        this.pagos.set(pagos);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargar pagos:', err);
        this.loading.set(false);
      }
    });
  }

  formatMetodo(metodo: string): string {
    const metodos: Record<string, string> = {
      tarjeta: 'Tarjeta',
      efectivo: 'Efectivo',
      transferencia: 'Transferencia',
      paypal: 'PayPal',
      deposito: 'Depósito'
    };
    return metodos[metodo] || metodo;
  }

  formatEstado(estado: string): string {
    const estados: Record<string, string> = {
      pagado: 'Pagado',
      pendiente: 'Pendiente',
      aprobado: 'Aprobado',
      rechazado: 'Rechazado',
      anulado: 'Anulado'
    };
    return estados[estado] || estado;
  }

  getEstadoClass(estado: string): string {
    if (estado === 'pagado' || estado === 'aprobado') return 'pagado';
    if (estado === 'pendiente') return 'pendiente';
    return '';
  }

  verDetalle(pago: Pago) {
    alert(`Pago #${pago.id}\nReserva: ${pago.codigo_reserva || pago.reserva_id}\nHuésped: ${pago.huesped || '—'}\nMonto: $${pago.monto}\nFecha: ${pago.fecha_pago}\nMétodo: ${this.formatMetodo(pago.metodo)}\nEstado: ${this.formatEstado(pago.estado)}`);
  }

  exportarReporte() {
    console.log('Exportar reporte de pagos');
    alert('Funcionalidad en desarrollo');
  }
}