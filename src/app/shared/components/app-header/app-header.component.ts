import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  locationOutline,
  personOutline,
  homeOutline,
  menuOutline
} from 'ionicons/icons';

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
  @Input() hiddenOnScroll = false;

  menuOpen = false;

  constructor() {
    addIcons({
      locationOutline,
      personOutline,
      homeOutline,
      menuOutline
    });
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }

}