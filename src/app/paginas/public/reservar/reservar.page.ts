import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { AuthService } from '@app/core/services/auth.service';
import { BookingService } from '@app/core/services/booking.service';
import { CatalogoService } from '@app/core/services/catalogo.service';
import { Cotizacion, HotelFicha, ItemReserva } from '@app/shared/models/marketplace.model';
import { MoneyPipe } from '@app/shared/pipes/money.pipe';
import { fechaLarga, imagenUrl } from '@app/shared/utils/format';

@Component({
  selector: 'app-reservar',
  standalone: true,
  imports: [FormsModule, RouterLink, IonIcon, MoneyPipe],
  templateUrl: './reservar.page.html',
  styleUrls: ['./reservar.page.scss'],
})
export class ReservarPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private catalogo = inject(CatalogoService);
  private booking = inject(BookingService);
  private auth = inject(AuthService);

  hotel: HotelFicha | null = null;
  cotizacion: Cotizacion | null = null;

  slug = '';
  checkIn = '';
  checkOut = '';
  adultos = 2;
  ninos = 0;
  items: ItemReserva[] = [];
  extras: Record<number, number> = {};

  contacto = { nombres: '', apellidos: '', email: '', telefono: '' };
  observaciones = '';
  aceptaTerminos = false;

  cargando = true;
  cotizando = false;
  enviando = false;
  error = '';
  errorCotizacion = '';
  intentado = false;

  readonly fechaLarga = fechaLarga;

  get logueado(): boolean {
    return this.auth.estaLogueado();
  }

  ngOnInit(): void {
    const q = this.route.snapshot.queryParamMap;
    this.slug = q.get('hotel') ?? '';
    this.checkIn = q.get('checkIn') ?? '';
    this.checkOut = q.get('checkOut') ?? '';
    this.adultos = Number(q.get('adultos')) || 2;
    this.ninos = Number(q.get('ninos')) || 0;
    this.items = (q.get('items') ?? '')
      .split(',')
      .map((p) => p.split(':').map(Number))
      .filter(([id, n]) => id > 0 && n > 0)
      .map(([id, n]) => ({ tipo_habitacion_id: id, cantidad: n }));

    if (!this.slug || !this.checkIn || !this.checkOut || !this.items.length) {
      this.router.navigate(['/buscar']);
      return;
    }

    const u = this.auth.usuario();
    if (u) {
      this.contacto.nombres = u.nombre ?? '';
      this.contacto.apellidos = u.apellido ?? '';
      this.contacto.email = u.email ?? '';
    }

    this.catalogo.hotel(this.slug).subscribe({
      next: (h) => {
        this.hotel = h;
        this.cargando = false;
        this.cotizar();
      },
      error: () => {
        this.cargando = false;
        this.error = 'No encontramos el alojamiento.';
      },
    });
  }

  get imagen(): string {
    return imagenUrl(this.hotel?.imagen_principal);
  }

  cotizar(): void {
    if (!this.hotel) return;
    this.cotizando = true;
    this.errorCotizacion = '';
    const servicios = Object.entries(this.extras)
      .filter(([, n]) => n > 0)
      .map(([id, n]) => ({ servicio_id: Number(id), cantidad: n }));

    this.booking
      .cotizar({
        hotel_id: this.hotel.id,
        fecha_entrada: this.checkIn,
        fecha_salida: this.checkOut,
        adultos: this.adultos,
        ninos: this.ninos,
        habitaciones: this.items,
        servicios,
      })
      .subscribe({
        next: (c) => {
          this.cotizacion = c;
          this.cotizando = false;
        },
        error: (e) => {
          this.cotizacion = null;
          this.cotizando = false;
          this.errorCotizacion =
            e?.error?.message ?? 'No pudimos calcular el precio. Vuelve al alojamiento y elige de nuevo.';
        },
      });
  }

  cambiarExtra(id: number, delta: number): void {
    this.extras = { ...this.extras, [id]: Math.max(0, Math.min(20, (this.extras[id] ?? 0) + delta)) };
    this.cotizar();
  }

  get urlActual(): string {
    return this.router.url;
  }

  get telefonoOk(): boolean {
    return this.contacto.telefono.replace(/\D/g, '').length >= 7;
  }

  get contactoValido(): boolean {
    const c = this.contacto;
    const emailOk = /^\S+@\S+\.\S+$/.test(c.email);
    return c.nombres.trim().length >= 2 && c.apellidos.trim().length >= 1 && emailOk && this.telefonoOk;
  }

  get puedeConfirmar(): boolean {
    return !!this.cotizacion && this.contactoValido && this.aceptaTerminos && !this.enviando;
  }

  confirmar(): void {
    this.intentado = true;
    if (!this.puedeConfirmar || !this.hotel) return;
    this.enviando = true;
    this.error = '';

    this.booking
      .crear({
        hotel_id: this.hotel.id,
        fecha_entrada: this.checkIn,
        fecha_salida: this.checkOut,
        adultos: this.adultos,
        ninos: this.ninos,
        habitaciones: this.items,
        servicios: Object.entries(this.extras)
          .filter(([, n]) => n > 0)
          .map(([id, n]) => ({ servicio_id: Number(id), cantidad: n })),
        contacto: { ...this.contacto, telefono: this.contacto.telefono.trim() },
        observaciones: this.observaciones.trim() || undefined,
        pago_en_hotel: true,
      })
      .subscribe({
        next: (reserva) => {
          this.router.navigate(['/reserva-confirmada'], {
            queryParams: { codigo: reserva.codigo_reserva },
            state: { reserva },
          });
        },
        error: (e) => {
          this.enviando = false;
          const code = e?.error?.code;
          this.error =
            code === 'SIN_DISPONIBILIDAD'
              ? 'Alguien reservó estas habitaciones mientras completabas tus datos. Vuelve al alojamiento y elige otras opciones.'
              : (e?.error?.message ?? 'No pudimos crear tu reserva. Intenta de nuevo.');
        },
      });
  }

  volver(): void {
    this.router.navigate(['/hotel', this.slug], {
      queryParams: { checkIn: this.checkIn, checkOut: this.checkOut, adultos: this.adultos, ninos: this.ninos || null },
    });
  }
}
