import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  wifiOutline,
  snowOutline,
  tvOutline,
  waterOutline,
  restaurantOutline,
  peopleOutline,
  resizeOutline,
  starOutline,
  closeCircleOutline,
  calculatorOutline,
  calendarOutline
} from 'ionicons/icons';

export interface RoomCardData {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  pricePerNight: number;
  oldPricePerNight?: number;
  maxGuests: number;
  size?: number;
  available: boolean;
  breakfastIncluded?: boolean;
  featured?: boolean;
  rating?: number;
  features?: string[];
}

@Component({
  selector: 'app-room-card',
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon],
  templateUrl: './room-card.component.html',
  styleUrls: ['./room-card.component.scss'],
})
export class RoomCardComponent {
  @Input() data!: RoomCardData;
  @Input() nights = 0;
  @Input() selected = false;

  @Output() select = new EventEmitter<number>();

  constructor() {
    addIcons({
      wifiOutline,
      snowOutline,
      tvOutline,
      waterOutline,
      restaurantOutline,
      peopleOutline,
      resizeOutline,
      starOutline,
      closeCircleOutline,
      calculatorOutline,
      calendarOutline
    });
  }

  get totalPrice(): number {
    if (!this.data) return 0;
    return Math.round(this.data.pricePerNight * Math.max(0, this.nights));
  }

  get discountPerNight(): number {
    const oldP = this.data.oldPricePerNight ?? 0;
    const p = this.data.pricePerNight;
    return Math.max(0, oldP - p);
  }

  get discountPercentage(): number {
    const oldP = this.data.oldPricePerNight ?? 0;
    if (oldP === 0) return 0;
    return Math.round((this.discountPerNight / oldP) * 100);
  }

  onSelect() {
    if (!this.data || !this.data.available) return;
    this.select.emit(this.data.id);
  }

  getFeatureLabel(icon: string): string {
    const map: Record<string, string> = {
      'wifi-outline': 'WiFi',
      'snow-outline': 'Aire acond.',
      'tv-outline': 'TV',
      'water-outline': 'Vista al mar',
      'restaurant-outline': 'Desayuno',
    };
    return map[icon] ?? icon.replace('-outline', '');
  }
}