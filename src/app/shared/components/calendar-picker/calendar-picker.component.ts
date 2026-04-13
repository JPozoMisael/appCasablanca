import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, closeOutline } from 'ionicons/icons';

export interface DateRange {
  checkIn: Date | null;
  checkOut: Date | null;
}

@Component({
  selector: 'app-calendar-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, IonIcon],
  templateUrl: './calendar-picker.component.html',
  styleUrls: ['./calendar-picker.component.scss'],
})
export class CalendarPickerComponent implements OnChanges {

  @Input() checkIn: Date | null = null;
  @Input() checkOut: Date | null = null;

  @Output() rangeChange = new EventEmitter<DateRange>();

  checkInStr = '';
  checkOutStr = '';

  constructor() {
    addIcons({ calendarOutline, closeOutline });
  }

  ngOnChanges(): void {
    this.checkInStr = this.checkIn ? this.toInputDate(this.checkIn) : '';
    this.checkOutStr = this.checkOut ? this.toInputDate(this.checkOut) : '';
  }

  onCheckIn(value: string) {
    const inDate = value ? new Date(value + 'T00:00:00') : null;

    let outDate = this.checkOut;

    if (inDate && outDate && outDate <= inDate) {
      outDate = null;
      this.checkOutStr = '';
    }

    this.checkIn = inDate;
    this.checkOut = outDate;
    this.checkInStr = value;

    this.emit();
  }

  onCheckOut(value: string) {
    const outDate = value ? new Date(value + 'T00:00:00') : null;

    if (this.checkIn && outDate && outDate <= this.checkIn) {
      this.checkOut = null;
      this.checkOutStr = '';
      this.emit();
      return;
    }

    this.checkOut = outDate;
    this.checkOutStr = value;

    this.emit();
  }

  onClear() {
    this.checkIn = null;
    this.checkOut = null;
    this.checkInStr = '';
    this.checkOutStr = '';
    this.emit();
  }

  private emit() {
    this.rangeChange.emit({
      checkIn: this.checkIn,
      checkOut: this.checkOut
    });
  }

  private toInputDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

}