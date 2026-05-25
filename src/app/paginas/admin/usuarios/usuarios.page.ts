import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon, IonButton, IonChip } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  searchOutline, addCircleOutline, createOutline, eyeOutline, closeOutline,
  refreshOutline, peopleOutline, personOutline, mailOutline, shieldOutline,
  keyOutline, checkmarkCircleOutline, lockClosedOutline, trashOutline
} from 'ionicons/icons';

type Rol = 'ADMIN' | 'GERENCIA' | 'RECEPCION' | 'LIMPIEZA';
type EstadoUser = 'ACTIVO' | 'BLOQUEADO';

interface Usuario {
  id: number; nombres: string; email: string; rol: Rol; estado: EstadoUser;
  createdAt: string; ultimoAcceso?: string;
}
type ModalMode = 'create' | 'edit';
interface UsuarioForm { id: number; nombres: string; email: string; rol: Rol; estado: EstadoUser; password?: string; }

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, IonIcon, IonButton, IonChip],
  templateUrl: './usuarios.page.html',
  styleUrls: ['./usuarios.page.scss'],
})
export class AdminUsuariosPage {
  usuarios = signal<Usuario[]>([
    { id: 5001, nombres: 'Adriana González', email: 'gerencia@hotelcasablanca.com', rol: 'GERENCIA', estado: 'ACTIVO', createdAt: '2025-12-01', ultimoAcceso: '2026-01-14' },
    { id: 5002, nombres: 'Misael Pozo', email: 'admin@hotelcasablanca.com', rol: 'ADMIN', estado: 'ACTIVO', createdAt: '2025-12-10', ultimoAcceso: '2026-01-13' },
    { id: 5003, nombres: 'Luis Álvarez', email: 'recepcion@hotelcasablanca.com', rol: 'RECEPCION', estado: 'ACTIVO', createdAt: '2026-01-02', ultimoAcceso: '2026-01-14' },
    { id: 5004, nombres: 'Carmen Solís', email: 'limpieza@hotelcasablanca.com', rol: 'LIMPIEZA', estado: 'BLOQUEADO', createdAt: '2026-01-04', ultimoAcceso: '2026-01-05' }
  ]);

  q = signal('');
  fRol = signal<Rol | 'TODOS'>('TODOS');
  fEstado = signal<EstadoUser | 'TODOS'>('TODOS');
  modalOpen = signal(false);
  modalMode = signal<ModalMode>('create');
  form = signal<UsuarioForm>({ id: 0, nombres: '', email: '', rol: 'RECEPCION', estado: 'ACTIVO', password: '' });

  constructor() { addIcons({ searchOutline, addCircleOutline, createOutline, eyeOutline, closeOutline, refreshOutline, peopleOutline, personOutline, mailOutline, shieldOutline, keyOutline, checkmarkCircleOutline, lockClosedOutline, trashOutline }); }

  total = () => this.usuarios().length;
  activos = () => this.usuarios().filter(u => u.estado === 'ACTIVO').length;
  admins = () => this.usuarios().filter(u => u.rol === 'ADMIN' || u.rol === 'GERENCIA').length;
  bloqueados = () => this.usuarios().filter(u => u.estado === 'BLOQUEADO').length;

  filtrados = computed(() => {
    let items = this.usuarios();
    const query = this.q().trim().toLowerCase();
    if (query) items = items.filter(u => u.nombres.toLowerCase().includes(query) || u.email.toLowerCase().includes(query) || u.rol.toLowerCase().includes(query) || u.estado.toLowerCase().includes(query));
    if (this.fRol() !== 'TODOS') items = items.filter(u => u.rol === this.fRol());
    if (this.fEstado() !== 'TODOS') items = items.filter(u => u.estado === this.fEstado());
    return items.sort((a, b) => b.id - a.id);
  });

  setRolFilter(v: string) { this.fRol.set(v as any); }
  setEstadoFilter(v: string) { this.fEstado.set(v as any); }
  getInitials(nombre: string) { return nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase(); }
  formatRol(rol: Rol) { return { ADMIN: 'ADMIN', GERENCIA: 'GERENCIA', RECEPCION: 'RECEPCION', LIMPIEZA: 'LIMPIEZA' }[rol]; }
  formatEstado(estado: EstadoUser) { return estado === 'ACTIVO' ? 'ACTIVO' : 'BLOQUEADO'; }
  getRolClass(rol: Rol) { return { ADMIN: 'admin', GERENCIA: 'gerencia', RECEPCION: 'recepcion', LIMPIEZA: 'limpieza' }[rol]; }
  getEstadoClass(estado: EstadoUser) { return estado === 'ACTIVO' ? 'activo' : 'bloqueado'; }

  openDetail(u: Usuario) { alert(`Usuario: ${u.nombres}\nEmail: ${u.email}\nRol: ${u.rol}\nEstado: ${u.estado}\nÚltimo acceso: ${u.ultimoAcceso || '—'}\nCreado: ${u.createdAt}`); }
  openCreate() { this.modalMode.set('create'); this.form.set({ id: 0, nombres: '', email: '', rol: 'RECEPCION', estado: 'ACTIVO', password: '' }); this.modalOpen.set(true); }
  openEdit(u: Usuario) { this.modalMode.set('edit'); this.form.set({ id: u.id, nombres: u.nombres, email: u.email, rol: u.rol, estado: u.estado, password: '' }); this.modalOpen.set(true); }
  closeModal() { this.modalOpen.set(false); }
  patch<K extends keyof UsuarioForm>(key: K, value: UsuarioForm[K]) { this.form.set({ ...this.form(), [key]: value }); }

  save() {
    const f = this.form();
    if (!f.nombres.trim() || !f.email.trim()) { alert('Complete los campos obligatorios'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) { alert('Email inválido'); return; }
    if (this.modalMode() === 'create') {
      const nextId = Math.max(...this.usuarios().map(u => u.id), 0) + 1;
      this.usuarios.set([{ id: nextId, nombres: f.nombres.trim(), email: f.email.toLowerCase(), rol: f.rol, estado: f.estado, createdAt: new Date().toISOString().split('T')[0], ultimoAcceso: new Date().toISOString().split('T')[0] }, ...this.usuarios()]);
    } else {
      this.usuarios.set(this.usuarios().map(u => u.id === f.id ? { ...u, nombres: f.nombres.trim(), email: f.email.toLowerCase(), rol: f.rol, estado: f.estado } : u));
    }
    this.closeModal();
  }

  toggleEstado(u: Usuario) {
    const next = u.estado === 'ACTIVO' ? 'BLOQUEADO' : 'ACTIVO';
    this.usuarios.set(this.usuarios().map(x => x.id === u.id ? { ...x, estado: next } : x));
  }

  confirmDelete(u: Usuario) {
    if (confirm(`¿Eliminar usuario "${u.nombres}"?`)) {
      this.usuarios.set(this.usuarios().filter(x => x.id !== u.id));
    }
  }
}