import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { locationOutline, personOutline, bedOutline, homeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, IonIcon],
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
})
export class AppHeaderComponent {
  @Input() title = 'Hotel Casa Blanca';
  @Input() subtitle = 'Salinas, Santa Elena';
  @Input() logoText = 'CB';

  // ✅ ESTE input es el que te falta
  @Input() hiddenOnScroll = false;

  constructor() {
    addIcons({ locationOutline, personOutline, bedOutline, homeOutline });
  }
}
