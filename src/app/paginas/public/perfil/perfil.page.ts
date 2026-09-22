import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './perfil.page.html',
  styleUrls: ['../login/login.page.scss'],
})
export class PerfilPage implements OnInit {
  private auth = inject(AuthService);

  nombre = '';
  apellido = '';
  email = '';
  rol = '';

  actual = '';
  nueva = '';

  mensaje = '';
  error = '';
  guardando = false;

  ngOnInit(): void {
    this.auth.refrescarPerfil().subscribe({
      next: (r) => {
        this.nombre = r.data.nombre ?? '';
        this.apellido = r.data.apellido ?? '';
        this.email = r.data.email ?? '';
        this.rol = r.data.rol ?? '';
      },
      error: () => undefined,
    });
  }

  guardarPerfil(): void {
    this.reset();
    this.guardando = true;
    this.auth.actualizarPerfil({ nombre: this.nombre.trim(), apellido: this.apellido.trim() }).subscribe({
      next: () => {
        this.mensaje = 'Perfil actualizado.';
        this.guardando = false;
      },
      error: (e) => {
        this.error = e?.error?.message ?? 'No se pudo actualizar el perfil.';
        this.guardando = false;
      },
    });
  }

  cambiarPassword(): void {
    this.reset();
    if (this.nueva.length < 8) {
      this.error = 'La nueva contraseña debe tener al menos 8 caracteres.';
      return;
    }
    this.guardando = true;
    this.auth.cambiarPassword(this.actual, this.nueva).subscribe({
      next: () => {
        this.mensaje = 'Contraseña actualizada.';
        this.actual = this.nueva = '';
        this.guardando = false;
      },
      error: (e) => {
        this.error = e?.error?.message ?? 'No se pudo cambiar la contraseña.';
        this.guardando = false;
      },
    });
  }

  private reset(): void {
    this.mensaje = '';
    this.error = '';
  }
}
