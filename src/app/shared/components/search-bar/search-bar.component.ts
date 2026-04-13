import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CalendarPickerComponent } from '../calendar-picker/calendar-picker.component';

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

  // ================= INPUTS (CLAVE PARA QUE INICIO FUNCIONE) =================
  @Input() checkIn: Date | null = null;
  @Input() checkOut: Date | null = null;
  @Input() adults: number = 2;
  @Input() children: number = 0;
  @Input() rooms: number = 1;
  @Input() withPets: boolean = false;
  @Input() buttonText: string = 'Buscar habitaciones disponibles';

  disabled = false;

  // ================= UI =================
  branchOpen = false;
  datesOpen = false;
  guestsOpen = false;

  // ================= DATA =================
  branch: string = '';

  // ================= SUCURSALES =================
  branches = [
    { id: 'palmeras', name: 'Palmeras - Salinas', desc: 'Frente al mar' },
    { id: 'chipipe', name: 'Chipipe', desc: 'Zona tranquila' },
    { id: 'ballenita', name: 'Ballenita', desc: 'Vista panorámica' },
  ];

  constructor(private router: Router) {}

  // ================= LABEL =================
  get branchLabel(): string {
    const b = this.branches.find(x => x.id === this.branch);
    return b ? b.name : 'Seleccionar';
  }

  // ================= UI CONTROL =================
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

  //  AJUSTADO PARA CALENDAR
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

  // ================= HELPERS =================
  getGuestsText(): string {
    return `${this.adults} adultos · ${this.children} niños · ${this.rooms} hab`;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // ================= SUBMIT =================
  onSubmit() {

    if (!this.branch) {
      console.warn('Selecciona una sucursal');
      return;
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
    });
  }

}