import { Injectable } from '@angular/core';
import { Role } from '../config/roles';

export interface StoredUser {
  id: number;
  nombres?: string;
  apellidos?: string;
  email?: string;
  rol?: Role;
  roles?: Role[];
}

@Injectable({ providedIn: 'root' })
export class StorageService {

  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'user';
  private readonly ROLE_KEY = 'rol';
  private readonly ROLES_KEY = 'roles';

  // ================= TOKEN =================

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  // ================= USER =================

  setUser(user: StoredUser): void {

    if (!user || !user.id) {
      console.warn('Intento de guardar usuario inválido');
      return;
    }

    localStorage.setItem(this.USER_KEY, JSON.stringify(user));

    if (user.rol) {
      localStorage.setItem(this.ROLE_KEY, user.rol);
    }

    if (user.roles && user.roles.length > 0) {
      localStorage.setItem(this.ROLES_KEY, JSON.stringify(user.roles));
    }
  }

  getUser(): StoredUser | null {

    const raw = localStorage.getItem(this.USER_KEY);

    if (!raw) return null;

    try {
      return JSON.parse(raw) as StoredUser;
    } catch {
      console.error('Error parseando usuario');
      return null;
    }
  }

  // ================= ROLES =================

  getRole(): Role | null {
    const raw = localStorage.getItem(this.ROLE_KEY);
    return raw ? (raw as Role) : null;
  }

  getRoles(): Role[] {

    const raw = localStorage.getItem(this.ROLES_KEY);

    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as Role[]) : [];
    } catch {
      console.error('Error parseando roles');
      return [];
    }
  }

  // ================= VALIDACIÓN =================

  isLoggedIn(): boolean {

    const token = this.getToken();
    const user = this.getUser();

    if (!token || !user) {
      return false;
    }

    // 🔥 VALIDACIÓN JWT (exp)
    if (this.isTokenExpired(token)) {
      this.clearAll();
      return false;
    }

    return true;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      if (!payload.exp) return false;

      const now = Math.floor(Date.now() / 1000);

      return payload.exp < now;

    } catch {
      return true; // si falla → inválido
    }
  }

  // ================= CLEAR =================

  clearAll(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    localStorage.removeItem(this.ROLES_KEY);
  }

}