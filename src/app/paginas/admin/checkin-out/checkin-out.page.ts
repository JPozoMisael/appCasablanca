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
  IonTitle,
  IonSearchbar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  logInOutline, 
  logOutOutline, 
  searchOutline, 
  calendarOutline,
  peopleOutline,
  bedOutline,
  timeOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  constructOutline,
  personOutline,
  callOutline,
  mailOutline
} from 'ionicons/icons';

interface ReservaCheck {
  id: number;
  huesped: string;
  habitacion: string;
  fechaEntrada: string;
  fechaSalida: string;
  tipo: 'checkin' | 'checkout';
  documento?: string;
  telefono?: string;
}

@Component({
  selector: 'app-checkin-out',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    IonIcon, 
    IonButton, 
    IonChip, 
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonSearchbar
  ],
  templateUrl: './checkin-out.page.html',
  styleUrls: ['./checkin-out.page.scss'],
})
export class CheckinOutPage implements OnInit {
  searchTerm: string = '';
  activeTab: 'checkin' | 'checkout' = 'checkin';
  
  reservas = signal<ReservaCheck[]>([
    { id: 1, huesped: 'Carlos Ruiz', habitacion: '204 · Doble', fechaEntrada: '2026-05-25', fechaSalida: '2026-05-27', tipo: 'checkin', documento: '0901234567' },
    { id: 2, huesped: 'María Paredes', habitacion: '301 · Suite', fechaEntrada: '2026-05-25', fechaSalida: '2026-05-26', tipo: 'checkin', documento: '0912345678' },
    { id: 3, huesped: 'Kevin Andrade', habitacion: '105 · Simple', fechaEntrada: '2026-05-24', fechaSalida: '2026-05-25', tipo: 'checkout', documento: '0923456789' },
    { id: 4, huesped: 'Ana Cedeño', habitacion: '210 · Doble', fechaEntrada: '2026-05-23', fechaSalida: '2026-05-25', tipo: 'checkout', documento: '0934567890' },
  ]);

  reservasFiltradas = computed(() => {
    let filtered = this.reservas().filter(r => r.tipo === this.activeTab);
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.huesped.toLowerCase().includes(term) ||
        (r.documento && r.documento.includes(term)) ||
        r.habitacion.toLowerCase().includes(term)
      );
    }
    return filtered;
  });

  checkinsCount = computed(() => this.reservas().filter(r => r.tipo === 'checkin').length);
  checkoutsCount = computed(() => this.reservas().filter(r => r.tipo === 'checkout').length);
  pendientesCount = computed(() => this.checkinsCount() + this.checkoutsCount());

  constructor() {
    addIcons({
      logInOutline,
      logOutOutline,
      searchOutline,
      calendarOutline,
      peopleOutline,
      bedOutline,
      timeOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      constructOutline,
      personOutline,
      callOutline,
      mailOutline
    });
  }

  ngOnInit() {}

  getInitials(nombre: string): string {
    return nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }

  filtrarReservas() {
    // El computed se actualiza automáticamente
  }

  procesar(reserva: ReservaCheck) {
    const action = reserva.tipo === 'checkin' ? 'Check-in' : 'Check-out';
    alert(`${action} realizado para ${reserva.huesped}`);
    // Aquí llamarías al servicio para procesar
  }
}