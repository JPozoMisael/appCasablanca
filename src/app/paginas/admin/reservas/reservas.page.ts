import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { GestionService, Meta } from '@app/core/services/gestion.service';
import { MenuService } from '@app/core/services/menu.service';
import { Reserva } from '@app/shared/models/marketplace.model';
import { MoneyPipe } from '@app/shared/pipes/money.pipe';
import { ETIQUETA_ESTADO, fechaCorta, fechaLarga } from '@app/shared/utils/format';

type Accion = 'confirmar' | 'checkin' | 'checkout' | 'no-show' | 'cancelar';

@Component({
  selector: 'app-admin-reservas',
  standalone: true,
  imports: [FormsModule, MoneyPipe],
  templateUrl: './reservas.page.html',
})
export class AdminReservasPage implements OnInit {
  private gestion = inject(GestionService);
  private menu = inject(MenuService);
  private route = inject(ActivatedRoute);

  reservas: Reserva[] = [];
  meta: Meta | null = null;
  cargando = true;
  error = '';
  mensaje = '';

  // filtros
  estado = '';
  texto = '';
  desde = '';
  hasta = '';
  page = 1;

  // detalle
  detalle: Reserva | null = null;
  monto: number | null = null;
  metodo = 'efectivo';
  referencia = '';
  procesando = false;

  readonly estados = ETIQUETA_ESTADO;
  readonly opcionesEstado = Object.entries(ETIQUETA_ESTADO).map(([v, e]) => ({ v, t: e.texto }));
  readonly fechaCorta = fechaCorta;
  readonly fechaLarga = fechaLarga;

  ngOnInit(): void {
    // Llegan aquí desde el calendario o desde "nueva reserva" con ?texto=CÓDIGO
    this.texto = this.route.snapshot.queryParamMap.get('texto') ?? '';
    this.cargar();
  }

  filtrar(): void {
    this.page = 1;
    this.cargar();
  }

  irA(p: number): void {
    this.page = p;
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.gestion
      .reservas({ estado: this.estado, texto: this.texto.trim(), desde: this.desde, hasta: this.hasta, page: this.page, limit: 20 })
      .subscribe({
        next: (r) => {
          this.reservas = r.data;
          this.meta = r.meta ?? null;
          this.cargando = false;
        },
        error: (e) => {
          this.error = e?.error?.message ?? 'No pudimos cargar las reservas.';
          this.cargando = false;
        },
      });
  }

  habitaciones(r: Reserva): string {
    return (r.detalles ?? [])
      .map((d) => `${d.habitacion?.numero_habitacion ?? ''}${d.habitacion?.tipoHabitacion ? ' ' + d.habitacion.tipoHabitacion.nombre : ''}`.trim())
      .join(', ');
  }

  get puedeGestionar(): boolean {
    return this.menu.tiene('reservas.gestionar');
  }

  get puedeCobrar(): boolean {
    return this.menu.tiene('pagos.registrar');
  }

  acciones(r: Reserva): { a: Accion; t: string; cls: string }[] {
    if (!this.puedeGestionar) return [];
    switch (r.estado) {
      case 'pendiente':
        return [{ a: 'confirmar', t: 'Confirmar', cls: 'ok' }, { a: 'cancelar', t: 'Cancelar', cls: 'danger out' }];
      case 'confirmada':
        return [
          { a: 'checkin', t: 'Check-in', cls: '' },
          { a: 'no-show', t: 'No se presentó', cls: 'out' },
          { a: 'cancelar', t: 'Cancelar', cls: 'danger out' },
        ];
      case 'check_in':
        return [{ a: 'checkout', t: 'Check-out', cls: '' }];
      default:
        return [];
    }
  }

  ejecutar(r: Reserva, a: Accion): void {
    if (a === 'cancelar' && !confirm(`¿Cancelar la reserva ${r.codigo_reserva}?`)) return;
    this.procesando = true;
    this.gestion.transicion(r.id, a).subscribe({
      next: (nueva) => {
        this.mensaje = `Reserva ${r.codigo_reserva}: ${this.estados[nueva.estado].texto.toLowerCase()}.`;
        this.procesando = false;
        if (this.detalle?.id === r.id) this.detalle = nueva;
        this.cargar();
      },
      error: (e) => {
        this.error = e?.error?.message ?? 'No se pudo completar la acción.';
        this.procesando = false;
      },
    });
  }

  abrir(r: Reserva): void {
    this.monto = null;
    this.referencia = '';
    this.metodo = 'efectivo';
    this.gestion.reserva(r.id).subscribe({
      next: (d) => {
        this.detalle = d;
        this.monto = d.saldo > 0 ? d.saldo : null;
      },
      error: (e) => (this.error = e?.error?.message ?? 'No se pudo abrir la reserva.'),
    });
  }

  cobrar(): void {
    if (!this.detalle || !this.monto) return;
    this.procesando = true;
    this.gestion
      .registrarPago({ reserva_id: this.detalle.id, monto: Number(this.monto), metodo: this.metodo, referencia: this.referencia.trim() || undefined })
      .subscribe({
        next: () => {
          this.mensaje = 'Pago registrado.';
          this.procesando = false;
          this.abrir(this.detalle as Reserva);
          this.cargar();
        },
        error: (e) => {
          this.error = e?.error?.message ?? 'No se pudo registrar el pago.';
          this.procesando = false;
        },
      });
  }

  get paginas(): number[] {
    return Array.from({ length: this.meta?.pages ?? 0 }, (_, i) => i + 1);
  }
}
