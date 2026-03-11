import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personCircleOutline,
  mailOutline,
  callOutline,
  idCardOutline,
  saveOutline,
  logOutOutline,
  pencilOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';

interface PerfilUI {
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  cedula: string;
  rol: 'HUESPED' | 'ADMIN' | 'GERENCIA';
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonButton, IonIcon],
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  loading = true;
  editando = false;
  guardando = false;

  perfil: PerfilUI = {
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    cedula: '',
    rol: 'HUESPED',
  };

  // copia para cancelar edición
  private backup: PerfilUI | null = null;

  constructor(private router: Router) {
    addIcons({
      personCircleOutline,
      mailOutline,
      callOutline,
      idCardOutline,
      saveOutline,
      logOutOutline,
      pencilOutline,
      shieldCheckmarkOutline,
    });
  }

  ngOnInit() {
    // MOCK temporal (luego API / AuthService)
    setTimeout(() => {
      this.perfil = {
        nombres: 'Misael',
        apellidos: 'Pozo',
        email: 'misael@email.com',
        telefono: '0999999999',
        cedula: '0900000000',
        rol: 'HUESPED',
      };
      this.loading = false;

      console.log('[Perfil] cargado:', this.perfil);
    }, 250);
  }

  activarEdicion() {
    this.backup = { ...this.perfil };
    this.editando = true;
    console.log('[Perfil] edición activada');
  }

  cancelarEdicion() {
    if (this.backup) this.perfil = { ...this.backup };
    this.backup = null;
    this.editando = false;
    console.log('[Perfil] edición cancelada');
  }

  guardar() {
    this.guardando = true;

    console.log('[Perfil] guardando...', this.perfil);

    // Simulación de guardado (luego API PUT/PATCH)
    setTimeout(() => {
      this.guardando = false;
      this.editando = false;
      this.backup = null;
      console.log('[Perfil] guardado OK');
    }, 600);
  }

  cerrarSesion() {
    console.log('[Perfil] cerrar sesión');
    // Luego: AuthService.logout() (limpiar token)
    this.router.navigate(['/inicio']);
  }

  get rolLabel(): string {
    if (this.perfil.rol === 'ADMIN') return 'Administrador';
    if (this.perfil.rol === 'GERENCIA') return 'Gerencia';
    return 'Huésped';
  }
}
