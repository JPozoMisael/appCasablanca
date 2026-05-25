import { Component, EventEmitter, Input, Output, OnChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronForwardOutline, chevronBackOutline } from 'ionicons/icons';

export interface DateRange {
  checkIn: Date | null;
  checkOut: Date | null;
}

interface CalendarDay {
  date: Date;
  label: number;
  currentMonth: boolean;
}

@Component({
  selector: 'app-calendar-picker',
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: './calendar-picker.component.html',
  styleUrls: ['./calendar-picker.component.scss'],
})
export class CalendarPickerComponent implements OnInit, OnChanges {
  @Input() checkIn: Date | null = null;
  @Input() checkOut: Date | null = null;
  @Output() rangeChange = new EventEmitter<DateRange>();

  // Modo flexible
  flexibleMode = false;
  flexibleDays = 0;

  currentMonth = new Date();
  leftMonthDays: CalendarDay[] = [];
  rightMonthDays: CalendarDay[] = [];
  hoveredDate: Date | null = null;

  weekDays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

  constructor() {
    addIcons({ chevronForwardOutline, chevronBackOutline });
  }

  ngOnInit(): void {
    this.generateCalendars();
  }

  ngOnChanges(): void {
    this.generateCalendars();
  }

  // ================= MODO FLEXIBLE =================
  setFlexibleMode(enabled: boolean) {
    this.flexibleMode = enabled;
    if (!enabled) {
      this.flexibleDays = 0;
    }
  }

  setFlexibleDays(days: number) {
    this.flexibleDays = days;
    if (this.flexibleMode && this.checkIn) {
      // Calcular checkout flexible
      const checkout = new Date(this.checkIn);
      checkout.setDate(checkout.getDate() + days);
      this.checkOut = checkout;
      this.emit();
    }
  }

  // ================= GENERACIÓN CALENDARIO =================
  generateCalendars() {
    this.leftMonthDays = this.generateMonth(this.currentMonth);
    const nextMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.rightMonthDays = this.generateMonth(nextMonth);
  }

  generateMonth(monthDate: Date): CalendarDay[] {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();
    let startWeekDay = firstDay.getDay();
    if (startWeekDay === 0) startWeekDay = 7;

    const days: CalendarDay[] = [];

    // Días vacíos
    for (let i = 1; i < startWeekDay; i++) {
      days.push({ date: new Date(), label: 0, currentMonth: false });
    }

    // Días del mes
    for (let d = 1; d <= totalDays; d++) {
      days.push({ date: new Date(year, month, d), label: d, currentMonth: true });
    }

    return days;
  }

  // ================= SELECCIÓN DE FECHAS =================
  selectDate(day: CalendarDay) {
    if (!day.currentMonth) return;
    const selected = new Date(day.date);

    if (!this.checkIn || (this.checkIn && this.checkOut)) {
      this.checkIn = selected;
      this.checkOut = null;
      this.emit();
      return;
    }

    if (this.isSameDate(selected, this.checkIn)) return;

    if (selected > this.checkIn) {
      this.checkOut = selected;
      this.emit();
      return;
    }

    this.checkIn = selected;
    this.checkOut = null;
    this.emit();
  }

  hoverDate(day: CalendarDay) {
    if (!day.currentMonth) return;
    this.hoveredDate = day.date;
  }

  // ================= ESTADOS VISUALES =================
  isStart(date: Date): boolean {
    return !!(this.checkIn && this.isSameDate(date, this.checkIn));
  }

  isEnd(date: Date): boolean {
    return !!(this.checkOut && this.isSameDate(date, this.checkOut));
  }

  isInRange(date: Date): boolean {
    if (!this.checkIn || !this.checkOut) return false;
    return date > this.checkIn && date < this.checkOut;
  }

  isPreview(date: Date): boolean {
    if (!this.checkIn || this.checkOut || !this.hoveredDate) return false;
    return date > this.checkIn && date < this.hoveredDate;
  }

  isToday(date: Date): boolean {
    return this.isSameDate(date, new Date());
  }

  // ================= NAVEGACIÓN =================
  prevMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.generateCalendars();
  }

  nextMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.generateCalendars();
  }

  clearDates() {
    this.checkIn = null;
    this.checkOut = null;
    this.flexibleDays = 0;
    this.emit();
  }

  // ================= HELPERS =================
  getMonthName(date: Date): string {
    return date.toLocaleDateString('es-EC', { month: 'long', year: 'numeric' });
  }

  get nextMonthDate(): Date {
    return new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
  }

  isSameDate(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth() === b.getMonth() &&
           a.getDate() === b.getDate();
  }

  emit() {
    this.rangeChange.emit({ checkIn: this.checkIn, checkOut: this.checkOut });
  }
}