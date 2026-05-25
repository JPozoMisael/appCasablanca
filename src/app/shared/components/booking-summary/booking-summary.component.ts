import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  lockClosedOutline,
  shieldCheckmarkOutline,
  calendarOutline,
  peopleOutline,
  cashOutline,
  cardOutline,
  giftOutline,
  arrowForwardOutline
} from 'ionicons/icons';

export interface ExtraCharge {
  name: string;
  amount: number;
}

@Component({
  selector: 'app-booking-summary',
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon, RouterLink],
  templateUrl: './booking-summary.component.html',
  styleUrls: ['./booking-summary.component.scss'],
})
export class BookingSummaryComponent implements OnInit {
  // Datos básicos
  @Input() nights = 0;
  @Input() pricePerNight = 0;
  @Input() oldTotal = 0;
  @Input() total = 0;

  // Fechas
  @Input() checkIn: Date | null = null;
  @Input() checkOut: Date | null = null;

  // Huéspedes
  @Input() adults = 0;
  @Input() children = 0;

  // Impuestos y extras
  @Input() taxRate = 0.12; // 12% IVA
  @Input() extraCharges: ExtraCharge[] = [];

  // Botón
  @Input() ctaText = 'Reservar ahora';
  @Input() ctaIcon = 'cash-outline';
  @Input() ctaLink: any[] = ['/reservar'];
  @Input() ctaQueryParams: Record<string, any> | null = null;
  @Input() disabled = false;

  // Badge
  @Input() showBadge = true;

  // Información de pago
  @Input() paymentInfo = 'Pagas directamente en el hotel al momento del check-in';

  constructor() {
    addIcons({
      lockClosedOutline,
      shieldCheckmarkOutline,
      calendarOutline,
      peopleOutline,
      cashOutline,
      cardOutline,
      giftOutline,
      arrowForwardOutline
    });
  }

  ngOnInit() {
    // Calcular total si no vino
    if (this.total === 0 && this.oldTotal > 0) {
      this.calculateTotal();
    }
  }

  // Calcular descuento
  get discount(): number {
    return Math.max(0, this.oldTotal - this.total);
  }

  // Porcentaje de descuento
  get discountPercentage(): number {
    if (this.oldTotal === 0) return 0;
    return Math.round((this.discount / this.oldTotal) * 100);
  }

  // Calcular impuestos
  get taxAmount(): number {
    return Math.round((this.total * this.taxRate) * 100) / 100;
  }

  // Calcular total con impuestos
  calculateTotal() {
    const subtotal = this.oldTotal - this.discount;
    const extrasTotal = this.extraCharges.reduce((sum, c) => sum + c.amount, 0);
    const taxes = (subtotal + extrasTotal) * this.taxRate;
    this.total = Math.round((subtotal + extrasTotal + taxes) * 100) / 100;
  }
}