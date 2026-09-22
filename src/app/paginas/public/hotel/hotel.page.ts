import { Component, HostListener, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { switchMap, tap, combineLatest } from 'rxjs';
import { AuthService } from '@app/core/services/auth.service';
import { BookingService } from '@app/core/services/booking.service';
import { CatalogoService } from '@app/core/services/catalogo.service';
import {
  Disponibilidad,
  HotelFicha,
  Imagen,
  TipoDisponible,
  TipoHabitacion,
  Valoracion,
} from '@app/shared/models/marketplace.model';
import { RatingBadgeComponent } from '@app/shared/components/rating-badge/rating-badge.component';
import { BusquedaFormValue, SearchFormComponent } from '@app/shared/components/search-form/search-form.component';
import { MoneyPipe } from '@app/shared/pipes/money.pipe';
import { ETIQUETA_TIPO, fechaLarga, imagenUrl, nochesEntre } from '@app/shared/utils/format';

@Component({
  selector: 'app-hotel',
  standalone: true,
  imports: [RouterLink, IonIcon, SearchFormComponent, RatingBadgeComponent, MoneyPipe],
  templateUrl: './hotel.page.html',
  styleUrls: ['./hotel.page.scss'],
})
export class HotelPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private catalogo = inject(CatalogoService);
  private booking = inject(BookingService);
  private auth = inject(AuthService);

  hotel: HotelFicha | null = null;
  disp: Disponibilidad | null = null;
  resenas: Valoracion[] = [];
  resenasMeta = { total: 0, page: 1, pages: 1 };

  cargando = true;
  noEncontrado = false;
  cargandoDisp = false;
  errorDisp = '';
  esFavorito = false;

  // búsqueda vigente (de la URL)
  checkIn = '';
  checkOut = '';
  adultos = 2;
  ninos = 0;

  /** tipo_habitacion_id → cantidad elegida */
  seleccion: Record<number, number> = {};

  lightbox = -1;
  readonly tipoLabel = ETIQUETA_TIPO;
  readonly fechaLarga = fechaLarga;

  ngOnInit(): void {
    combineLatest([this.route.paramMap, this.route.queryParamMap])
      .pipe(
        tap(([, q]) => {
          this.checkIn = q.get('checkIn') ?? '';
          this.checkOut = q.get('checkOut') ?? '';
          this.adultos = Number(q.get('adultos')) || 2;
          this.ninos = Number(q.get('ninos')) || 0;
        }),
        switchMap(([p]) => {
          const slug = p.get('slug') ?? '';
          if (this.hotel?.slug === slug) return [this.hotel];
          this.cargando = true;
          return this.catalogo.hotel(slug);
        })
      )
      .subscribe({
        next: (h) => {
          const primera = this.hotel?.slug !== h.slug;
          this.hotel = h;
          this.cargando = false;
          if (primera) {
            this.cargarResenas(1);
            this.cargarFavorito();
          }
          this.cargarDisponibilidad();
        },
        error: () => {
          this.cargando = false;
          this.noEncontrado = true;
        },
      });
  }

  // ---------- disponibilidad ----------
  get tieneFechas(): boolean {
    return !!this.checkIn && !!this.checkOut;
  }

  get noches(): number {
    return nochesEntre(this.checkIn, this.checkOut);
  }

  private cargarDisponibilidad(): void {
    this.disp = null;
    this.errorDisp = '';
    this.seleccion = {};
    if (!this.hotel || !this.tieneFechas) return;
    this.cargandoDisp = true;
    this.catalogo
      .disponibilidad(this.hotel.slug, { checkIn: this.checkIn, checkOut: this.checkOut, adultos: this.adultos, ninos: this.ninos })
      .subscribe({
        next: (d) => {
          this.disp = d;
          this.cargandoDisp = false;
        },
        error: (e) => {
          this.errorDisp = e?.error?.message ?? 'No pudimos consultar la disponibilidad.';
          this.cargandoDisp = false;
        },
      });
  }

  cambiarFechas(v: BusquedaFormValue): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        checkIn: v.checkIn || null,
        checkOut: v.checkOut || null,
        adultos: v.adultos,
        ninos: v.ninos || null,
      },
      queryParamsHandling: 'merge',
    });
  }

  // ---------- selección ----------
  opciones(t: TipoDisponible): number[] {
    return Array.from({ length: Math.min(t.disponibles, 6) + 1 }, (_, i) => i);
  }

  elegir(t: TipoDisponible, valor: string): void {
    this.seleccion = { ...this.seleccion, [t.id]: Number(valor) };
  }

  get totalHabitaciones(): number {
    return Object.values(this.seleccion).reduce((s, n) => s + n, 0);
  }

  get totalSeleccion(): number {
    if (!this.disp) return 0;
    return this.disp.habitaciones.reduce((s, t) => s + (this.seleccion[t.id] ?? 0) * (t.precio_total ?? 0), 0);
  }

  get capacidadSeleccion(): number {
    if (!this.disp) return 0;
    return this.disp.habitaciones.reduce((s, t) => s + (this.seleccion[t.id] ?? 0) * t.capacidad_maxima, 0);
  }

  get faltaCapacidad(): boolean {
    return this.totalHabitaciones > 0 && this.capacidadSeleccion < this.adultos + this.ninos;
  }

  reservar(): void {
    if (!this.hotel || !this.totalHabitaciones || this.faltaCapacidad) return;
    const items = Object.entries(this.seleccion)
      .filter(([, n]) => n > 0)
      .map(([id, n]) => `${id}:${n}`)
      .join(',');
    this.router.navigate(['/reservar'], {
      queryParams: {
        hotel: this.hotel.slug,
        checkIn: this.checkIn,
        checkOut: this.checkOut,
        adultos: this.adultos,
        ninos: this.ninos || null,
        items,
      },
    });
  }

  // ---------- galería ----------
  get galeria(): Imagen[] {
    const generales = (this.hotel?.imagenes ?? []).filter((i) => !i.tipo_habitacion_id);
    if (generales.length) return generales;
    return this.hotel?.imagen_principal ? [{ id: 0, url: this.hotel.imagen_principal, orden: 0 }] : [];
  }

  url(u?: string | null): string {
    return imagenUrl(u);
  }

  imagenDeTipo(t: TipoHabitacion): string {
    return imagenUrl(t.imagenes?.[0]?.url ?? this.galeria[0]?.url);
  }

  abrirLightbox(i: number): void {
    this.lightbox = i;
  }

  moverLightbox(delta: number): void {
    const n = this.galeria.length;
    if (n) this.lightbox = (this.lightbox + delta + n) % n;
  }

  @HostListener('document:keydown', ['$event'])
  teclas(ev: KeyboardEvent): void {
    if (this.lightbox < 0) return;
    if (ev.key === 'Escape') this.lightbox = -1;
    if (ev.key === 'ArrowRight') this.moverLightbox(1);
    if (ev.key === 'ArrowLeft') this.moverLightbox(-1);
  }

  // ---------- reseñas ----------
  cargarResenas(page: number): void {
    if (!this.hotel) return;
    this.catalogo.valoraciones(this.hotel.slug, page, 5).subscribe({
      next: (r) => {
        this.resenas = page === 1 ? r.data : [...this.resenas, ...r.data];
        this.resenasMeta = r.meta;
      },
      error: () => undefined,
    });
  }

  get promedio(): number {
    return Number(this.hotel?.rating_promedio ?? 0);
  }

  barra(p: number): number {
    const total = this.hotel?.total_valoraciones || 0;
    if (!total) return 0;
    const n = (this.hotel?.distribucion_puntuacion ?? []).filter((d) => d.puntuacion === p).reduce((s, d) => s + d.total, 0);
    return Math.round((n / total) * 100);
  }

  // ---------- favoritos ----------
  private cargarFavorito(): void {
    if (!this.auth.estaLogueado() || !this.hotel) return;
    const id = this.hotel.id;
    this.booking.favoritos().subscribe({ next: (f) => (this.esFavorito = f.some((x) => x.hotel.id === id)), error: () => undefined });
  }

  alternarFavorito(): void {
    if (!this.hotel) return;
    if (!this.auth.estaLogueado()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    const era = this.esFavorito;
    this.esFavorito = !era;
    (era ? this.booking.quitarFavorito(this.hotel.id) : this.booking.agregarFavorito(this.hotel.id)).subscribe({
      error: () => (this.esFavorito = era),
    });
  }

  irADisponibilidad(): void {
    document.getElementById('disponibilidad')?.scrollIntoView({ behavior: 'smooth' });
  }

  get whatsappUrl(): string | null {
    const n = this.hotel?.whatsapp?.replace(/\D/g, '');
    return n ? `https://wa.me/${n}` : null;
  }

  get mapaUrl(): string | null {
    const h = this.hotel;
    if (!h?.latitud || !h?.longitud) return null;
    return `https://www.google.com/maps/search/?api=1&query=${h.latitud},${h.longitud}`;
  }
}
