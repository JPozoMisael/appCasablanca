import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { switchMap, tap } from 'rxjs';
import { AuthService } from '@app/core/services/auth.service';
import { BookingService } from '@app/core/services/booking.service';
import { CatalogoService } from '@app/core/services/catalogo.service';
import { Amenidad, BusquedaMeta, Facets, HotelResumen } from '@app/shared/models/marketplace.model';
import { HotelCardComponent } from '@app/shared/components/hotel-card/hotel-card.component';
import { BusquedaFormValue, SearchFormComponent } from '@app/shared/components/search-form/search-form.component';
import { ETIQUETA_TIPO, fechaCorta, nochesEntre } from '@app/shared/utils/format';

const FACETS_VACIOS: Facets = { zonas: [], tipos: [], estrellas: [], amenidades: [], precio: { min: 0, max: 0 } };

@Component({
  selector: 'app-buscar',
  standalone: true,
  imports: [IonIcon, SearchFormComponent, HotelCardComponent],
  templateUrl: './buscar.page.html',
  styleUrls: ['./buscar.page.scss'],
})
export class BuscarPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private catalogo = inject(CatalogoService);
  private booking = inject(BookingService);
  private auth = inject(AuthService);

  resultados: HotelResumen[] = [];
  meta: BusquedaMeta | null = null;
  facets: Facets = FACETS_VACIOS;
  amenidadesCatalogo: Amenidad[] = [];
  cargando = true;
  error = false;
  filtrosAbiertos = false;
  favoritos = new Set<number>();

  // Estado derivado de la URL
  q: Record<string, string> = {};
  readonly etiquetaTipo = ETIQUETA_TIPO;
  readonly ordenes = [
    { v: 'recomendado', t: 'Recomendados' },
    { v: 'precio_asc', t: 'Precio: menor a mayor' },
    { v: 'precio_desc', t: 'Precio: mayor a menor' },
    { v: 'rating', t: 'Mejor puntuados' },
    { v: 'estrellas', t: 'Más estrellas' },
  ];

  ngOnInit(): void {
    this.catalogo.amenidades().subscribe((a) => (this.amenidadesCatalogo = a));
    if (this.auth.estaLogueado()) {
      this.booking.favoritos().subscribe({ next: (f) => (this.favoritos = new Set(f.map((x) => x.hotel.id))), error: () => undefined });
    }

    this.route.queryParamMap
      .pipe(
        tap((p) => {
          this.q = Object.fromEntries(p.keys.map((k) => [k, p.get(k) ?? '']));
          this.cargando = true;
          this.error = false;
        }),
        switchMap(() =>
          this.catalogo.buscar({
            zona: this.q['zona'],
            checkIn: this.q['checkIn'],
            checkOut: this.q['checkOut'],
            adultos: Number(this.q['adultos']) || 2,
            ninos: Number(this.q['ninos']) || 0,
            habitaciones: Number(this.q['habitaciones']) || 1,
            precioMax: this.q['precioMax'] ? Number(this.q['precioMax']) : undefined,
            estrellas: this.q['estrellas'] ? Number(this.q['estrellas']) : undefined,
            rating: this.q['rating'] ? Number(this.q['rating']) : undefined,
            tipos: this.lista('tipos'),
            amenidades: this.lista('amenidades'),
            orden: this.q['orden'] || 'recomendado',
            page: Number(this.q['page']) || 1,
            limit: 10,
          })
        )
      )
      .subscribe({
        next: (r) => {
          this.resultados = r.data;
          this.meta = r.meta;
          this.facets = r.facets;
          this.cargando = false;
        },
        error: (e) => {
          this.error = true;
          this.mensajeError = e?.error?.message ?? '';
          this.resultados = [];
          this.cargando = false;
        },
      });
  }

  mensajeError = '';

  // ---------- derivados ----------
  get noches(): number | null {
    return this.q['checkIn'] && this.q['checkOut'] ? nochesEntre(this.q['checkIn'], this.q['checkOut']) : null;
  }

  get consulta(): Record<string, string | number> {
    const c: Record<string, string> = {};
    for (const k of ['checkIn', 'checkOut', 'adultos', 'ninos', 'habitaciones']) if (this.q[k]) c[k] = this.q[k];
    return c;
  }

  get valorForm(): Partial<BusquedaFormValue> {
    return {
      zona: this.q['zona'] ?? '',
      checkIn: this.q['checkIn'] ?? '',
      checkOut: this.q['checkOut'] ?? '',
      adultos: Number(this.q['adultos']) || 2,
      ninos: Number(this.q['ninos']) || 0,
      habitaciones: Number(this.q['habitaciones']) || 1,
    };
  }

  get titulo(): string {
    const zona = this.facets.zonas.find((z) => z.valor === this.q['zona'])?.nombre;
    return zona ? `${zona}: ${this.meta?.total ?? 0} alojamientos` : `Salinas: ${this.meta?.total ?? 0} alojamientos`;
  }

  get fechasTexto(): string {
    return this.q['checkIn'] && this.q['checkOut'] ? `${fechaCorta(this.q['checkIn'])} – ${fechaCorta(this.q['checkOut'])}` : '';
  }

  get hayFiltros(): boolean {
    return ['precioMax', 'estrellas', 'tipos', 'amenidades', 'rating'].some((k) => !!this.q[k]);
  }

  get filtrables(): Amenidad[] {
    const disponibles = new Set(this.facets.amenidades.map((a) => a.valor));
    return this.amenidadesCatalogo.filter((a) => disponibles.has(a.slug) || this.lista('amenidades').includes(a.slug));
  }

  totalFacet(lista: { valor: string | number; total: number }[], valor: string | number): number {
    return lista.find((f) => f.valor === valor)?.total ?? 0;
  }

  lista(clave: string): string[] {
    return (this.q[clave] ?? '').split(',').filter(Boolean);
  }

  // ---------- acciones ----------
  private navegar(cambios: Record<string, string | number | null>, reiniciarPagina = true): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { ...cambios, ...(reiniciarPagina ? { page: null } : {}) },
      queryParamsHandling: 'merge',
    });
  }

  nuevaBusqueda(v: BusquedaFormValue): void {
    this.navegar({
      zona: v.zona || null,
      checkIn: v.checkIn || null,
      checkOut: v.checkOut || null,
      adultos: v.adultos,
      ninos: v.ninos || null,
      habitaciones: v.habitaciones > 1 ? v.habitaciones : null,
    });
  }

  ordenar(orden: string): void {
    this.navegar({ orden: orden === 'recomendado' ? null : orden });
  }

  alternar(clave: 'tipos' | 'amenidades', valor: string): void {
    const actual = this.lista(clave);
    const nuevo = actual.includes(valor) ? actual.filter((v) => v !== valor) : [...actual, valor];
    this.navegar({ [clave]: nuevo.length ? nuevo.join(',') : null });
  }

  estrellas(n: number): void {
    this.navegar({ estrellas: this.q['estrellas'] === String(n) ? null : n });
  }

  rating(n: number): void {
    this.navegar({ rating: this.q['rating'] === String(n) ? null : n });
  }

  precioMax(valor: string): void {
    const n = Number(valor);
    this.navegar({ precioMax: n >= this.facets.precio.max ? null : n });
  }

  limpiar(): void {
    this.navegar({ precioMax: null, estrellas: null, tipos: null, amenidades: null, rating: null });
  }

  pagina(n: number): void {
    this.navegar({ page: n > 1 ? n : null }, false);
    // El scroll vive dentro de <ion-content>, no en window.
    (document.querySelector('ion-content') as HTMLIonContentElement | null)?.scrollToTop(300);
  }

  alternarFavorito(h: HotelResumen): void {
    if (!this.auth.estaLogueado()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    const era = this.favoritos.has(h.id);
    const next = new Set(this.favoritos);
    era ? next.delete(h.id) : next.add(h.id);
    this.favoritos = next;
    (era ? this.booking.quitarFavorito(h.id) : this.booking.agregarFavorito(h.id)).subscribe({
      error: () => {
        // revierte si el servidor falla
        const revertido = new Set(this.favoritos);
        era ? revertido.add(h.id) : revertido.delete(h.id);
        this.favoritos = revertido;
      },
    });
  }

  get paginas(): number[] {
    return Array.from({ length: this.meta?.pages ?? 0 }, (_, i) => i + 1);
  }
}
