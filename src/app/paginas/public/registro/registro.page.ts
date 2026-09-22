import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './registro.page.html',
  styleUrls: ['../login/login.page.scss'],
})
export class RegistroPage {
  private auth = inject(AuthService);
  private router = inject(Router);

  nombre = '';
  apellido = '';
  email = '';
  password = '';
  cargando = false;
  error = '';

  get passwordDebil(): boolean {
    return this.password.length > 0 && this.password.length < 8;
  }

  crear(): void {
    this.error = '';
    if (this.nombre.trim().length < 2 || this.apellido.trim().length < 2) {
      this.error = 'Ingresa tu nombre y apellido.';
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(this.email)) {
      this.error = 'Ingresa un correo válido.';
      return;
    }
    if (this.password.length < 8) {
      this.error = 'La contraseña debe tener al menos 8 caracteres.';
      return;
    }

    this.cargando = true;
    const credenciales = { email: this.email.trim(), password: this.password };
    this.auth
      .register({ nombre: this.nombre.trim(), apellido: this.apellido.trim(), ...credenciales })
      .subscribe({
        // Tras registrarse, entra directamente.
        next: () =>
          this.auth.login(credenciales).subscribe({
            next: () => this.router.navigateByUrl('/mis-reservas'),
            error: () => this.router.navigateByUrl('/login'),
          }),
        error: (e) => {
          this.cargando = false;
          this.error = e?.error?.message ?? 'No se pudo crear la cuenta.';
        },
      });
  }
}
