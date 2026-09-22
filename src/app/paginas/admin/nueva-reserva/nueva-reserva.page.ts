import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '@app/core/services/api.service';
import { CatalogoService } from '@app/core/services/catalogo.service';
import { GestionService, Hab, HotelPerfil } from '@app/core/services/gestion.service';
import { MenuService } from '@app/core/services/menu.service';
import { Cotizacion, Disponibilidad, Reserva, TipoDisponible } from '@app/shared/models/marketplace.model';
import { MoneyPipe } from '@app/shared/pipes/money.pipe';
import { fechaLarga, hoyISO, nochesEntre, sumarDias } from '@app/shared/utils/format';

interface ClienteBusqueda { id: number; nombres: string; apellidos: string; email?: string | null; telefono?: string | null }

/** Reserva por teléfono, WhatsApp o mostrador, registrada por el personal del alojamiento. */
@Component({
  selector: 'app-nueva-reserva',
  standalone: true,
  imports: [FormsModule, RouterLink, MoneyPipe],
  templateUrl: './nueva-reserva.page.html',
})
export class NuevaReservaPage implements OnInit {
  private api = inject(ApiService);
  private catalogo = inject(CatalogoService);
  private gestion = inject(GestionService);
  private menu = inject(MenuService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  hotel: HotelPerfil | null = null;
  hoy = hoyISO();

  // búsqueda
  checkIn = '';
  checkOut = '';
  adultos = 2;
  ninos = 0;
  disp: Disponibilidad | null = null;
  buscando = false;

  // selección
  seleccion: Record<number, number> = {};
  habitacionFija: Hab | null = null;
  cotizacion: Cotizacion | null = null;
  cotizando = false;

  // huésped
  modoHuesped: 'nuevo' | 'existente' = 'nuevo';
  busqueda = '';
  resultados: ClienteBusqueda[] = [];
  clienteElegido: ClienteBusqueda | null = null;
  contacto = { nombres: '', apellidos: '', telefono: '', email: '' };

  // opciones
  canal: 'telefono' | 'whatsapp' | 'recepcion' = 'telefono';
  estadoInicial: 'confirmada' | 'pendiente' = 'confirmada';
  observaciones = '';

  cargando = true;
  enviando = false;
  error = '';
  creada: Reserva | null = null;
  readonly fechaLarga = fechaLarga;

  get puedeBuscarHuespedes(): boolean {
    return this.menu.tiene('huespedes.ver');
  }

  get noches(): number {
    return nochesEntre(this.checkIn, this.checkOut);
  }

  get totalHabitaciones(): number {
    return this.habitacionFija ? 1 : Object.values(this.seleccion).reduce((s, n) => s + n, 0);
  }

  get capacidad(): number {
    if (this.habitacionFija) return this.tipoDeFija?.capacidad_maxima ?? 0;
    return (this.disp?.habitaciones ?? []).reduce((s, t) => s + (this.seleccion[t.id] ?? 0) * t.capacidad_maxima, 0);
  }

  get tipoDeFija(): TipoDisponible | undefined {
    return this.disp?.habitaciones.find((t) => t.id === this.habitacionFija?.tipo_habitacion_id);
  }

  get contactoValido(): boolean {
    if (this.modoHuesped === 'existente') return !!this.clienteElegido;
    const c = this.contacto;
    return c.nombres.trim().length >= 2 && c.apellidos.trim().length >= 1 && (c.telefono.trim().length >= 7 || /^\S+@\S+\.\S+$/.test(c.email));
  }

  get puedeConfirmar(): boolean {
    return !!this.cotizacion && this.contactoValido && this.capacidad >= this.adultos + this.ninos && !this.enviando;
  }

  ngOnInit(): void {
    const q = this.route.snapshot.queryParamMap;
    this.checkIn = q.get('checkIn') ?? this.hoy;
    this.checkOut = sumarDias(this.checkIn, 1);

    this.gestion.perfil().subscribe({
      next: (h) => {
        this.hotel = h;
        const habId = Number(q.get('habitacion'));
        if (habId) {
          this.gestion.habitaciones().subscribe({
            next: (hs) => {
              this.habitacionFija = hs.find((x) => x.id === habId) ?? null;
              this.cargando = false;
              if (this.habitacionFija) this.buscar();
            },
            error: () => (this.cargando = false),
          });
        } else {
          this.cargando = false;
        }
      },
      error: (e) => {
        this.error =
          e?.error?.code === 'HOTEL_REQUERIDO'
            ? 'Elige un alojamiento en "Operando en" (arriba a la derecha) para registrar reservas.'
            : (e?.error?.message ?? 'No pudimos cargar el alojamiento.');
        this.cargando = false;
      },
    });
  }

  alCambiarEntrada(): void {
    if (this.checkIn && (!this.checkOut || this.checkOut <= this.checkIn)) this.checkOut = sumarDias(this.checkIn, 1);
    this.limpiarBusqueda();
  }

  limpiarBusqueda(): void {
    this.disp = null;
    this.cotizacion = null;
    this.seleccion = {};
    this.error = '';
  }

  // ---------- disponibilidad ----------
  buscar(): void {
    if (!this.hotel || !this.checkIn || !this.checkOut || this.checkOut <= this.checkIn) {
      this.error = 'Indica una fecha de entrada y una de salida posterior.';
      return;
    }
    this.buscando = true;
    this.error = '';
    this.cotizacion = null;
    this.catalogo.disponibilidad(this.hotel.slug, { checkIn: this.checkIn, checkOut: this.checkOut, adultos: this.adultos, ninos: this.ninos }).subscribe({
      next: (d) => {
        this.disp = d;
        this.buscando = false;
        if (this.habitacionFija) this.cotizar();
      },
      error: (e) => {
        this.error = e?.error?.message ?? 'No pudimos consultar la disponibilidad.';
        this.buscando = false;
      },
    });
  }

  opciones(t: TipoDisponible): number[] {
    return Array.from({ length: Math.min(t.disponibles, 6) + 1 }, (_, i) => i);
  }

  elegir(t: TipoDisponible, v: string): void {
    this.seleccion = { ...this.seleccion, [t.id]: Number(v) };
    this.cotizar();
  }

  quitarHabitacionFija(): void {
    this.habitacionFija = null;
    this.cotizacion = null;
  }

  private items(): unknown[] {
    if (this.habitacionFija) return [{ habitacion_id: this.habitacionFija.id }];
    return Object.entries(this.seleccion)
      .filter(([, n]) => n > 0)
      .map(([id, n]) => ({ tipo_habitacion_id: Number(id), cantidad: n }));
  }

  cotizar(): void {
    const items = this.items();
    if (!this.hotel || !items.length) {
      this.cotizacion = null;
      return;
    }
    this.cotizando = true;
    this.api
      .post<{ data: Cotizacion }>('/bookings/quote', {
        hotel_id: this.hotel.id,
        fecha_entrada: this.checkIn,
        fecha_salida: this.checkOut,
        adultos: this.adultos,
        ninos: this.ninos,
        habitaciones: items,
      })
      .subscribe({
        next: (r) => {
          this.cotizacion = r.data;
          this.cotizando = false;
          this.error = '';
        },
        error: (e) => {
          this.cotizacion = null;
          this.cotizando = false;
          this.error = e?.error?.message ?? 'No pudimos calcular el precio.';
        },
      });
  }

  // ---------- huésped ----------
  buscarHuesped(): void {
    const t = this.busqueda.trim();
    if (t.length < 2) {
      this.resultados = [];
      return;
    }
    this.api.get<{ data: ClienteBusqueda[] }>('/clients', { texto: t }).subscribe({ next: (r) => (this.resultados = r.data.slice(0, 8)), error: () => undefined });
  }

  elegirCliente(c: ClienteBusqueda): void {
    this.clienteElegido = c;
    this.resultados = [];
    this.busqueda = '';
  }

  // ---------- confirmar ----------
  confirmar(): void {
    if (!this.puedeConfirmar || !this.hotel) return;
    this.enviando = true;
    this.error = '';

    const c = this.contacto;
    const payload = {
      hotel_id: this.hotel.id,
      fecha_entrada: this.checkIn,
      fecha_salida: this.checkOut,
      adultos: this.adultos,
      ninos: this.ninos,
      habitaciones: this.items(),
      canal: this.canal,
      estado_inicial: this.estadoInicial,
      observaciones: this.observaciones.trim() || undefined,
      ...(this.modoHuesped === 'existente'
        ? { cliente_id: this.clienteElegido!.id }
        : {
            contacto: {
              nombres: c.nombres.trim(),
              apellidos: c.apellidos.trim(),
              ...(c.telefono.trim() ? { telefono: c.telefono.trim() } : {}),
              ...(c.email.trim() ? { email: c.email.trim() } : {}),
            },
          }),
    };

    this.gestion.crearReserva(payload).subscribe({
      next: (r) => {
        this.creada = r;
        this.enviando = false;
      },
      error: (e) => {
        this.enviando = false;
        this.error =
          e?.error?.code === 'SIN_DISPONIBILIDAD'
            ? 'Esas habitaciones ya no están disponibles. Vuelve a buscar.'
            : (e?.error?.details?.map((d: { campo: string; mensaje: string }) => d.mensaje).join(' · ') ?? e?.error?.message ?? 'No se pudo crear la reserva.');
      },
    });
  }

  otra(): void {
    this.creada = null;
    this.limpiarBusqueda();
    this.habitacionFija = null;
    this.clienteElegido = null;
    this.contacto = { nombres: '', apellidos: '', telefono: '', email: '' };
    this.observaciones = '';
    this.router.navigate([], { queryParams: {} });
  }
}
