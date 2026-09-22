import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { HotelResumen } from '@app/shared/models/marketplace.model';
import { RatingBadgeComponent } from '@app/shared/components/rating-badge/rating-badge.component';
import { MoneyPipe } from '@app/shared/pipes/money.pipe';
import { ETIQUETA_TIPO, imagenUrl } from '@app/shared/utils/format';

/** Tarjeta de alojamiento para resultados (lista) y carruseles (compacta). */
@Component({
  selector: 'app-hotel-card',
  standalone: true,
  imports: [RouterLink, IonIcon, RatingBadgeComponent, MoneyPipe],
  templateUrl: './hotel-card.component.html',
  styleUrls: ['./hotel-card.component.scss'],
})
export class HotelCardComponent {
  @Input({ required: true }) hotel!: HotelResumen;
  /** Parámetros de búsqueda que se conservan al abrir el hotel (fechas y huéspedes). */
  @Input() consulta: Record<string, string | number> = {};
  @Input() noches: number | null = null;
  @Input() compacta = false;
  @Input() esFavorito = false;
  @Output() favorito = new EventEmitter<HotelResumen>();

  readonly tipo = ETIQUETA_TIPO;
  readonly estrellas = [1, 2, 3, 4, 5];

  get imagen(): string {
    return imagenUrl(this.hotel.imagen_principal);
  }

  get pocasHabitaciones(): boolean {
    return (this.hotel.habitaciones_disponibles ?? 99) <= 3;
  }

  alFavorito(ev: Event): void {
    ev.preventDefault();
    ev.stopPropagation();
    this.favorito.emit(this.hotel);
  }
}
