import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { wifiOutline, snowOutline, tvOutline, waterOutline, restaurantOutline } from 'ionicons/icons';

export interface RoomCardData {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  pricePerNight: number;
  oldPricePerNight?: number;
  maxGuests: number;
  available: boolean;
  breakfastIncluded?: boolean;
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

  @Output() select = new EventEmitter<number>();

  constructor() {
    addIcons({
      wifiOutline,
      snowOutline,
      tvOutline,
      waterOutline,
      restaurantOutline,
    });
  }

  get total(): number {
    if (!this.data) return 0;
    return this.data.pricePerNight * Math.max(0, this.nights);
  }

  get discountPerNight(): number {
    const oldP = this.data.oldPricePerNight ?? 0;
    const p = this.data.pricePerNight;
    return Math.max(0, oldP - p);
  }

  onSelect() {
    if (!this.data) return;
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
    return map[icon] ?? 'Servicio';
  }
}
