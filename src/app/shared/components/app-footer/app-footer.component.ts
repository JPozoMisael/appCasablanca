import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  logoInstagram,
  logoFacebook,
  logoWhatsapp,
  logoTiktok
} from 'ionicons/icons';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, IonIcon],
  templateUrl: './app-footer.component.html',
  styleUrls: ['./app-footer.component.scss'],
})
export class AppFooterComponent implements OnInit {
  currentYear = new Date().getFullYear();
  isLoggedIn = false;
  isAdmin = false;

  constructor() {
    addIcons({
      logoInstagram,
      logoFacebook,
      logoWhatsapp,
      logoTiktok
    });
  }

  ngOnInit() {
    this.checkAuthStatus();
    // Escuchar cambios en localStorage
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
        } catch (e) {
          console.error('Error parsing user', e);
        }
      }
    } else {
      this.isAdmin = false;
    }
  }
}