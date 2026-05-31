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
  mailOutline, refreshOutline } from 'ionicons/icons';
import { CheckinOutService, ReservaCheck } from '@app/core/services/checkinout.service';

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
  loading = signal(true);
  
  checkins = signal<ReservaCheck[]>([]);
  checkouts = signal<ReservaCheck[]>([]);

  reservasFiltradas = computed(() => {
    const source = this.activeTab === 'checkin' ? this.checkins() : this.checkouts();
    let filtered = [...source];
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.huesped.toLowerCase().includes(term) ||
        (r.documento && r.documento.toLowerCase().includes(term)) ||
        r.habitacion.toLowerCase().includes(term)
      );
    }
    return filtered;
  });

  checkinsCount = computed(() => this.checkins().length);
  checkoutsCount = computed(() => this.checkouts().length);
  pendientesCount = computed(() => this.checkinsCount() + this.checkoutsCount());

  constructor(private checkinoutService: CheckinOutService) {
    addIcons({refreshOutline,logInOutline,logOutOutline,timeOutline,searchOutline,personOutline,peopleOutline,calendarOutline,bedOutline,checkmarkCircleOutline,closeCircleOutline,constructOutline,callOutline,mailOutline});
  }

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.loading.set(true);
    Promise.all([
      this.checkinoutService.getCheckinsPendientes().toPromise(),
      this.checkinoutService.getCheckoutsPendientes().toPromise()
    ]).then(([checkins, checkouts]) => {
      if (checkins) this.checkins.set(checkins);
      if (checkouts) this.checkouts.set(checkouts);
      this.loading.set(false);
    }).catch(err => {
      console.error('Error cargando datos:', err);
      this.loading.set(false);
    });
  }

  getInitials(nombre: string): string {
    if (!nombre) return '?';
    return nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }

  filtrarReservas() {
    // El computed se actualiza automáticamente cuando cambia searchTerm
  }

  procesar(reserva: ReservaCheck) {
    const action = reserva.tipo === 'checkin' ? 'Check-in' : 'Check-out';
    const confirmMsg = `¿Confirmar ${action} para ${reserva.huesped}?`;
    
    if (confirm(confirmMsg)) {
      const obs = reserva.tipo === 'checkin' 
        ? this.checkinoutService.realizarCheckIn(reserva.id)
        : this.checkinoutService.realizarCheckOut(reserva.id);
      
      obs.subscribe({
        next: (success) => {
          if (success) {
            alert(`${action} realizado correctamente`);
            this.cargarDatos();
          } else {
            alert(`Error al realizar ${action}`);
          }
        },
        error: (err) => {
          console.error(`Error al realizar ${action}:`, err);
          alert(`Error: ${err.error?.message || 'No se pudo completar la operación'}`);
        }
      });
    }
  }
}