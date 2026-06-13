import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  IonButton,
  IonIcon
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  mailOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline
} from 'ionicons/icons';

import { AuthService }
  from 'src/app/core/services/auth.service';


@Component({
  selector: 'app-login',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    IonButton,
    IonIcon,
    RouterLink
  ],

  templateUrl: './login.page.html',

  styleUrls: ['./login.page.scss'],
})

export class LoginPage {


  // =======================================
  // FORM
  // =======================================

  email = '';

  password = '';

  remember = true;


  // =======================================
  // UI
  // =======================================

  showPass = false;

  loading = false;

  errorMsg = '';


  constructor(

    private router: Router,

    private authService: AuthService

  ) {

    addIcons({

      mailOutline,

      lockClosedOutline,

      eyeOutline,

      eyeOffOutline,
    });
  }


  // =======================================
  // TOGGLE PASSWORD
  // =======================================

  toggleShowPass() {

    this.showPass = !this.showPass;
  }


  // =======================================
  // VALIDAR
  // =======================================

  validate(): string | null {

    const e = this.email.trim();

    const p = this.password;


    if (!e) {
      return 'Ingresa tu correo.';
    }


    if (!/^\S+@\S+\.\S+$/.test(e)) {
      return 'Correo inválido.';
    }


    if (!p || p.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }


    return null;
  }


  // =======================================
  // SUBMIT
  // =======================================

  onSubmit() {

    this.errorMsg = '';


    // =====================================
    // VALIDAR FORM
    // =====================================

    const err = this.validate();

    if (err) {

      this.errorMsg = err;

      return;
    }


    this.loading = true;


    // =====================================
    // LOGIN
    // =====================================

    this.authService.login({

      email: this.email.trim(),

      password: this.password

    }).subscribe({


      // ===================================
      // SUCCESS
      // ===================================

      next: () => {

        this.loading = false;


        const role =
          this.authService.getRole();
          console.log('ROLE OBTENIDO:', role);
          console.log('USER:', this.authService.getUser());


        // =================================
        // ADMIN
        // =================================

        if (

          role === 'super_admin' ||

          role === 'admin'

        ) {

          this.router.navigate([
            '/admin/dashboard'
          ]);

          return;
        }


        // =================================
        // RECEPCIÓN
        // =================================

        if (role === 'recepcion') {

          this.router.navigate([
            '/admin/reservas'
          ]);

          return;
        }


        // =================================
        // CLIENTE
        // =================================

        this.router.navigate([
          '/inicio'
        ]);
      },


      // ===================================
      // ERROR
      // ===================================

      error: (error) => {

        this.loading = false;


        if (
          error?.status === 401
        ) {

          this.errorMsg =
            'Correo o contraseña incorrectos.';

          return;
        }


        if (
          error?.status === 403
        ) {

          this.errorMsg =
            'Tu usuario está inactivo.';

          return;
        }


        this.errorMsg =
          'No se pudo conectar con el servidor.';
      }

    });
  }

}