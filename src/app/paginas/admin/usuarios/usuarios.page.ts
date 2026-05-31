import { Component, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon, IonButton, IonChip } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  searchOutline, addCircleOutline, createOutline, eyeOutline, closeOutline,
  refreshOutline, peopleOutline, personOutline, mailOutline, shieldOutline,
  keyOutline, checkmarkCircleOutline, lockClosedOutline, trashOutline
} from 'ionicons/icons';
import { UsuariosService } from '@app/core/services/usuarios.service';
import { Usuario, RolUsuario } from '@app/shared/models/usuario.model';

type ModalMode = 'create' | 'edit';

interface UsuarioForm {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  rol: RolUsuario;
  password?: string;
}

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, IonIcon, IonButton, IonChip],
  templateUrl: './usuarios.page.html',
  styleUrls: ['./usuarios.page.scss'],
})
export class AdminUsuariosPage implements OnInit {
  usuarios = signal<Usuario[]>([]);
  loading = signal(true);

  q = signal('');
  fRol = signal<string>('TODOS');
  fEstado = signal<string>('TODOS');
  modalOpen = signal(false);
  modalMode = signal<ModalMode>('create');
  form = signal<UsuarioForm>({
    id: 0,
    nombres: '',
    apellidos: '',
    email: '',
    rol: 'RECEPCION',
    password: '',
  });

  constructor(private usuariosService: UsuariosService) {
    addIcons({
      searchOutline, addCircleOutline, createOutline, eyeOutline, closeOutline,
      refreshOutline, peopleOutline, personOutline, mailOutline, shieldOutline,
      keyOutline, checkmarkCircleOutline, lockClosedOutline, trashOutline
    });
  }

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.loading.set(true);
    this.usuariosService.getAll().subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargar usuarios:', err);
        this.loading.set(false);
      }
    });
  }

  total = () => this.usuarios().length;
  activos = () => this.usuarios().filter(u => u.activo === true).length;
  admins = () => this.usuarios().filter(u => u.rol === 'ADMIN' || u.rol === 'GERENCIA').length;
  bloqueados = () => this.usuarios().filter(u => u.activo === false).length;

  filtrados = computed(() => {
    let items = this.usuarios();
    const query = this.q().trim().toLowerCase();
    if (query) {
      items = items.filter(u =>
        (u.nombres + ' ' + u.apellidos).toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.rol.toLowerCase().includes(query)
      );
    }
    if (this.fRol() !== 'TODOS') items = items.filter(u => u.rol === this.fRol());
    if (this.fEstado() !== 'TODOS') {
      const isActive = this.fEstado() === 'ACTIVO';
      items = items.filter(u => u.activo === isActive);
    }
    return items.sort((a, b) => b.id - a.id);
  });

  setRolFilter(v: string) { this.fRol.set(v); }
  setEstadoFilter(v: string) { this.fEstado.set(v); }

  getInitials(nombres: string, apellidos: string): string {
    return (nombres.charAt(0) + apellidos.charAt(0)).toUpperCase();
  }

  formatRol(rol: RolUsuario): string {
    const roles: Record<RolUsuario, string> = {
      ADMIN: 'Admin',
      GERENCIA: 'Gerencia',
      RECEPCION: 'Recepción',
      CLIENTE: 'Cliente'
    };
    return roles[rol] || rol;
  }

  getRolClass(rol: RolUsuario): string {
    const classes: Record<RolUsuario, string> = {
      ADMIN: 'admin',
      GERENCIA: 'gerencia',
      RECEPCION: 'recepcion',
      CLIENTE: 'cliente'
    };
    return classes[rol] || '';
  }

  getEstadoClass(activo: boolean): string {
    return activo ? 'activo' : 'bloqueado';
  }

  formatEstado(activo: boolean): string {
    return activo ? 'Activo' : 'Bloqueado';
  }

  openDetail(u: Usuario) {
    alert(`Usuario: ${u.nombres} ${u.apellidos}\nEmail: ${u.email}\nRol: ${this.formatRol(u.rol)}\nEstado: ${this.formatEstado(u.activo)}\nTeléfono: ${u.telefono || '—'}\nCreado: ${u.creadoEn || '—'}`);
  }

  openCreate() {
    this.modalMode.set('create');
    this.form.set({
      id: 0,
      nombres: '',
      apellidos: '',
      email: '',
      rol: 'RECEPCION',
      password: ''
    });
    this.modalOpen.set(true);
  }

  openEdit(u: Usuario) {
    this.modalMode.set('edit');
    this.form.set({
      id: u.id,
      nombres: u.nombres,
      apellidos: u.apellidos,
      email: u.email,
      rol: u.rol,
      password: ''
    });
    this.modalOpen.set(true);
  }

  closeModal() { this.modalOpen.set(false); }

  patch<K extends keyof UsuarioForm>(key: K, value: UsuarioForm[K]) {
    this.form.set({ ...this.form(), [key]: value });
  }

  save() {
    const f = this.form();
    if (!f.nombres.trim() || !f.apellidos.trim() || !f.email.trim()) {
      alert('Complete los campos obligatorios');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) {
      alert('Email inválido');
      return;
    }

    const usuarioData = {
      nombres: f.nombres.trim(),
      apellidos: f.apellidos.trim(),
      email: f.email.toLowerCase(),
      rol: f.rol,
      activo: true,
      password: f.password || undefined
    };

    if (this.modalMode() === 'create') {
      this.usuariosService.create(usuarioData).subscribe({
        next: (usuario) => {
          if (usuario) this.cargarUsuarios();
          this.closeModal();
        },
        error: (err) => console.error('Error crear:', err)
      });
    } else {
      this.usuariosService.update(f.id, usuarioData).subscribe({
        next: (usuario) => {
          if (usuario) this.cargarUsuarios();
          this.closeModal();
        },
        error: (err) => console.error('Error actualizar:', err)
      });
    }
  }

  toggleEstado(u: Usuario) {
    const nextEstado = !u.activo;
    this.usuariosService.update(u.id, { activo: nextEstado }).subscribe({
      next: () => this.cargarUsuarios(),
      error: (err) => console.error('Error cambiar estado:', err)
    });
  }

  confirmDelete(u: Usuario) {
    if (confirm(`¿Eliminar usuario "${u.nombres} ${u.apellidos}"?`)) {
      this.usuariosService.delete(u.id).subscribe({
        next: (success) => {
          if (success) this.cargarUsuarios();
        },
        error: (err) => console.error('Error eliminar:', err)
      });
    }
  }
}