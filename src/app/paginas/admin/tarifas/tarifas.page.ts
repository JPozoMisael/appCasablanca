import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@app/core/services/api.service';
import { GestionService, TipoHab } from '@app/core/services/gestion.service';
import { fechaCorta } from '@app/shared/utils/format';

interface Temporada { id: number; nombre: string; fecha_inicio: string; fecha_fin: string; tipo: 'alta' | 'media' | 'baja' }
interface Tarifa { id: number; tipo_habitacion_id: number; temporada_id: number; tipo_dia: 'entre_semana' | 'fin_semana'; precio: number | string }

/**
 * Precios por temporada. Regla de precio (la misma que usa el buscador y la reserva):
 * tarifa (tipo × temporada × entre semana/fin de semana) → si falta el fin de semana, la de entre semana →
 * precio base del tipo. Si dos temporadas se cruzan gana la que empieza más tarde.
 */
@Component({
  selector: 'app-tarifas',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './tarifas.page.html',
})
export class TarifasPage implements OnInit {
  private api = inject(ApiService);
  private gestion = inject(GestionService);

  temporadas: Temporada[] = [];
  tipos: TipoHab[] = [];
  tarifas: Tarifa[] = [];
  cargando = true;
  error = '';
  mensaje = '';

  nueva = { nombre: '', fecha_inicio: '', fecha_fin: '', tipo: 'alta' };
  readonly fechaCorta = fechaCorta;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.gestion.tipos().subscribe({ next: (t) => (this.tipos = t.filter((x) => x.estado === 'activo')), error: (e) => this.fallo(e) });
    this.api.get<{ data: Temporada[] }>('/temporadas').subscribe({
      next: (r) => (this.temporadas = r.data),
      error: (e) => this.fallo(e),
    });
    this.api.get<{ data: Tarifa[] }>('/tarifas').subscribe({
      next: (r) => {
        this.tarifas = r.data;
        this.cargando = false;
      },
      error: (e) => this.fallo(e),
    });
  }

  private fallo(e: { error?: { message?: string } }): void {
    this.error = e?.error?.message ?? 'Ocurrió un error.';
    this.cargando = false;
  }

  crearTemporada(): void {
    const n = this.nueva;
    if (!n.nombre.trim() || !n.fecha_inicio || !n.fecha_fin) {
      this.error = 'Completa el nombre y las fechas de la temporada.';
      return;
    }
    if (n.fecha_fin < n.fecha_inicio) {
      this.error = 'La fecha final no puede ser anterior a la inicial.';
      return;
    }
    this.error = '';
    this.api.post('/temporadas', { ...n, nombre: n.nombre.trim() }).subscribe({
      next: () => {
        this.nueva = { nombre: '', fecha_inicio: '', fecha_fin: '', tipo: 'alta' };
        this.mensaje = 'Temporada creada. Ahora fija los precios en la tabla.';
        this.cargar();
      },
      error: (e) => this.fallo(e),
    });
  }

  borrarTemporada(t: Temporada): void {
    if (!confirm(`¿Eliminar la temporada "${t.nombre}" y sus tarifas?`)) return;
    this.api.delete(`/temporadas/${t.id}`).subscribe({ next: () => this.cargar(), error: (e) => this.fallo(e) });
  }

  precio(tipoId: number, tempId: number, dia: Tarifa['tipo_dia']): string {
    const t = this.tarifas.find((x) => x.tipo_habitacion_id === tipoId && x.temporada_id === tempId && x.tipo_dia === dia);
    return t ? String(Number(t.precio)) : '';
  }

  guardarCelda(tipoId: number, tempId: number, dia: Tarifa['tipo_dia'], valor: string): void {
    const existente = this.tarifas.find((x) => x.tipo_habitacion_id === tipoId && x.temporada_id === tempId && x.tipo_dia === dia);
    const v = valor.trim();
    this.error = this.mensaje = '';

    if (v === '') {
      if (existente) this.api.delete(`/tarifas/${existente.id}`).subscribe({ next: () => this.cargar(), error: (e) => this.fallo(e) });
      return;
    }
    const precio = Number(v);
    if (!Number.isFinite(precio) || precio < 0) {
      this.error = 'Ingresa un precio válido.';
      return;
    }
    const op = existente
      ? this.api.put(`/tarifas/${existente.id}`, { precio })
      : this.api.post('/tarifas', { tipo_habitacion_id: tipoId, temporada_id: tempId, tipo_dia: dia, precio });
    op.subscribe({
      next: () => {
        this.mensaje = 'Precio guardado.';
        this.cargar();
      },
      error: (e) => this.fallo(e),
    });
  }
}
