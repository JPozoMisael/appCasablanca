import {
  Component,
  HostListener,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy
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
import { CalendarPickerComponent, DateRange } from '@app/shared/components/calendar-picker/calendar-picker.component';
import { trigger, transition, style, animate } from '@angular/animations';

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
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('180ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('120ms ease-in', style({ opacity: 0, transform: 'translateY(10px)' }))
      ])
    ])
  ]
})
export class SearchBarComponent implements OnInit, OnDestroy {
  @Output() search = new EventEmitter<any>();

  // UI State
  disabled = false;
  branchOpen = false;
  datesOpen = false;
  guestsOpen = false;

  // Data
  branch: string = '';
  branchLabel: string = 'Seleccionar sucursal';
  checkIn: Date | null = null;
  checkOut: Date | null = null;
  adults = 2;
  children = 0;
  rooms = 1;
  withPets = false;
  buttonText: string = 'Buscar';

  // Data source
  branches = [
    { id: 'palmeras', name: 'Palmeras - Salinas', desc: 'Frente al mar' },
    { id: 'chipipe', name: 'Chipipe', desc: 'Zona tranquila' },
    { id: 'ballenita', name: 'Ballenita', desc: 'Vista panorámica' },
  ];

  // Listeners para cerrar popups
  private documentClickListener: any;
  private escapeListener: any;

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

  ngOnInit() {
    // Cargar valores guardados en localStorage
    this.loadFromStorage();
  }

  ngOnDestroy() {
    // Limpiar listeners si es necesario
  }

  // ================= STORAGE =================
  private loadFromStorage() {
    const savedSearch = localStorage.getItem('lastSearch');
    if (savedSearch) {
      try {
        const data = JSON.parse(savedSearch);
        if (data.hotel) {
          this.branch = data.hotel;
          const branch = this.branches.find(b => b.id === data.hotel);
          if (branch) this.branchLabel = branch.name;
        }
        if (data.checkIn) this.checkIn = new Date(data.checkIn);
        if (data.checkOut) this.checkOut = new Date(data.checkOut);
        if (data.adults) this.adults = data.adults;
        if (data.children) this.children = data.children;
        if (data.rooms) this.rooms = data.rooms;
        if (data.withPets) this.withPets = !!data.withPets;
      } catch (e) {}
    }
  }

  private saveToStorage() {
    const data = {
      hotel: this.branch,
      checkIn: this.checkIn?.toISOString(),
      checkOut: this.checkOut?.toISOString(),
      adults: this.adults,
      children: this.children,
      rooms: this.rooms,
      withPets: this.withPets ? 1 : 0
    };
    localStorage.setItem('lastSearch', JSON.stringify(data));
  }

  // ================= UX CONTROL =================
  @HostListener('document:keydown.escape')
  onEsc() {
    this.closeAll();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.bk-search')) {
      this.closeAll();
    }
  }

  // ================= TOGGLES =================
  toggleBranch(e: Event) {
    e.stopPropagation();
    this.branchOpen = !this.branchOpen;
    this.datesOpen = false;
    this.guestsOpen = false;
  }

  toggleDates(e: Event) {
    e.stopPropagation();
    this.datesOpen = !this.datesOpen;
    this.branchOpen = false;
    this.guestsOpen = false;
  }

  toggleGuests(e: Event) {
    e.stopPropagation();
    this.guestsOpen = !this.guestsOpen;
    this.branchOpen = false;
    this.datesOpen = false;
  }

  closeAll() {
    this.branchOpen = false;
    this.datesOpen = false;
    this.guestsOpen = false;
  }

  // ================= ACCIONES =================
  selectBranch(slug: string) {
    this.branch = slug;
    const b = this.branches.find(x => x.id === slug);
    this.branchLabel = b ? b.name : 'Seleccionar sucursal';
    this.branchOpen = false;
  }

  onRangeChange(range: DateRange) {
    this.checkIn = range.checkIn;
    this.checkOut = range.checkOut;
  }

  inc(type: GuestField) {
    if (type === 'adults') this.adults++;
    if (type === 'children') this.children++;
    if (type === 'rooms') this.rooms++;
  }

  dec(type: GuestField) {
    if (type === 'adults' && this.adults > 1) this.adults--;
    if (type === 'children' && this.children > 0) this.children--;
    if (type === 'rooms' && this.rooms > 1) this.rooms--;
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
      alert('Selecciona una sucursal');
      return;
    }

    if (!this.checkIn || !this.checkOut) {
      alert('Selecciona fechas');
      return;
    }

    if (this.checkIn >= this.checkOut) {
      alert('Fechas inválidas');
      return;
    }

    const data = {
      hotel: this.branch,
      checkIn: this.formatDate(this.checkIn),
      checkOut: this.formatDate(this.checkOut),
      adults: this.adults,
      children: this.children,
      rooms: this.rooms,
      withPets: this.withPets ? 1 : 0,
    };

    this.saveToStorage();
    this.search.emit(data);
    this.router.navigate([`/hotel/${this.branch}/habitaciones`], {
      queryParams: data
    });
  }
}