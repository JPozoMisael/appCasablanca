import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { IonIcon, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { locationOutline, calendarOutline, peopleOutline, searchOutline, addOutline, removeOutline, pawOutline, checkmarkCircle } from 'ionicons/icons';
import { CalendarPickerComponent, DateRange } from '@app/shared/components/calendar-picker/calendar-picker.component';

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
})
export class SearchBarComponent {

  disabled = false;

  branchOpen = false;
  datesOpen = false;
  guestsOpen = false;

  branch: string = '';

  // Ahora Date | null para coincidir con CalendarPickerComponent
  checkIn: Date | null = null;
  checkOut: Date | null = null;

  adults: number = 2;
  children: number = 0;
  rooms: number = 1;
  withPets: boolean = false;

  branches = [
    { id: 'palmeras', name: 'Palmeras - Salinas', desc: 'Frente al mar' },
    { id: 'chipipe',  name: 'Chipipe',            desc: 'Zona tranquila' },
    { id: 'ballenita',name: 'Ballenita',           desc: 'Vista panorámica' },
  ];

  constructor(private router: Router) {
    addIcons({locationOutline,checkmarkCircle,calendarOutline,peopleOutline,removeOutline,addOutline,pawOutline,searchOutline,});
  }

  get branchLabel(): string {
    const b = this.branches.find(x => x.id === this.branch);
    return b ? b.name : 'Seleccionar sucursal';
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

  // Recibe DateRange con Date | null desde CalendarPickerComponent
  onRangeChange(range: DateRange) {
    this.checkIn  = range.checkIn;
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
    return 'Buscar habitaciones disponibles';
  }

  // Convierte Date a string 'YYYY-MM-DD' para los queryParams
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
        hotel:    this.branch,
        checkIn:  this.formatDate(this.checkIn),
        checkOut: this.formatDate(this.checkOut),
        adults:   this.adults,
        children: this.children,
        rooms:    this.rooms,
        withPets: this.withPets ? 1 : 0,
      }
    });
  }
}