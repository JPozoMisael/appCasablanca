import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CatalogoService } from '@app/core/services/catalogo.service';
import { GestionService, HotelPerfil } from '@app/core/services/gestion.service';
import { HotelScopeService } from '@app/core/services/hotel-scope.service';
import { Zona } from '@app/shared/models/marketplace.model';
import { ETIQUETA_TIPO } from '@app/shared/utils/format';

const NUEVO = () => ({
  hotel: { nombre: '', tipo_alojamiento: 'hotel', zona_id: null as number | null, estrellas: null as number | null, estado: 'activo', comision_porcentaje: 10 },
  propietario: { nombre: '', apellido: '', email: '', password: '' },
});

/** Solo super_admin: alta de alojamientos con su administrador, aprobación y comisiones. */
@Component({
  selector: 'app-hoteles',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './hoteles.page.html',
})
export class HotelesPage implements OnInit {
  private gestion = inject(GestionService);
  private catalogo = inject(CatalogoService);
  private scope = inject(HotelScopeService);

  hoteles: HotelPerfil[] = [];
  zonas: Zona[] = [];
  cargando = true;
  error = '';
  mensaje = '';

  alta: ReturnType<typeof NUEVO> | null = null;
  comision: { id: number; valor: number } | null = null;

  readonly tipos = Object.entries(ETIQUETA_TIPO).map(([v, t]) => ({ v, t }));

  ngOnInit(): void {
    this.catalogo.zonas().subscribe((z) => (this.zonas = z));
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.gestion.hoteles().subscribe({
      next: (r) => {
        this.hoteles = r.data;
        this.cargando = false;
      },
      error: (e) => {
        this.error = e?.error?.message ?? 'No pudimos cargar los alojamientos.';
        this.cargando = false;
      },
    });
  }

  nuevo(): void {
    this.alta = NUEVO();
  }

  crear(): void {
    const a = this.alta;
    if (!a) return;
    const { hotel, propietario } = a;
    this.error = '';
    this.gestion
      .crearHotel({
        hotel: { ...hotel, zona_id: hotel.zona_id ? Number(hotel.zona_id) : null, estrellas: hotel.estrellas ? Number(hotel.estrellas) : null, comision_porcentaje: Number(hotel.comision_porcentaje) },
        propietario: propietario.email ? propietario : undefined,
      })
      .subscribe({
        next: () => {
          this.mensaje = `Alojamiento «${hotel.nombre}» registrado.`;
          this.alta = null;
          this.cargar();
        },
        error: (e) =>
          (this.error = e?.error?.details?.map((d: { campo: string; mensaje: string }) => `${d.campo}: ${d.mensaje}`).join(' · ') ?? e?.error?.message ?? 'No se pudo registrar.'),
      });
  }

  estado(h: HotelPerfil, estado: string): void {
    this.gestion.estadoHotel(h.id, estado).subscribe({
      next: (n) => (h.estado = n.estado),
      error: (e) => (this.error = e?.error?.message ?? 'No se pudo cambiar el estado.'),
    });
  }

  destacar(h: HotelPerfil): void {
    this.gestion.editarHotel(h.id, { destacado: !h.destacado }).subscribe({
      next: (n) => (h.destacado = n.destacado),
      error: (e) => (this.error = e?.error?.message ?? 'No se pudo actualizar.'),
    });
  }

  guardarComision(): void {
    const c = this.comision;
    if (!c) return;
    this.gestion.editarHotel(c.id, { comision_porcentaje: Number(c.valor) }).subscribe({
      next: () => {
        this.mensaje = 'Comisión actualizada.';
        this.comision = null;
        this.cargar();
      },
      error: (e) => (this.error = e?.error?.message ?? 'No se pudo actualizar.'),
    });
  }

  administrar(h: HotelPerfil): void {
    this.scope.set(h.id);
    window.location.href = '/admin/dashboard';
  }
}
