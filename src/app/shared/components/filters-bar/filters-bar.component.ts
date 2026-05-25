import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  filterOutline,
  closeOutline,
  chevronDownOutline,
  chevronUpOutline,
  peopleOutline,
  checkmarkOutline,
  wifiOutline,
  carOutline,
  waterOutline
} from 'ionicons/icons';

export interface RoomFilters {
  minPrice: number | null;
  maxPrice: number | null;
  guests: number | null;
  onlyAvailable: boolean;
  withBreakfast: boolean;
  withWifi?: boolean;
  withParking?: boolean;
  withPool?: boolean;
  roomType?: string | null;
}

@Component({
  selector: 'app-filters-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, IonIcon],
  templateUrl: './filters-bar.component.html',
  styleUrls: ['./filters-bar.component.scss'],
})
export class FiltersBarComponent {
  @Input() value: RoomFilters = {
    minPrice: null,
    maxPrice: null,
    guests: null,
    onlyAvailable: true,
    withBreakfast: false,
    withWifi: false,
    withParking: false,
    withPool: false,
    roomType: null,
  };

  @Input() maxPriceLimit = 500;
  @Input() showSlider = false;
  @Input() showExtraFilters = false;
  @Input() showRoomTypes = false;
  @Input() collapsed = false;

  @Output() valueChange = new EventEmitter<RoomFilters>();
  @Output() clear = new EventEmitter<void>();
  @Output() apply = new EventEmitter<RoomFilters>();

  roomTypes = [
    { id: 'single', name: 'Single' },
    { id: 'double', name: 'Doble' },
    { id: 'suite', name: 'Suite' },
    { id: 'presidential', name: 'Presidencial' },
  ];

  constructor() {
    addIcons({
      filterOutline,
      closeOutline,
      chevronDownOutline,
      chevronUpOutline,
      peopleOutline,
      checkmarkOutline,
      wifiOutline,
      carOutline,
      waterOutline
    });
  }

  get activeFiltersCount(): number {
    let count = 0;
    if (this.value.minPrice) count++;
    if (this.value.maxPrice) count++;
    if (this.value.guests) count++;
    if (!this.value.onlyAvailable) count++;
    if (this.value.withBreakfast) count++;
    if (this.value.withWifi) count++;
    if (this.value.withParking) count++;
    if (this.value.withPool) count++;
    if (this.value.roomType) count++;
    return count;
  }

  update<K extends keyof RoomFilters>(key: K, val: RoomFilters[K]) {
    this.value = { ...this.value, [key]: val };
    // Emitir cambios en tiempo real si es necesario
    // this.valueChange.emit(this.value);
  }

  applyFilters() {
    this.apply.emit(this.value);
  }

  onClear() {
    this.value = {
      minPrice: null,
      maxPrice: null,
      guests: null,
      onlyAvailable: true,
      withBreakfast: false,
      withWifi: false,
      withParking: false,
      withPool: false,
      roomType: null,
    };
    this.clear.emit();
    this.valueChange.emit(this.value);
  }

  toggleCollapse() {
    this.collapsed = !this.collapsed;
  }
}