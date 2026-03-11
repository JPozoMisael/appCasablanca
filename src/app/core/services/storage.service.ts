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

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  setUser(user: StoredUser): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    if (user.rol) localStorage.setItem(this.ROLE_KEY, user.rol);
    if (user.roles) localStorage.setItem(this.ROLES_KEY, JSON.stringify(user.roles));
  }

  getUser(): StoredUser | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredUser;
    } catch {
      return null;
    }
  }

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
      return [];
    }
  }

  clearAll(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    localStorage.removeItem(this.ROLES_KEY);
  }
}
