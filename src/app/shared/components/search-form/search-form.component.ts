import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonIcon } from '@ionic/angular/standalone';
import { CatalogoService } from '@app/core/services/catalogo.service';
import { Zona } from '@app/shared/models/marketplace.model';
import { hoyISO, nochesEntre, sumarDias } from '@app/shared/utils/format';

export interface BusquedaFormValue {
  zona: string;
  checkIn: string;
  checkOut: string;
  adultos: number;
  ninos: number;
  habitaciones: number;
}

/** Barra de búsqueda: destino (zona de Salinas), fechas y huéspedes. */
@Component({
  selector: 'app-search-form',
  standalone: true,
  imports: [FormsModule, IonIcon],
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.scss'],
})
export class SearchFormComponent implements OnInit {
  private catalogo = inject(CatalogoService);

  @Input() valor: Partial<BusquedaFormValue> = {};
  /** Oculta el selector de destino (p. ej. dentro de la página de un hotel). */
  @Input() sinDestino = false;
  @Input() etiquetaBoton = 'Buscar';
  @Output() buscar = new EventEmitter<BusquedaFormValue>();

  readonly filas: { k: 'adultos' | 'ninos' | 'habitaciones'; t: string }[] = [
    { k: 'adultos', t: 'Adultos' },
    { k: 'ninos', t: 'Niños' },
    { k: 'habitaciones', t: 'Habitaciones' },
  ];

  zonas: Zona[] = [];
  hoy = hoyISO();
  zona = '';
  checkIn = '';
  checkOut = '';
  adultos = 2;
  ninos = 0;
  habitaciones = 1;
  huespedesAbierto = false;
  error = '';

  ngOnInit(): void {
    this.zona = this.valor.zona ?? '';
    this.checkIn = this.valor.checkIn ?? '';
    this.checkOut = this.valor.checkOut ?? '';
    this.adultos = this.valor.adultos ?? 2;
    this.ninos = this.valor.ninos ?? 0;
    this.habitaciones = this.valor.habitaciones ?? 1;
    if (!this.sinDestino) this.catalogo.zonas().subscribe((z) => (this.zonas = z));
  }

  get noches(): number {
    return nochesEntre(this.checkIn, this.checkOut);
  }

  get resumenHuespedes(): string {
    const h = `${this.adultos} adulto${this.adultos === 1 ? '' : 's'}`;
    const n = this.ninos ? ` · ${this.ninos} niño${this.ninos === 1 ? '' : 's'}` : '';
    return `${h}${n} · ${this.habitaciones} hab.`;
  }

  alCambiarEntrada(): void {
    this.error = '';
    // La salida siempre debe ser posterior a la entrada.
    if (this.checkIn && (!this.checkOut || this.checkOut <= this.checkIn)) {
      this.checkOut = sumarDias(this.checkIn, 1);
    }
  }

  valorDe(campo: 'adultos' | 'ninos' | 'habitaciones'): number {
    return this[campo];
  }

  cambiar(campo: 'adultos' | 'ninos' | 'habitaciones', delta: number): void {
    const limites = { adultos: [1, 30], ninos: [0, 20], habitaciones: [1, 6] } as const;
    const [min, max] = limites[campo];
    this[campo] = Math.min(max, Math.max(min, this[campo] + delta));
  }

  enviar(): void {
    const tieneUna = !!this.checkIn || !!this.checkOut;
    if (tieneUna && (!this.checkIn || !this.checkOut)) {
      this.error = 'Elige la fecha de entrada y la de salida.';
      return;
    }
    if (this.checkIn && this.checkOut <= this.checkIn) {
      this.error = 'La salida debe ser posterior a la entrada.';
      return;
    }
    this.error = '';
    this.huespedesAbierto = false;
    this.buscar.emit({
      zona: this.zona,
      checkIn: this.checkIn,
      checkOut: this.checkOut,
      adultos: this.adultos,
      ninos: this.ninos,
      habitaciones: this.habitaciones,
    });
  }
}
