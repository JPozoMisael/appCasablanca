import { Component, Input, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { AuthService } from '@app/core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IonIcon],
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
})
export class AppHeaderComponent {
  private router = inject(Router);
  readonly auth = inject(AuthService);

  @Input() title = 'Salinas Booking';
  @Input() subtitle = 'Alojamiento en Salinas, Ecuador';
  @Input() logoText = 'SB';
  @Input() hiddenOnScroll = false;

  menuOpen = false;
  userMenuOpen = false;

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    this.userMenuOpen = false;
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  cerrarMenus(): void {
    this.menuOpen = false;
    this.userMenuOpen = false;
  }

  salir(): void {
    this.auth.logout();
    this.cerrarMenus();
    this.router.navigate(['/inicio']);
  }
}
