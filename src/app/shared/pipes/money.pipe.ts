import { Pipe, PipeTransform } from '@angular/core';

/** Formato de dinero: sin decimales si el valor es entero ($70), con centavos si los tiene ($241,50). */
@Pipe({
  name: 'money',
  standalone: true,
})
export class MoneyPipe implements PipeTransform {
  transform(value: number | string | null | undefined, currency: string = 'USD'): string {
    const n = typeof value === 'string' ? Number(value) : value;
    if (n === null || n === undefined || Number.isNaN(n)) return '';
    const conCentavos = Math.abs(n - Math.round(n)) > 0.004;
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency,
      minimumFractionDigits: conCentavos ? 2 : 0,
      maximumFractionDigits: 2,
    }).format(n);
  }
}
