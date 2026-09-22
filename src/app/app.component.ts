import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Restaura la sesión guardada; si el token venció, el interceptor cierra la sesión.
    if (this.authService.isLoggedIn()) {
      this.authService.refrescarPerfil().subscribe({ error: () => undefined });
    }
  }
}
