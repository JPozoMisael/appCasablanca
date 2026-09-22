import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@app/core/services/api.service';

interface Servicio { id: number; nombre: string; descripcion?: string | null; precio: number | string; estado: 'activo' | 'inactivo' }

/** Extras que el huésped puede agregar al reservar (desayuno, traslado, tours…). */
@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './servicios.page.html',
})
export class ServiciosPage implements OnInit {
  private api = inject(ApiService);

  servicios: Servicio[] = [];
  nuevo = { nombre: '', descripcion: '', precio: null as number | null };
  cargando = true;
  error = '';
  mensaje = '';

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.api.get<{ data: Servicio[] }>('/services').subscribe({
      next: (r) => {
        this.servicios = r.data;
        this.cargando = false;
      },
      error: (e) => {
        this.error = e?.error?.message ?? 'No pudimos cargar los servicios.';
        this.cargando = false;
      },
    });
  }

  crear(): void {
    const n = this.nuevo;
    if (!n.nombre.trim() || n.precio === null || n.precio < 0) {
      this.error = 'Indica el nombre y el precio del servicio.';
      return;
    }
    this.error = '';
    this.api.post('/services', { nombre: n.nombre.trim(), descripcion: n.descripcion.trim() || null, precio: Number(n.precio) }).subscribe({
      next: () => {
        this.nuevo = { nombre: '', descripcion: '', precio: null };
        this.mensaje = 'Servicio agregado.';
        this.cargar();
      },
      error: (e) => (this.error = e?.error?.message ?? 'No se pudo guardar (¿ya existe ese nombre?).'),
    });
  }

  alternar(s: Servicio): void {
    this.api.put(`/services/${s.id}`, { estado: s.estado === 'activo' ? 'inactivo' : 'activo' }).subscribe({
      next: () => this.cargar(),
      error: (e) => (this.error = e?.error?.message ?? 'No se pudo actualizar.'),
    });
  }

  cambiarPrecio(s: Servicio, valor: string): void {
    const precio = Number(valor);
    if (!Number.isFinite(precio) || precio < 0) return;
    this.api.put(`/services/${s.id}`, { precio }).subscribe({
      next: () => (this.mensaje = 'Precio actualizado.'),
      error: (e) => (this.error = e?.error?.message ?? 'No se pudo actualizar.'),
    });
  }

  borrar(s: Servicio): void {
    if (!confirm(`¿Eliminar "${s.nombre}"? Si ya se usó en reservas, solo se desactivará.`)) return;
    this.api.delete(`/services/${s.id}`).subscribe({ next: () => this.cargar(), error: (e) => (this.error = e?.error?.message ?? 'No se pudo eliminar.') });
  }
}
