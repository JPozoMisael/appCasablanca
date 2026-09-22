import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { BookingService } from '@app/core/services/booking.service';
import { Reserva } from '@app/shared/models/marketplace.model';
import { MoneyPipe } from '@app/shared/pipes/money.pipe';
import { ETIQUETA_ESTADO, fechaCorta, hoyISO, imagenUrl } from '@app/shared/utils/format';

type Pestana = 'proximas' | 'pasadas' | 'canceladas';

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [RouterLink, FormsModule, IonIcon, MoneyPipe],
  templateUrl: './mis-reservas.page.html',
  styleUrls: ['./mis-reservas.page.scss'],
})
export class MisReservasPage implements OnInit {
  private booking = inject(BookingService);

  reservas: Reserva[] = [];
  pestana: Pestana = 'proximas';
  cargando = true;
  error = '';
  mensaje = '';

  // cancelación
  cancelando: Reserva | null = null;
  detalleCancelacion: Reserva | null = null;
  motivo = '';
  procesando = false;

  // reseña
  resenando: Reserva | null = null;
  puntuacion = 0;
  titulo = '';
  comentario = '';

  readonly estados = ETIQUETA_ESTADO;
  readonly fechaCorta = fechaCorta;
  readonly puntos = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.booking.misReservas({ limit: 100 }).subscribe({
      next: (r) => {
        this.reservas = r.data;
        this.cargando = false;
      },
      error: (e) => {
        this.error = e?.error?.message ?? 'No pudimos cargar tus reservas.';
        this.cargando = false;
      },
    });
  }

  get visibles(): Reserva[] {
    return this.filtrar(this.pestana);
  }

  conteo(p: Pestana): number {
    return this.filtrar(p).length;
  }

  private filtrar(p: Pestana): Reserva[] {
    const hoy = hoyISO();
    const activa = (r: Reserva) => ['pendiente', 'confirmada', 'check_in'].includes(r.estado);
    switch (p) {
      case 'proximas':
        return this.reservas
          .filter((r) => activa(r) && r.fecha_salida >= hoy)
          .sort((a, b) => a.fecha_entrada.localeCompare(b.fecha_entrada));
      case 'pasadas':
        return this.reservas.filter((r) => r.estado === 'check_out' || (activa(r) && r.fecha_salida < hoy));
      default:
        return this.reservas.filter((r) => ['cancelada', 'no_show'].includes(r.estado));
    }
  }

  imagen(r: Reserva): string {
    return imagenUrl(r.hotel?.imagen_principal);
  }

  puedeCancelar(r: Reserva): boolean {
    return ['pendiente', 'confirmada'].includes(r.estado);
  }

  puedeValorar(r: Reserva): boolean {
    return r.estado === 'check_out' && !r.valoracion;
  }

  // ---------- cancelar ----------
  pedirCancelacion(r: Reserva): void {
    this.cancelando = r;
    this.detalleCancelacion = null;
    this.motivo = '';
    this.booking.obtener(r.id).subscribe({ next: (d) => (this.detalleCancelacion = d) });
  }

  confirmarCancelacion(): void {
    if (!this.cancelando) return;
    this.procesando = true;
    this.booking.cancelar(this.cancelando.id, this.motivo.trim() || undefined).subscribe({
      next: () => {
        this.mensaje = 'Tu reserva fue cancelada.';
        this.cancelando = null;
        this.procesando = false;
        this.cargar();
      },
      error: (e) => {
        this.error = e?.error?.message ?? 'No se pudo cancelar la reserva.';
        this.cancelando = null;
        this.procesando = false;
      },
    });
  }

  // ---------- reseña ----------
  abrirResena(r: Reserva): void {
    this.resenando = r;
    this.puntuacion = 0;
    this.titulo = '';
    this.comentario = '';
  }

  enviarResena(): void {
    if (!this.resenando || !this.puntuacion) return;
    this.procesando = true;
    this.booking.valorar(this.resenando.id, this.puntuacion, this.titulo.trim() || undefined, this.comentario.trim() || undefined).subscribe({
      next: () => {
        this.mensaje = '¡Gracias por tu opinión!';
        this.resenando = null;
        this.procesando = false;
        this.cargar();
      },
      error: (e) => {
        this.error = e?.error?.message ?? 'No se pudo guardar tu opinión.';
        this.resenando = null;
        this.procesando = false;
      },
    });
  }
}
