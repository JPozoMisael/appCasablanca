import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { callOutline, mailOutline } from 'ionicons/icons';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: './app-footer.component.html',
  styleUrls: ['./app-footer.component.scss'],
})
export class AppFooterComponent {
  @Input() phone = '+593 99 999 9999';
  @Input() email = 'reservas@casablanca.com';
  year = new Date().getFullYear();

  constructor() {
    addIcons({ callOutline, mailOutline });
  }
}
