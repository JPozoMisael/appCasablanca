import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CalendarPickerComponent } from '../calendar-picker/calendar-picker.component';

import { addIcons } from 'ionicons';
import { checkmarkCircle } from 'ionicons/icons';

type GuestField = 'adults' | 'children' | 'rooms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    DatePipe,
    CalendarPickerComponent
  ],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent {

  @Input() checkIn: Date | null = null;
  @Input() checkOut: Date | null = null;
  @Input() adults: number = 2;
  @Input() children: number = 0;
  @Input() rooms: number = 1;
  @Input() withPets: boolean = false;
  @Input() buttonText: string = 'Buscar habitaciones disponibles';

  disabled = false;

  branchOpen = false;
  datesOpen = false;
  guestsOpen = false;

  branch: string = 'palmeras';

  branches = [
    { id: 'palmeras', name: 'Palmeras - Salinas', desc: 'Frente al mar' },
    { id: 'chipipe', name: 'Chipipe', desc: 'Zona tranquila' },
    { id: 'ballenita', name: 'Ballenita', desc: 'Vista panorámica' },
  ];

  constructor(private router: Router) {
    addIcons({ checkmarkCircle });
  }

  get branchLabel(): string {
    const b = this.branches.find(x => x.id === this.branch);
    return b ? b.name : 'Seleccionar';
  }

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

  //  FIX CLAVE
  onSelectBranch(slug: string, e: Event) {
    e.stopPropagation();
    this.branch = slug;
    this.branchOpen = false;

    console.log('SELECTED:', slug);
  }

  onRangeChange(range: { checkIn: Date | null; checkOut: Date | null }) {
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

  getGuestsText(): string {
    return `${this.adults} adultos · ${this.children} niños · ${this.rooms} hab`;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  onSubmit() {

    console.log('CLICK SEARCH');
    console.log('BRANCH:', this.branch);

    if (!this.branch) {
      this.branch = 'palmeras';
    }

    if (!this.checkIn || !this.checkOut) {
      console.warn('Selecciona fechas');
      return;
    }

    if (this.checkIn >= this.checkOut) {
      console.warn('Fechas inválidas');
      return;
    }

    this.router.navigate(['/habitaciones'], {
      queryParams: {
        hotel: this.branch,
        checkIn: this.checkIn ? this.formatDate(this.checkIn) : '',
        checkOut: this.checkOut ? this.formatDate(this.checkOut) : '',
        adults: this.adults,
        children: this.children,
        rooms: this.rooms,
        withPets: this.withPets ? 1 : 0
      }
    }).then(() => {
      console.log('NAVEGACIÓN OK');
    }).catch(err => {
      console.error('ERROR NAV:', err);
    });

  }

}