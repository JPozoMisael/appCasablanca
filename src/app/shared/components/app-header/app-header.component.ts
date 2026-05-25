import { Component, Input, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  locationOutline,
  personOutline,
  menuOutline,
  closeOutline,
  homeOutline,
  businessOutline,
  bedOutline,
  pricetagOutline,
  logOutOutline,
  shieldOutline,
  calendarOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, IonIcon],
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
})
export class AppHeaderComponent implements OnInit {
  @Input() title = 'Hotel Casa Blanca';
  @Input() subtitle = 'Salinas, Santa Elena';
  @Input() logoText = 'CB';

  menuOpen = false;
  userMenuOpen = false;
  hiddenOnScroll = false;
  isLoggedIn = false;
  isAdmin = false;
  userInitials = '';
  private lastScroll = 0;

  constructor(private router: Router) {
    addIcons({
      locationOutline,
      personOutline,
      menuOutline,
      closeOutline,
      homeOutline,
      businessOutline,
      bedOutline,
      pricetagOutline,
      logOutOutline,
      shieldOutline,
      calendarOutline
    });
  }

  ngOnInit() {
    this.checkAuthStatus();
    // Escuchar cambios en localStorage (para cuando el usuario se loguea/desloguea)
    window.addEventListener('storage', () => this.checkAuthStatus());
  }

  checkAuthStatus() {
    const token = localStorage.getItem('token');
    this.isLoggedIn = !!token;

    if (this.isLoggedIn) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          this.isAdmin = user.rol === 'super_admin' || user.rol === 'admin';
          // Generar iniciales para el avatar
          const nombre = user.nombre || '';
          const apellido = user.apellido || '';
          this.userInitials = (nombre.charAt(0) + apellido.charAt(0)).toUpperCase();
        } catch (e) {
          console.error('Error parsing user', e);
        }
      }
    } else {
      this.isAdmin = false;
      this.userInitials = '';
    }
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    // Cerrar dropdown de usuario si está abierto
    if (this.userMenuOpen) this.userMenuOpen = false;
  }

  closeMenu() {
    this.menuOpen = false;
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  closeAllMenus() {
    this.menuOpen = false;
    this.userMenuOpen = false;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isLoggedIn = false;
    this.isAdmin = false;
    this.userInitials = '';
    this.closeAllMenus();
    this.router.navigate(['/login']);
  }

  @HostListener('window:scroll', [])
  onScroll() {
    const current = window.scrollY;
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
    // Cerrar drawer si se clickea fuera
    if (this.menuOpen && !target.closest('.drawer') && !target.closest('.menu-btn')) {
      this.menuOpen = false;
    }
    // Cerrar user dropdown si se clickea fuera
    if (this.userMenuOpen && !target.closest('.user-menu')) {
      this.userMenuOpen = false;
    }
  }
}