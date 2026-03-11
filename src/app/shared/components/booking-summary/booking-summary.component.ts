import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { lockClosedOutline, shieldCheckmarkOutline } from 'ionicons/icons';

@Component({
  selector: 'app-booking-summary',
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon, RouterLink],
  templateUrl: './booking-summary.component.html',
  styleUrls: ['./booking-summary.component.scss'],
})
export class BookingSummaryComponent {
  @Input() nights = 0;

  @Input() oldTotal = 0;
  @Input() total = 0;

  @Input() ctaText = 'Reservar ahora';
  @Input() ctaLink: any[] = ['/reservar'];
  @Input() ctaQueryParams: Record<string, any> | null = null;

  constructor() {
    addIcons({ lockClosedOutline, shieldCheckmarkOutline });
  }

  get discount(): number {
    return Math.max(0, this.oldTotal - this.total);
  }
}
