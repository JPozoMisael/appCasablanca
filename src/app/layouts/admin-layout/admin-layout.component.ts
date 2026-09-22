import { Component, HostListener, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { IonApp, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  gridOutline, calendarOutline, bedOutline, peopleOutline, analyticsOutline, logOutOutline, clipboardOutline,
  shieldCheckmarkOutline, personCircleOutline, menuOutline, businessOutline, pricetagOutline, restaurantOutline,
  cardOutline, settingsOutline, swapHorizontalOutline, closeOutline, ellipseOutline, storefrontOutline, globeOutline, syncOutline, addCircleOutline,
} from 'ionicons/icons';
import { AuthService } from '@app/core/services/auth.service';
import { GestionService, HotelPerfil } from '@app/core/services/gestion.service';
import { HotelScopeService } from '@app/core/services/hotel-scope.service';
import { MenuService } from '@app/core/services/menu.service';

const TITULOS: Record<string, [string, string]> = {
  '/admin/dashboard': ['Resumen', 'Lo que pasa hoy en tu alojamiento'],
  '/admin/reservas': ['Reservas', 'Confirma, registra llegadas, salidas y cobros'],
  '/admin/habitaciones': ['Habitaciones y precios', 'Tipos de habitación, unidades y tarifa base'],
  '/admin/mi-hotel': ['Mi alojamiento', 'Ficha pública, fotos, servicios y políticas'],
  '/admin/hoteles': ['Alojamientos de la plataforma', 'Registro, aprobación y comisiones'],
  '/admin/checkin-out': ['Check-in / Check-out', 'Registro de huéspedes'],
  '/admin/tarifas': ['Tarifas', 'Precios y temporadas'],
  '/admin/servicios': ['Servicios', 'Servicios adicionales'],
  '/admin/huespedes': ['Huéspedes', 'Historial de huéspedes'],
  '/admin/pagos': ['Pagos', 'Cobros registrados'],
  '/admin/reportes': ['Reportes', 'Estadísticas'],
  '/admin/usuarios': ['Personal', 'Usuarios del alojamiento'],
  '/admin/configuracion': ['Configuración', 'Ajustes'],
  '/admin/calendario': ['Calendario', 'Ocupación por habitación y día'],
  '/admin/nueva-reserva': ['Nueva reserva', 'Reservas por teléfono, WhatsApp o mostrador'],
  '/admin/canales': ['Canales de venta', 'Conexión con SiteMinder / Little Hotelier'],
  '/admin/roles': ['Roles y permisos', 'Quién puede hacer qué, y el menú de cada rol'],
};

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, IonApp, IonIcon],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
})
export class AdminLayoutComponent implements OnInit {
  private router = inject(Router);
  private gestion = inject(GestionService);
  readonly auth = inject(AuthService);
  readonly scope = inject(HotelScopeService);
  readonly menu = inject(MenuService);

  sidebarCollapsed = false;
  mobileMenuOpen = false;
  pageTitle = 'Resumen';
  pageSubtitle = '';
  hotelNombre = '';
  hoteles: HotelPerfil[] = [];

  constructor() {
    addIcons({
      gridOutline, calendarOutline, bedOutline, peopleOutline, analyticsOutline, logOutOutline, clipboardOutline,
      shieldCheckmarkOutline, personCircleOutline, menuOutline, businessOutline, pricetagOutline, restaurantOutline,
      cardOutline, settingsOutline, swapHorizontalOutline, closeOutline, ellipseOutline, storefrontOutline, globeOutline, syncOutline, addCircleOutline,
    });
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        this.actualizarTitulo(e.urlAfterRedirects);
        this.mobileMenuOpen = false;
      }
    });
  }

  get rol(): string {
    return this.auth.usuario()?.rol ?? '';
  }

  get etiquetaRol(): string {
    return this.rol.replace(/_/g, ' ');
  }

  get nombreUsuario(): string {
    const u = this.auth.usuario();
    return `${u?.nombre ?? ''} ${u?.apellido ?? ''}`.trim() || 'Usuario';
  }

  ngOnInit(): void {
    this.actualizarTitulo(this.router.url);
    void this.menu.asegurarCargado();
    if (this.auth.esSuperAdmin()) {
      this.gestion.hoteles({ limit: 100 }).subscribe({
        next: (r) => {
          this.hoteles = r.data;
          this.hotelNombre = this.hoteles.find((h) => h.id === this.scope.get())?.nombre ?? '';
        },
        error: () => undefined,
      });
    } else if (this.auth.usuario()?.hotel_id) {
      this.gestion.perfil().subscribe({ next: (h) => (this.hotelNombre = h.nombre), error: () => undefined });
    }
  }

  private actualizarTitulo(url: string): void {
    const clave = Object.keys(TITULOS).find((k) => url.startsWith(k)) ?? '/admin/dashboard';
    [this.pageTitle, this.pageSubtitle] = TITULOS[clave];
  }

  /** super_admin: elige el alojamiento sobre el que trabaja; recarga para que todo el panel use el nuevo alcance. */
  cambiarHotel(valor: string): void {
    this.scope.set(valor ? Number(valor) : null);
    window.location.reload();
  }

  toggleSidebar(): void {
    if (window.innerWidth <= 768) this.mobileMenuOpen = !this.mobileMenuOpen;
    else this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  logout(): void {
    this.auth.logout();
    this.scope.set(null);
    this.router.navigate(['/login']);
  }

  @HostListener('window:resize')
  onResize(): void {
    this.mobileMenuOpen = false;
  }
}
