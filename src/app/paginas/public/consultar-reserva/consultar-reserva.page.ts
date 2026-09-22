import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '@app/core/services/api.service';
import { BookingService } from '@app/core/services/booking.service';
import { Reserva } from '@app/shared/models/marketplace.model';
import { MoneyPipe } from '@app/shared/pipes/money.pipe';
import { ETIQUETA_ESTADO, fechaLarga } from '@app/shared/utils/format';

/** Consulta y cancelación de una reserva hecha sin cuenta (código + correo de contacto). */
@Component({
  selector: 'app-consultar-reserva',
  standalone: true,
  imports: [FormsModule, RouterLink, MoneyPipe],
  templateUrl: './consultar-reserva.page.html',
  styleUrls: ['./consultar-reserva.page.scss'],
})
export class ConsultarReservaPage implements OnInit {
  private route = inject(ActivatedRoute);
  private booking = inject(BookingService);
  private api = inject(ApiService);

  codigo = '';
  email = '';
  reserva: Reserva | null = null;
  cargando = false;
  error = '';
  mensaje = '';
  confirmandoCancelacion = false;
  motivo = '';

  readonly estados = ETIQUETA_ESTADO;
  readonly fechaLarga = fechaLarga;

  ngOnInit(): void {
    this.codigo = this.route.snapshot.queryParamMap.get('codigo') ?? '';
  }

  get puedeCancelar(): boolean {
    return !!this.reserva && ['pendiente', 'confirmada'].includes(this.reserva.estado);
  }

  buscar(): void {
    this.error = '';
    this.mensaje = '';
    if (!this.codigo.trim() || !this.email.trim()) {
      this.error = 'Ingresa el código de reserva y el correo que usaste al reservar.';
      return;
    }
    this.cargando = true;
    this.booking.consultar(this.codigo.trim().toUpperCase(), this.email.trim()).subscribe({
      next: (r) => {
        this.reserva = r;
        this.cargando = false;
      },
      error: (e) => {
        this.reserva = null;
        this.cargando = false;
        this.error =
          e?.status === 404
            ? 'No encontramos una reserva con esos datos. Revisa el código y el correo.'
            : (e?.error?.message ?? 'No pudimos consultar la reserva.');
      },
    });
  }

  cancelar(): void {
    if (!this.reserva) return;
    this.cargando = true;
    this.api
      .post<{ data: Reserva }>('/bookings/lookup/cancelar', {
        codigo: this.reserva.codigo_reserva,
        email: this.email.trim(),
        motivo: this.motivo.trim() || undefined,
      })
      .subscribe({
        next: (r) => {
          this.reserva = r.data;
          this.mensaje = 'Tu reserva fue cancelada.';
          this.confirmandoCancelacion = false;
          this.cargando = false;
        },
        error: (e) => {
          this.error = e?.error?.message ?? 'No se pudo cancelar la reserva.';
          this.confirmandoCancelacion = false;
          this.cargando = false;
        },
      });
  }
}
