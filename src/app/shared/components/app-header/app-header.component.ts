import { Component, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  locationOutline,
  personOutline,
  menuOutline,
  closeOutline
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

  menuOpen = false;
  hiddenOnScroll = false;
  private lastScroll = 0;

  constructor() {
    addIcons({
      locationOutline,
      personOutline,
      menuOutline,
      closeOutline,
    });
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }

  @HostListener('window:scroll')
  onScroll() {
    const current = window.scrollY;

    // Oculta al bajar, muestra al subir
    if (current > this.lastScroll && current > 80) {
      this.hiddenOnScroll = true;
      this.menuOpen = false;
    } else {
      this.hiddenOnScroll = false;
    }

    this.lastScroll = current;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: Event) {
    const target = e.target as HTMLElement;
    if (this.menuOpen && !target.closest('.drawer') && !target.closest('.menu-btn')) {
      this.menuOpen = false;
    }
  }
}