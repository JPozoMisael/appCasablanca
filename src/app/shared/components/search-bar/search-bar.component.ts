import { Component, EventEmitter, Input, Output, HostListener } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { searchOutline, calendarOutline, peopleOutline, addOutline, removeOutline } from 'ionicons/icons';

import { CalendarPickerComponent, DateRange } from '../calendar-picker/calendar-picker.component';

export interface SearchBarValue {
  checkIn: Date | null;
  checkOut: Date | null;
  adults: number;
  children: number;
  rooms: number;
  withPets: boolean;
}

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, DatePipe, IonButton, IonIcon, CalendarPickerComponent],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent {
  @Input() checkIn: Date | null = null;
  @Input() checkOut: Date | null = null;

  @Input() adults = 2;
  @Input() children = 0;
  @Input() rooms = 1;
  @Input() withPets = false;

  @Input() buttonText = 'Buscar habitaciones';
  @Input() disabled = false;

  @Output() valueChange = new EventEmitter<SearchBarValue>();
  @Output() submit = new EventEmitter<SearchBarValue>();

  // ✅ estados de popovers
  datesOpen = false;
  guestsOpen = false;

  constructor() {
    addIcons({
      searchOutline,
      calendarOutline,
      peopleOutline,
      addOutline,
      removeOutline,
    });
  }

  toggleDates(ev: Event) {
    if (this.disabled) return;
    ev.stopPropagation();
    this.datesOpen = !this.datesOpen;
    if (this.datesOpen) this.guestsOpen = false;
  }

  toggleGuests(ev: Event) {
    if (this.disabled) return;
    ev.stopPropagation();
    this.guestsOpen = !this.guestsOpen;
    if (this.guestsOpen) this.datesOpen = false;
  }

  closeAll() {
    this.datesOpen = false;
    this.guestsOpen = false;
  }

  // por si el usuario presiona ESC
  @HostListener('document:keydown.escape')
  onEsc() {
    this.closeAll();
  }

  onRangeChange(range: DateRange) {
    this.checkIn = range.checkIn;
    this.checkOut = range.checkOut;
    this.emitValue();
  }

  inc(key: 'adults' | 'children' | 'rooms') {
    if (key === 'adults') this.adults += 1;
    if (key === 'children') this.children += 1;
    if (key === 'rooms') this.rooms += 1;
    this.emitValue();
  }

  dec(key: 'adults' | 'children' | 'rooms') {
    if (key === 'adults') this.adults = Math.max(1, this.adults - 1);
    if (key === 'children') this.children = Math.max(0, this.children - 1);
    if (key === 'rooms') this.rooms = Math.max(1, this.rooms - 1);
    this.emitValue();
  }

  togglePets() {
    this.withPets = !this.withPets;
    this.emitValue();
  }

  onSubmit() {
    const v = this.currentValue();
    this.submit.emit(v);
    this.closeAll();
  }

  private emitValue() {
    this.valueChange.emit(this.currentValue());
  }

  private currentValue(): SearchBarValue {
    return {
      checkIn: this.checkIn,
      checkOut: this.checkOut,
      adults: this.adults,
      children: this.children,
      rooms: this.rooms,
      withPets: this.withPets,
    };
  }

  getGuestsText(): string {
    const a = this.adults;
    const c = this.children;
    const r = this.rooms;

    let text = `${a} adulto${a !== 1 ? 's' : ''}`;
    if (c > 0) text += ` · ${c} niño${c !== 1 ? 's' : ''}`;
    text += ` · ${r} habitación${r !== 1 ? 'es' : ''}`;
    return text;
  }
}
