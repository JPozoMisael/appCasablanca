import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusLabel',
  standalone: true,
})
export class StatusLabelPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';

    const map: Record<string, string> = {
      // Reserva
      PENDIENTE: 'Pendiente',
      CONFIRMADA: 'Confirmada',
      CHECKIN: 'Check-in',
      CHECKOUT: 'Check-out',
      CANCELADA: 'Cancelada',

      // Habitación
      DISPONIBLE: 'Disponible',
      OCUPADA: 'Ocupada',
      MANTENIMIENTO: 'Mantenimiento',
      LIMPIEZA: 'Limpieza',
    };

    return map[value] ?? this.titleize(value);
  }

  private titleize(s: string): string {
    return s
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
