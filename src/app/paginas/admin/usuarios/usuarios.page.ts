import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonIcon, IonButton, IonChip } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  searchOutline,
  addCircleOutline,
  createOutline,
  eyeOutline,
  closeOutline,
  optionsOutline,
  peopleOutline,
  personOutline,
  mailOutline,
  shieldOutline,
  keyOutline,
  checkmarkCircleOutline,
  lockClosedOutline,
} from 'ionicons/icons';

type Rol = 'ADMIN' | 'GERENCIA' | 'RECEPCION' | 'LIMPIEZA';
type EstadoUser = 'ACTIVO' | 'BLOQUEADO';

interface Usuario {
  id: number;
  nombres: string;
  email: string;
  rol: Rol;
  estado: EstadoUser;
  createdAt: string; // YYYY-MM-DD
  ultimoAcceso?: string; // YYYY-MM-DD
}

type ModalMode = 'create' | 'edit';

type UsuarioForm = {
  id: number;
  nombres: string;
  email: string;
  rol: Rol;
  estado: EstadoUser;
  password?: string;
};

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, IonIcon, IonButton, IonChip],
  templateUrl: './usuarios.page.html',
  styleUrls: ['./usuarios.page.scss'],
})
export class AdminUsuariosPage {
  // ===== mock data (luego API) =====
  usuarios = signal<Usuario[]>([
    {
      id: 5001,
      nombres: 'Adriana González',
      email: 'gerencia@hotelcasablanca.com',
      rol: 'GERENCIA',
      estado: 'ACTIVO',
      createdAt: '2025-12-01',
      ultimoAcceso: '2026-01-14',
    },
    {
      id: 5002,
      nombres: 'Misael Pozo',
      email: 'admin@hotelcasablanca.com',
      rol: 'ADMIN',
      estado: 'ACTIVO',
      createdAt: '2025-12-10',
      ultimoAcceso: '2026-01-13',
    },
    {
      id: 5003,
      nombres: 'Luis Álvarez',
      email: 'recepcion@hotelcasablanca.com',
      rol: 'RECEPCION',
      estado: 'ACTIVO',
      createdAt: '2026-01-02',
      ultimoAcceso: '2026-01-14',
    },
    {
      id: 5004,
      nombres: 'Carmen Solís',
      email: 'limpieza@hotelcasablanca.com',
      rol: 'LIMPIEZA',
      estado: 'BLOQUEADO',
      createdAt: '2026-01-04',
      ultimoAcceso: '2026-01-05',
    },
  ]);

  // ===== filtros =====
  q = signal('');
  fRol = signal<Rol | 'TODOS'>('TODOS');
  fEstado = signal<EstadoUser | 'TODOS'>('TODOS');

  // ===== modal =====
  modalOpen = signal(false);
  modalMode = signal<ModalMode>('create');

  // (mock) password solo para creación/edición
  form = signal<UsuarioForm>({
    id: 0,
    nombres: '',
    email: '',
    rol: 'RECEPCION',
    estado: 'ACTIVO',
    password: '',
  });

  // ===== KPIs =====
  total = computed(() => this.usuarios().length);
  activos = computed(() => this.usuarios().filter((u) => u.estado === 'ACTIVO').length);
  admins = computed(
    () => this.usuarios().filter((u) => u.rol === 'ADMIN' || u.rol === 'GERENCIA').length
  );
  bloqueados = computed(() => this.usuarios().filter((u) => u.estado === 'BLOQUEADO').length);

  // ===== lista filtrada =====
  filtrados = computed(() => {
    const q = this.q().trim().toLowerCase();
    const rol = this.fRol();
    const est = this.fEstado();

    return this.usuarios()
      .filter((u) => {
        const okQ =
          !q ||
          u.nombres.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.rol.toLowerCase().includes(q) ||
          u.estado.toLowerCase().includes(q);

        const okR = rol === 'TODOS' ? true : u.rol === rol;
        const okE = est === 'TODOS' ? true : u.estado === est;

        return okQ && okR && okE;
      })
      .sort((a, b) => b.id - a.id);
  });

  constructor() {
    addIcons({
      searchOutline,
      addCircleOutline,
      createOutline,
      eyeOutline,
      closeOutline,
      optionsOutline,
      peopleOutline,
      personOutline,
      mailOutline,
      shieldOutline,
      keyOutline,
      checkmarkCircleOutline,
      lockClosedOutline,
    });
  }

  // ===== UI =====
  setRolFilter(v: string) {
    this.fRol.set(v as any);
  }

  setEstadoFilter(v: string) {
    this.fEstado.set(v as any);
  }

  rolColor(rol: Rol): string {
    switch (rol) {
      case 'ADMIN':
      case 'GERENCIA':
        return 'primary';
      case 'RECEPCION':
        return 'warning';
      case 'LIMPIEZA':
        return 'medium';
      default:
        return 'medium';
    }
  }

  estadoColor(estado: EstadoUser): string {
    return estado === 'ACTIVO' ? 'success' : 'danger';
  }

  openCreate() {
    this.modalMode.set('create');
    this.form.set({
      id: 0,
      nombres: '',
      email: '',
      rol: 'RECEPCION',
      estado: 'ACTIVO',
      password: '',
    });
    this.modalOpen.set(true);
  }

  openEdit(u: Usuario) {
    this.modalMode.set('edit');
    this.form.set({
      id: u.id,
      nombres: u.nombres,
      email: u.email,
      rol: u.rol,
      estado: u.estado,
      password: '',
    });
    this.modalOpen.set(true);
  }

  closeModal() {
    this.modalOpen.set(false);
  }

  save() {
    const f = this.form();
    const nombres = f.nombres.trim();
    const email = f.email.trim().toLowerCase();

    if (!nombres || !email) return;

    // validación simple de email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

    if (this.modalMode() === 'create') {
      const nextId = Math.max(0, ...this.usuarios().map((x) => x.id)) + 1;

      const nuevo: Usuario = {
        id: nextId,
        nombres,
        email,
        rol: f.rol,
        estado: f.estado,
        createdAt: this.todayIso(),
        ultimoAcceso: this.todayIso(),
      };

      this.usuarios.set([nuevo, ...this.usuarios()]);
    } else {
      this.usuarios.set(
        this.usuarios().map((x) =>
          x.id === f.id ? { ...x, nombres, email, rol: f.rol, estado: f.estado } : x
        )
      );
    }

    this.modalOpen.set(false);
  }

  // Cambiar estado rápido
  toggleEstado(u: Usuario) {
    const next: EstadoUser = u.estado === 'ACTIVO' ? 'BLOQUEADO' : 'ACTIVO';
    this.usuarios.set(this.usuarios().map((x) => (x.id === u.id ? { ...x, estado: next } : x)));
  }

  // ✅ patch tipado (sin .value)
  patch<K extends keyof UsuarioForm>(key: K, value: UsuarioForm[K]) {
    this.form.set({ ...this.form(), [key]: value });
  }

  private todayIso(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
