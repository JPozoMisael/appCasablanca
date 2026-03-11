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

    // Si hay sesión guardada, intentar restaurarla
    if (this.authService.isLoggedIn()) {

      this.authService.profile().subscribe({

        next: (user) => {
          console.log('Sesión restaurada', user);
        },

        error: () => {
          console.log('Token inválido o expirado');
          this.authService.logout();
        }

      });

    }

  }

}