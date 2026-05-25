import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonIcon, IonButton, IonChip, IonContent } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  settingsOutline, 
  saveOutline, 
  businessOutline, 
  notificationsOutline, 
  peopleOutline, 
  lockClosedOutline, 
  cashOutline, 
  calendarOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule, IonIcon, IonButton, IonChip, IonContent],
  templateUrl: './configuracion.page.html',
  styleUrls: ['./configuracion.page.scss'],
})
export class ConfiguracionPage implements OnInit {
  configs = signal([
    { icon: 'business-outline', title: 'Datos del hotel', description: 'Nombre, dirección, teléfono, email' },
    { icon: 'notifications-outline', title: 'Notificaciones', description: 'Email, SMS, alertas de reservas' },
    { icon: 'people-outline', title: 'Roles y permisos', description: 'Gestionar accesos del personal' },
    { icon: 'lock-closed-outline', title: 'Seguridad', description: 'Políticas de contraseña, 2FA' },
    { icon: 'cash-outline', title: 'Moneda e impuestos', description: 'Configuración de precios e IVA' },
    { icon: 'calendar-outline', title: 'Temporadas', description: 'Definir temporadas alta/baja' },
  ]);

  constructor() {
    addIcons({
      settingsOutline,
      saveOutline,
      businessOutline,
      notificationsOutline,
      peopleOutline,
      lockClosedOutline,
      cashOutline,
      calendarOutline
    });
  }

  ngOnInit() {}
}