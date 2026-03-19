import {
  Component,
  EventEmitter,
  Input,
  Output,
  HostListener
} from '@angular/core';

import { CommonModule, DatePipe } from '@angular/common';
import { IonButton, IonIcon } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  searchOutline,
  calendarOutline,
  peopleOutline,
  locationOutline,
  addOutline,
  removeOutline,
  checkmarkCircle
} from 'ionicons/icons';

import {
  CalendarPickerComponent,
  DateRange
} from '../calendar-picker/calendar-picker.component';


export interface SearchBarValue {
  branch: string;
  checkIn: Date | null;
  checkOut: Date | null;
  adults: number;
  children: number;
  rooms: number;
  withPets: boolean;
}

interface BranchOption {
  id: string;
  name: string;
  desc: string;
}

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    IonButton,
    IonIcon,
    CalendarPickerComponent
  ],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent {

  // =========================
  // DATA
  // =========================

  branches: BranchOption[] = [
    { id: 'chipipe', name: 'Chipipe — Frente al mar', desc: 'Vista directa al océano' },
    { id: 'palmeras', name: 'Las Palmeras — Zona céntrica', desc: 'Cerca de restaurantes' },
    { id: 'ballenita', name: 'Ballenita — Vista panorámica', desc: 'Zona tranquila' },
  ];

  @Input() branch: string = 'palmeras';

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


  // =========================
  // STATE
  // =========================

  branchOpen = false;
  datesOpen = false;
  guestsOpen = false;


  constructor() {
    addIcons({
      searchOutline,
      calendarOutline,
      peopleOutline,
      locationOutline,
      addOutline,
      removeOutline,
      checkmarkCircle
    });
  }


  // =========================
  // TOGGLES
  // =========================

  toggleBranch(ev: Event) {
    if (this.disabled) return;

    ev.stopPropagation();

    this.branchOpen = !this.branchOpen;
    this.datesOpen = false;
    this.guestsOpen = false;
  }

  toggleDates(ev: Event) {
    if (this.disabled) return;

    ev.stopPropagation();

    this.datesOpen = !this.datesOpen;
    this.branchOpen = false;
    this.guestsOpen = false;
  }

  toggleGuests(ev: Event) {
    if (this.disabled) return;

    ev.stopPropagation();

    this.guestsOpen = !this.guestsOpen;
    this.branchOpen = false;
    this.datesOpen = false;
  }

  closeAll() {
    this.branchOpen = false;
    this.datesOpen = false;
    this.guestsOpen = false;
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    this.closeAll();
  }


  // =========================
  // BRANCH
  // =========================

  selectBranch(id: string) {
    this.branch = id;
    this.branchOpen = false;
    this.emitValue();
  }

  get branchLabel(): string {
    return this.branches.find(b => b.id === this.branch)?.name ?? 'Seleccionar sucursal';
  }


  // =========================
  // DATES
  // =========================

  onRangeChange(range: DateRange) {
    this.checkIn = range.checkIn;
    this.checkOut = range.checkOut;
    this.emitValue();
  }


  // =========================
  // GUESTS
  // =========================

  inc(key: 'adults' | 'children' | 'rooms') {
    if (key === 'adults') this.adults++;
    if (key === 'children') this.children++;
    if (key === 'rooms') this.rooms++;
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


  // =========================
  // SUBMIT (CLAVE)
  // =========================

  onSubmit() {

    if (this.disabled) return;

    // 🔥 VALIDACIÓN PROFESIONAL
    if (!this.branch) {
      alert('Seleccione una sucursal');
      return;
    }

    if (!this.checkIn || !this.checkOut) {
      alert('Seleccione fechas de entrada y salida');
      return;
    }

    const v = this.currentValue();

    this.submit.emit(v);
    this.closeAll();
  }


  // =========================
  // HELPERS
  // =========================

  private emitValue() {
    this.valueChange.emit(this.currentValue());
  }

  private currentValue(): SearchBarValue {
    return {
      branch: this.branch,
      checkIn: this.checkIn,
      checkOut: this.checkOut,
      adults: this.adults,
      children: this.children,
      rooms: this.rooms,
      withPets: this.withPets,
    };
  }

  getGuestsText(): string {
    let text = `${this.adults} adulto${this.adults !== 1 ? 's' : ''}`;

    if (this.children > 0) {
      text += ` · ${this.children} niño${this.children !== 1 ? 's' : ''}`;
    }

    text += ` · ${this.rooms} habitación${this.rooms !== 1 ? 'es' : ''}`;

    if (this.withPets) text += ` · Mascotas`;

    return text;
  }
}