import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { IonApp, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  gridOutline,
  calendarOutline,
  bedOutline,
  peopleOutline,
  analyticsOutline,
  logOutOutline,
  clipboardOutline,
  shieldCheckmarkOutline,
  personCircleOutline,
  menuOutline,
  businessOutline,
  pricetagOutline,
  restaurantOutline,
  cardOutline,
  settingsOutline,
  swapHorizontalOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    IonApp,
    IonButton,
    IonIcon,
  ],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
})
export class AdminLayoutComponent implements OnInit {
  sidebarCollapsed = false;
  userName = 'Administrador';
  userEmail = 'admin@hotel.com';
  userRole = 'Super Administrador';
  userInitials = 'AD';
  isSuperAdmin = true;

  pageTitle = 'Dashboard';
  pageSubtitle = 'Resumen general del hotel';

  constructor(private router: Router) {
    addIcons({
      gridOutline,
      calendarOutline,
      bedOutline,
      peopleOutline,
      analyticsOutline,
      logOutOutline,
      clipboardOutline,
      shieldCheckmarkOutline,
      personCircleOutline,
      menuOutline,
      businessOutline,
      pricetagOutline,
      restaurantOutline,
      cardOutline,
      settingsOutline,
      swapHorizontalOutline
    });

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updatePageTitle(event.urlAfterRedirects);
      }
    });
  }

  ngOnInit() {
    this.loadUserData();
    this.checkScreenSize();
  }

  loadUserData() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.userName = (user.nombre + ' ' + user.apellido) || 'Administrador';
        this.userEmail = user.email || 'admin@hotel.com';
        this.userRole = this.getRoleLabel(user.rol);
        this.userInitials = (user.nombre?.charAt(0) || 'A') + (user.apellido?.charAt(0) || 'D');
        this.isSuperAdmin = user.rol === 'super_admin';
      } catch (e) {
        console.error('Error parsing user', e);
      }
    }
  }

  getRoleLabel(rol: string): string {
    const roles: Record<string, string> = {
      super_admin: 'Super Administrador',
      admin: 'Administrador',
      recepcion: 'Recepcionista',
      cliente: 'Cliente'
    };
    return roles[rol] || 'Usuario';
  }

  updatePageTitle(url: string) {
    const titles: Record<string, { title: string; subtitle: string }> = {
      '/admin/dashboard': { title: 'Dashboard', subtitle: 'Resumen general del hotel' },
      '/admin/calendario': { title: 'Calendario', subtitle: 'Disponibilidad y ocupación' },
      '/admin/reservas': { title: 'Reservas', subtitle: 'Gestión de reservas' },
      '/admin/checkin-out': { title: 'Check-in / Check-out', subtitle: 'Registro de huéspedes' },
      '/admin/habitaciones': { title: 'Habitaciones', subtitle: 'Gestión de habitaciones' },
      '/admin/tarifas': { title: 'Tarifas', subtitle: 'Precios y temporadas' },
      '/admin/servicios': { title: 'Servicios', subtitle: 'Servicios adicionales' },
      '/admin/huespedes': { title: 'Huéspedes', subtitle: 'Historial de huéspedes' },
      '/admin/pagos': { title: 'Pagos', subtitle: 'Facturación y pagos' },
      '/admin/reportes': { title: 'Reportes', subtitle: 'Estadísticas y reportes' },
      '/admin/usuarios': { title: 'Usuarios', subtitle: 'Gestión de usuarios' },
      '/admin/configuracion': { title: 'Configuración', subtitle: 'Ajustes del sistema' }
    };
    const current = titles[url] || titles['/admin/dashboard'];
    this.pageTitle = current.title;
    this.pageSubtitle = current.subtitle;
  }

  onRouteActivate(component: any) {
    if (component?.title) {
      this.pageTitle = component.title;
      this.pageSubtitle = component.subtitle || '';
    }
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  checkScreenSize() {
    if (window.innerWidth < 768) {
      this.sidebarCollapsed = true;
    } else {
      this.sidebarCollapsed = false;
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }
}