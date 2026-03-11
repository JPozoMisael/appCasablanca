import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'money',
  standalone: true,
})
export class MoneyPipe implements PipeTransform {
  transform(value: number | string | null | undefined, currency: string = 'USD'): string {
    const n = typeof value === 'string' ? Number(value) : value;
    if (n === null || n === undefined || Number.isNaN(n)) return '';

    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  }
}
