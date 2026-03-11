import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { IonApp, IonButton, IonIcon, IonHeader } from '@ionic/angular/standalone';

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
} from 'ionicons/icons';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [IonHeader, 
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
export class AdminLayoutComponent {
  constructor() {
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
    });
  }

  logout(): void {
    localStorage.clear();
    window.location.href = '/inicio';
  }
}
