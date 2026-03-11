import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { filterOutline, closeOutline } from 'ionicons/icons';

export interface RoomFilters {
  minPrice: number | null;
  maxPrice: number | null;
  guests: number | null;
  onlyAvailable: boolean;
  withBreakfast: boolean;
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
  };

  @Output() valueChange = new EventEmitter<RoomFilters>();
  @Output() clear = new EventEmitter<void>();

  constructor() {
    addIcons({ filterOutline, closeOutline });
  }

  update<K extends keyof RoomFilters>(key: K, val: RoomFilters[K]) {
    this.value = { ...this.value, [key]: val };
    this.valueChange.emit(this.value);
  }

  onClear() {
    this.clear.emit();
    this.valueChange.emit({
      minPrice: null,
      maxPrice: null,
      guests: null,
      onlyAvailable: true,
      withBreakfast: false,
    });
  }
}
