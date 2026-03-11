import { Pipe, PipeTransform } from '@angular/core';

type DateLike = Date | string | null | undefined;

@Pipe({
  name: 'dateRange',
  standalone: true,
})
export class DateRangePipe implements PipeTransform {
  transform(checkIn: DateLike, checkOut: DateLike, locale = 'es-EC'): string {
    const a = this.toDate(checkIn);
    const b = this.toDate(checkOut);
    if (!a || !b) return '';

    const fmt = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' });
    const fmtYear = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' });

    const sameYear = a.getFullYear() === b.getFullYear();
    const left = sameYear ? fmt.format(a) : fmtYear.format(a);
    const right = fmtYear.format(b);

    return `${left} - ${right}`;
  }

  private toDate(v: DateLike): Date | null {
    if (!v) return null;
    if (v instanceof Date) return isNaN(v.getTime()) ? null : v;

    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }
}
