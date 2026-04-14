import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonIcon, IonButton } from "@ionic/angular/standalone";

// 🔥 Tipado seguro para huéspedes
type GuestField = 'adults' | 'children' | 'rooms';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent {

  disabled = false;

  // ================= UI =================
  branchOpen = false;
  datesOpen = false;
  guestsOpen = false;

  // ================= DATA =================
  branch: string = ''; // slug del hotel
  checkIn: string = '';
  checkOut: string = '';

  adults: number = 2;
  children: number = 0;
  rooms: number = 1;
  withPets: boolean = false;

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

  onRangeChange(range: { checkIn: string; checkOut: string }) {
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

  // ================= TEXTO =================
  getGuestsText(): string {
    return `${this.adults} adultos · ${this.children} niños · ${this.rooms} hab`;
  }

  get buttonText(): string {
    return 'Buscar habitaciones disponibles';
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

    console.log('BUSQUEDA:', {
      hotel: this.branch,
      checkIn: this.checkIn,
      checkOut: this.checkOut,
      adults: this.adults,
      children: this.children,
      rooms: this.rooms,
      withPets: this.withPets
    });

    this.router.navigate(['/habitaciones'], {
      queryParams: {
        hotel: this.branch,
        checkIn: this.checkIn,
        checkOut: this.checkOut,
        adults: this.adults,
        children: this.children,
        rooms: this.rooms,
        withPets: this.withPets ? 1 : 0
      }
    });

  }

}