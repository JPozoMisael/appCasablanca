import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CatalogoService } from '@app/core/services/catalogo.service';
import { GestionService, HotelPerfil } from '@app/core/services/gestion.service';
import { Amenidad, Zona } from '@app/shared/models/marketplace.model';
import { ETIQUETA_TIPO, imagenUrl } from '@app/shared/utils/format';

@Component({
  selector: 'app-mi-hotel',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './mi-hotel.page.html',
})
export class MiHotelPage implements OnInit {
  private gestion = inject(GestionService);
  private catalogo = inject(CatalogoService);

  hotel: HotelPerfil | null = null;
  zonas: Zona[] = [];
  amenidades: Amenidad[] = [];
  elegidas = new Set<number>();
  nuevaFoto = { url: '', alt: '' };

  cargando = true;
  guardando = false;
  mensaje = '';
  error = '';

  readonly tipos = Object.entries(ETIQUETA_TIPO).map(([v, t]) => ({ v, t }));
  readonly url = imagenUrl;

  ngOnInit(): void {
    this.catalogo.zonas().subscribe((z) => (this.zonas = z));
    this.catalogo.amenidades().subscribe((a) => (this.amenidades = a));
    this.cargar();
  }

  cargar(): void {
    this.gestion.perfil().subscribe({
      next: (h) => {
        this.hotel = h;
        this.elegidas = new Set((h.amenidades ?? []).map((a) => a.id));
        this.cargando = false;
      },
      error: (e) => {
        this.error =
          e?.error?.code === 'HOTEL_REQUERIDO'
            ? 'Elige un alojamiento en "Operando en" (arriba a la derecha) para editar su ficha.'
            : (e?.error?.message ?? 'No pudimos cargar tu alojamiento.');
        this.cargando = false;
      },
    });
  }

  alternar(id: number): void {
    if (this.elegidas.has(id)) this.elegidas.delete(id);
    else this.elegidas.add(id);
  }

  guardar(): void {
    const h = this.hotel;
    if (!h) return;
    this.guardando = true;
    this.mensaje = this.error = '';
    const num = (v: unknown) => (v === '' || v === null || v === undefined ? null : Number(v));
    this.gestion
      .guardarPerfil({
        nombre: h.nombre,
        descripcion: h.descripcion || null,
        direccion: h.direccion || null,
        zona_id: h.zona_id ? Number(h.zona_id) : null,
        tipo_alojamiento: h.tipo_alojamiento,
        estrellas: num(h.estrellas),
        latitud: num(h.latitud),
        longitud: num(h.longitud),
        telefono: h.telefono || null,
        whatsapp: h.whatsapp || null,
        email: h.email || null,
        sitio_web: h.sitio_web || null,
        imagen_principal: h.imagen_principal || null,
        hora_checkin: h.hora_checkin,
        hora_checkout: h.hora_checkout,
        politica_cancelacion: h.politica_cancelacion,
      })
      .subscribe({
        next: () =>
          this.gestion.guardarAmenidades([...this.elegidas]).subscribe({
            next: () => {
              this.mensaje = 'Cambios guardados. Ya se ven en la página pública.';
              this.guardando = false;
            },
            error: (e) => this.fallo(e),
          }),
        error: (e) => this.fallo(e),
      });
  }

  private fallo(e: { error?: { message?: string; details?: { campo: string; mensaje: string }[] } }): void {
    this.error = e?.error?.details?.map((d) => `${d.campo}: ${d.mensaje}`).join(' · ') ?? e?.error?.message ?? 'No se pudo guardar.';
    this.guardando = false;
  }

  agregarFoto(): void {
    const u = this.nuevaFoto.url.trim();
    if (!u) return;
    this.gestion.agregarFoto(u, this.nuevaFoto.alt.trim() || undefined).subscribe({
      next: () => {
        this.nuevaFoto = { url: '', alt: '' };
        this.cargar();
      },
      error: (e) => this.fallo(e),
    });
  }

  quitarFoto(id: number): void {
    this.gestion.quitarFoto(id).subscribe({ next: () => this.cargar(), error: (e) => this.fallo(e) });
  }

  comoPrincipal(u: string): void {
    if (this.hotel) this.hotel.imagen_principal = u;
  }
}
