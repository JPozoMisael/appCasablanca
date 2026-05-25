import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  searchOutline,
  reloadOutline,
  bedOutline,
  calendarOutline,
  wifiOutline,
  carOutline,
  restaurantOutline,
  sadOutline,
  alertCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss'],
})
export class EmptyStateComponent {
  @Input() title = 'No se encontraron resultados';
  @Input() subtitle = 'Intenta ajustar filtros o cambiar fechas.';
  @Input() iconName: string = 'search-outline';
  
  // Variantes de tamaño
  @Input() compact = false;
  @Input() smallIcon = false;
  @Input() largeIcon = false;
  
  // Botón de acción
  @Input() showAction = false;
  @Input() actionText = 'Reintentar';
  @Output() onAction = new EventEmitter<void>();

  constructor() {
    addIcons({
      searchOutline,
      reloadOutline,
      bedOutline,
      calendarOutline,
      wifiOutline,
      carOutline,
      restaurantOutline,
      sadOutline,
      alertCircleOutline
    });
  }
}