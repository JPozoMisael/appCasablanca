import {
  Component,
  HostListener
} from '@angular/core';

import { Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { IonIcon, IonButton } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  locationOutline,
  calendarOutline,
  peopleOutline,
  searchOutline,
  addOutline,
  removeOutline,
  pawOutline,
  checkmarkCircle
} from 'ionicons/icons';

import {
  CalendarPickerComponent,
  DateRange
} from '@app/shared/components/calendar-picker/calendar-picker.component';

import {
  trigger,
  transition,
  style,
  animate
} from '@angular/animations';

type GuestField = 'adults' | 'children' | 'rooms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    IonIcon,
    IonButton,
    CalendarPickerComponent,
  ],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],

  // 🔥 Animaciones PRO
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('180ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        )
      ]),
      transition(':leave', [
        animate('120ms ease-in',
          style({ opacity: 0, transform: 'translateY(10px)' })
        )
      ])
    ])
  ]
})
export class SearchBarComponent {

  disabled = false;

  branchOpen = false;
  datesOpen = false;
  guestsOpen = false;

  branch: string = '';

  checkIn: Date | null = null;
  checkOut: Date | null = null;

  adults = 2;
  children = 0;
  rooms = 1;
  withPets = false;

  branches = [
    { id: 'palmeras', name: 'Palmeras - Salinas', desc: 'Frente al mar' },
    { id: 'chipipe', name: 'Chipipe', desc: 'Zona tranquila' },
    { id: 'ballenita', name: 'Ballenita', desc: 'Vista panorámica' },
  ];

  constructor(private router: Router) {
    addIcons({
      locationOutline,
      checkmarkCircle,
      calendarOutline,
      peopleOutline,
      removeOutline,
      addOutline,
      pawOutline,
      searchOutline,
    });
  }

  // 🔥 Cerrar con ESC
  @HostListener('document:keydown.escape')
  onEsc() {
    this.closeAll();
  }

  get branchLabel(): string {
    const b = this.branches.find(x => x.id === this.branch);
    return b ? b.name : 'Seleccionar sucursal';
  }

  // ================= UI =================
  toggleBranch(e: Event) {
    e.stopPropagation();
    this.closeAll();
    this.branchOpen = !this.branchOpen;
  }

  toggleDates(e: Event) {
    e.stopPropagation();
    this.closeAll();
    this.datesOpen = !this.datesOpen;
  }

  toggleGuests(e: Event) {
    e.stopPropagation();
    this.closeAll();
    this.guestsOpen = !this.guestsOpen;
  }

  closeAll() {
    this.branchOpen = false;
    this.datesOpen = false;
    this.guestsOpen = false;
  }

  // ================= ACCIONES =================
  selectBranch(slug: string) {
    this.branch = slug;
    this.branchOpen = false;
  }

  onRangeChange(range: DateRange) {
    this.checkIn = range.checkIn;
    this.checkOut = range.checkOut;
  }

  inc(type: GuestField) {
    this[type]++;
  }

  dec(type: GuestField) {
    if (this[type] > 0) this[type]--;
  }

  togglePets() {
    this.withPets = !this.withPets;
  }

  // ================= HELPERS =================
  getGuestsText(): string {
    return `${this.adults} adultos · ${this.children} niños · ${this.rooms} hab`;
  }

  get buttonText(): string {
    return 'Buscar habitaciones';
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // ================= SUBMIT =================
  onSubmit() {

    if (!this.branch) return;
    if (!this.checkIn || !this.checkOut) return;
    if (this.checkIn >= this.checkOut) return;

    this.router.navigate(['/habitaciones'], {
      queryParams: {
        hotel: this.branch,
        checkIn: this.formatDate(this.checkIn),
        checkOut: this.formatDate(this.checkOut),
        adults: this.adults,
        children: this.children,
        rooms: this.rooms,
        withPets: this.withPets ? 1 : 0,
      }
    });
  }
}