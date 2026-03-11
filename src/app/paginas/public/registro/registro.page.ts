import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline,
  mailOutline,
  callOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, IonButton, IonIcon, RouterLink],
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage {
  fullName = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';

  acceptTerms = false;
  marketing = false;

  showPass = false;
  showConfirm = false;

  loading = false;
  errorMsg = '';
  successMsg = '';

  constructor(private router: Router) {
    addIcons({
      personOutline,
      mailOutline,
      callOutline,
      lockClosedOutline,
      eyeOutline,
      eyeOffOutline,
      checkmarkCircleOutline,
    });
  }

  togglePass() {
    this.showPass = !this.showPass;
  }

  toggleConfirm() {
    this.showConfirm = !this.showConfirm;
  }

  private validate(): string | null {
    const name = this.fullName.trim();
    const email = this.email.trim();

    if (!name) return 'Ingresa tu nombre completo.';
    if (name.length < 3) return 'El nombre es muy corto.';
    if (!email) return 'Ingresa tu correo.';
    if (!/^\S+@\S+\.\S+$/.test(email)) return 'Correo inválido.';

    // teléfono opcional pero si lo llena, validamos algo básico
    if (this.phone.trim() && this.phone.trim().length < 7) return 'Teléfono inválido.';

    if (!this.password || this.password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
    if (this.password !== this.confirmPassword) return 'Las contraseñas no coinciden.';
    if (!this.acceptTerms) return 'Debes aceptar los términos y condiciones.';
    return null;
  }

  async onSubmit() {
    this.errorMsg = '';
    this.successMsg = '';

    const err = this.validate();
    if (err) {
      this.errorMsg = err;
      return;
    }

    this.loading = true;

    // Luego conectamos API (auth.service/register)
    // Simulación de registro:
    setTimeout(() => {
      this.loading = false;
      this.successMsg = 'Cuenta creada (simulado). Ahora puedes iniciar sesión.';

      // opcional: redirigir al login
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 700);
    }, 700);
  }
}
