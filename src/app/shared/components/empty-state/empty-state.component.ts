import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { searchOutline } from 'ionicons/icons';

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

  constructor() {
    addIcons({ searchOutline });
  }
}
