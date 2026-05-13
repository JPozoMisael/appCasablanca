import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  chevronForwardOutline,
  chevronBackOutline
} from 'ionicons/icons';

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
  imports: [
    CommonModule,
    IonIcon
  ],
  templateUrl: './calendar-picker.component.html',
  styleUrls: ['./calendar-picker.component.scss'],
})
export class CalendarPickerComponent
implements OnInit, OnChanges {

  // ======================================================
  // INPUTS
  // ======================================================

  @Input() checkIn: Date | null = null;
  @Input() checkOut: Date | null = null;

  // ======================================================
  // OUTPUTS
  // ======================================================

  @Output() rangeChange =
    new EventEmitter<DateRange>();

  // ======================================================
  // CALENDAR
  // ======================================================

  currentMonth = new Date();

  leftMonthDays: CalendarDay[] = [];
  rightMonthDays: CalendarDay[] = [];

  hoveredDate: Date | null = null;

  weekDays = [
    'Lu',
    'Ma',
    'Mi',
    'Ju',
    'Vi',
    'Sá',
    'Do'
  ];

  // ======================================================
  // CONSTRUCTOR
  // ======================================================

  constructor() {

    addIcons({
      chevronForwardOutline,
      chevronBackOutline
    });
  }

  // ======================================================
  // INIT
  // ======================================================

  ngOnInit(): void {
    this.generateCalendars();
  }

  ngOnChanges(): void {
    this.generateCalendars();
  }

  // ======================================================
  // GENERATE
  // ======================================================

  generateCalendars() {

    this.leftMonthDays =
      this.generateMonth(
        this.currentMonth
      );

    const nextMonth =
      new Date(
        this.currentMonth.getFullYear(),
        this.currentMonth.getMonth() + 1,
        1
      );

    this.rightMonthDays =
      this.generateMonth(nextMonth);
  }

  // ======================================================
  // MONTH GENERATOR
  // ======================================================

  generateMonth(monthDate: Date): CalendarDay[] {

    const year =
      monthDate.getFullYear();

    const month =
      monthDate.getMonth();

    const firstDay =
      new Date(year, month, 1);

    const lastDay =
      new Date(year, month + 1, 0);

    const totalDays =
      lastDay.getDate();

    let startWeekDay =
      firstDay.getDay();

    if (startWeekDay === 0) {
      startWeekDay = 7;
    }

    const days: CalendarDay[] = [];

    // empty spaces
    for (let i = 1; i < startWeekDay; i++) {

      days.push({
        date: new Date(),
        label: 0,
        currentMonth: false
      });
    }

    // month days
    for (let d = 1; d <= totalDays; d++) {

      days.push({

        date: new Date(year, month, d),

        label: d,

        currentMonth: true
      });
    }

    return days;
  }

  // ======================================================
  // CLICK DAY
  // ======================================================

  selectDate(day: CalendarDay) {

    if (!day.currentMonth) {
      return;
    }

    const selected =
      new Date(day.date);

    // reset
    if (
      !this.checkIn ||
      (this.checkIn && this.checkOut)
    ) {

      this.checkIn = selected;
      this.checkOut = null;

      this.emit();

      return;
    }

    // same day
    if (
      this.isSameDate(
        selected,
        this.checkIn
      )
    ) {
      return;
    }

    // checkout
    if (selected > this.checkIn) {

      this.checkOut = selected;

      this.emit();

      return;
    }

    // restart
    this.checkIn = selected;
    this.checkOut = null;

    this.emit();
  }

  // ======================================================
  // HOVER
  // ======================================================

  hoverDate(day: CalendarDay) {

    if (!day.currentMonth) {
      return;
    }

    this.hoveredDate = day.date;
  }

  // ======================================================
  // STATES
  // ======================================================

  isStart(date: Date): boolean {

    return !!(
      this.checkIn &&
      this.isSameDate(
        date,
        this.checkIn
      )
    );
  }

  isEnd(date: Date): boolean {

    return !!(
      this.checkOut &&
      this.isSameDate(
        date,
        this.checkOut
      )
    );
  }

  isInRange(date: Date): boolean {

    if (
      !this.checkIn ||
      !this.checkOut
    ) {
      return false;
    }

    return (
      date > this.checkIn &&
      date < this.checkOut
    );
  }

  // preview hover
  isPreview(date: Date): boolean {

    if (
      !this.checkIn ||
      this.checkOut ||
      !this.hoveredDate
    ) {
      return false;
    }

    return (
      date > this.checkIn &&
      date < this.hoveredDate
    );
  }

  // today
  isToday(date: Date): boolean {

    return this.isSameDate(
      date,
      new Date()
    );
  }

  // ======================================================
  // NAVIGATION
  // ======================================================

  prevMonth() {

    this.currentMonth =
      new Date(
        this.currentMonth.getFullYear(),
        this.currentMonth.getMonth() - 1,
        1
      );

    this.generateCalendars();
  }

  nextMonth() {

    this.currentMonth =
      new Date(
        this.currentMonth.getFullYear(),
        this.currentMonth.getMonth() + 1,
        1
      );

    this.generateCalendars();
  }

  // ======================================================
  // CLEAR
  // ======================================================

  clearDates() {

    this.checkIn = null;
    this.checkOut = null;

    this.emit();
  }

  // ======================================================
  // HELPERS
  // ======================================================

  getMonthName(date: Date): string {

    return date.toLocaleDateString(
      'es-EC',
      {
        month: 'long',
        year: 'numeric'
      }
    );
  }

  isSameDate(
    a: Date,
    b: Date
  ): boolean {

    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  // ======================================================
  // EMIT
  // ======================================================

  emit() {

    this.rangeChange.emit({

      checkIn: this.checkIn,

      checkOut: this.checkOut
    });
  }

  get nextMonthDate(): Date {
  return new Date(
    this.currentMonth.getFullYear(),
    this.currentMonth.getMonth() + 1,
    1
  );
}
}