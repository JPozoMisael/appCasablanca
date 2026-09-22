import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@app/core/services/api.service';

interface RolAsignable { clave: string; nombre: string }
interface Miembro { id: number; nombre: string; apellido: string; email: string; rol: string; estado: 'activo' | 'inactivo'; ultimo_login?: string | null }

/** Personal del alojamiento. El admin crea recepción; solo la plataforma crea otros administradores. */
@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './usuarios.page.html',
})
export class AdminUsuariosPage implements OnInit {
  private api = inject(ApiService);

  miembros: Miembro[] = [];
  nuevo = { nombre: '', apellido: '', email: '', password: '', rol: 'recepcion' };
  cargando = true;
  error = '';
  mensaje = '';

  roles: RolAsignable[] = [];

  nombreRol(clave: string): string {
    return this.roles.find((r) => r.clave === clave)?.nombre ?? clave;
  }

  ngOnInit(): void {
    this.api.get<{ data: RolAsignable[] }>('/admin/roles').subscribe({
      next: (r) => {
        this.roles = r.data;
        if (r.data.length && !r.data.some((x) => x.clave === this.nuevo.rol)) this.nuevo.rol = r.data[0].clave;
      },
      error: () => undefined,
    });
    this.cargar();
  }

  cargar(): void {
    this.api.get<{ data: Miembro[] }>('/admin/usuarios').subscribe({
      next: (r) => {
        this.miembros = r.data;
        this.cargando = false;
      },
      error: (e) => {
        this.error = e?.error?.message ?? 'No pudimos cargar el personal.';
        this.cargando = false;
      },
    });
  }

  crear(): void {
    const n = this.nuevo;
    if (n.nombre.trim().length < 2 || n.apellido.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(n.email) || n.password.length < 8) {
      this.error = 'Completa nombre, apellido, un correo válido y una contraseña de al menos 8 caracteres.';
      return;
    }
    this.error = '';
    this.api.post('/admin/usuarios', { ...n, nombre: n.nombre.trim(), apellido: n.apellido.trim() }).subscribe({
      next: () => {
        this.nuevo = { nombre: '', apellido: '', email: '', password: '', rol: 'recepcion' };
        this.mensaje = 'Usuario creado. Entrégale su correo y contraseña inicial.';
        this.cargar();
      },
      error: (e) =>
        (this.error = e?.error?.details?.map((d: { campo: string; mensaje: string }) => `${d.campo}: ${d.mensaje}`).join(' · ') ?? e?.error?.message ?? 'No se pudo crear.'),
    });
  }

  alternar(m: Miembro): void {
    this.api.patch(`/admin/usuarios/${m.id}/estado`, { estado: m.estado === 'activo' ? 'inactivo' : 'activo' }).subscribe({
      next: () => this.cargar(),
      error: (e) => (this.error = e?.error?.message ?? 'No se pudo actualizar.'),
    });
  }
}
