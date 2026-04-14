import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logoInstagram, logoFacebook, logoWhatsapp } from 'ionicons/icons';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, IonIcon],
  templateUrl: './app-footer.component.html',
  styleUrls: ['./app-footer.component.scss'],
})
export class AppFooterComponent {
  constructor() {
    addIcons({ logoInstagram, logoFacebook, logoWhatsapp });
  }
}