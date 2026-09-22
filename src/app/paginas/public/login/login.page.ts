import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = '';
  password = '';
  verPassword = false;
  cargando = false;
  error = '';

  readonly sesionExpirada = this.route.snapshot.queryParamMap.get('sesion') === 'expirada';

  entrar(): void {
    this.error = '';
    if (!this.email.trim() || !this.password) {
      this.error = 'Ingresa tu correo y tu contraseña.';
      return;
    }
    this.cargando = true;
    this.auth.login({ email: this.email.trim(), password: this.password }).subscribe({
      next: (res) => {
        this.cargando = false;
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        const alcance = res.data.usuario.alcance;
        // Solo se aceptan rutas internas (evita redirecciones abiertas).
        const destinoSeguro = returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : null;
        const esStaff = alcance === 'plataforma' || alcance === 'hotel';
        this.router.navigateByUrl(destinoSeguro ?? (esStaff ? '/admin' : '/mis-reservas'));
      },
      error: (e) => {
        this.cargando = false;
        this.error =
          e?.status === 0
            ? 'No pudimos conectar con el servidor. Intenta de nuevo en unos minutos.'
            : (e?.error?.message ?? 'No se pudo iniciar sesión.');
      },
    });
  }
}
