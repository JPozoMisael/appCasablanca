import { Component, Input } from '@angular/core';
import { etiquetaRating } from '@app/shared/utils/format';

/** Nota 0–10 estilo Booking: cuadro azul + calificación textual + número de opiniones. */
@Component({
  selector: 'app-rating-badge',
  standalone: true,
  template: `
    <span class="rb" [class.nuevo]="!total">
      @if (total) {
        <span class="score">{{ rating.toFixed(1) }}</span>
      } @else {
        <span class="score">★</span>
      }
      <span class="txt">
        <strong>{{ etiqueta }}</strong>
        @if (total && mostrarTotal) {
          <small>{{ total }} {{ total === 1 ? 'opinión' : 'opiniones' }}</small>
        }
      </span>
    </span>
  `,
  styles: [
    `
      .rb { display: inline-flex; align-items: center; gap: 8px; }
      .score {
        min-width: 34px; height: 34px; padding: 0 6px; display: grid; place-items: center;
        background: var(--brand-primary); color: #fff; font-weight: 800; font-size: 14px;
        border-radius: 8px 8px 8px 0;
      }
      .nuevo .score { background: var(--brand-primary-2); }
      .txt { display: flex; flex-direction: column; line-height: 1.15; text-align: right; }
      strong { font-size: 13px; color: var(--text); }
      small { font-size: 12px; color: var(--muted-2); }
    `,
  ],
})
export class RatingBadgeComponent {
  @Input() rating = 0;
  @Input() total = 0;
  @Input() mostrarTotal = true;

  get etiqueta(): string {
    return etiquetaRating(this.rating, this.total);
  }
}
