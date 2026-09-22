import { Injectable } from '@angular/core';
import { Role } from '../config/roles';

export interface StoredUser {
  id: number;
  nombre?: string;
  apellido?: string;
  email?: string;
  rol?: Role;
  roles?: Role[];
  /** plataforma | hotel | cliente (lo determina el servidor según el rol). */
  alcance?: 'plataforma' | 'hotel' | 'cliente';
  /** Hotel al que pertenece el personal (null para clientes y super_admin). */
  hotel_id?: number | null;
}

/**
 * Persistencia de la sesión en localStorage. Todo acceso está protegido con try/catch
 * (modo privado, cuota llena, SSR) y nunca escribe el token en consola.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'user';
  private readonly ROLE_KEY = 'rol';

  private read(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private write(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* sin almacenamiento disponible */
    }
  }

  private remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      /* sin almacenamiento disponible */
    }
  }

  // ---------- token ----------
  setToken(token: string): void {
    this.write(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return this.read(this.TOKEN_KEY);
  }

  clearToken(): void {
    this.remove(this.TOKEN_KEY);
  }

  // ---------- usuario ----------
  setUser(user: StoredUser): void {
    if (!user?.id) return;
    this.write(this.USER_KEY, JSON.stringify(user));
    if (user.rol) this.write(this.ROLE_KEY, user.rol);
  }

  getUser(): StoredUser | null {
    const raw = this.read(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredUser;
    } catch {
      return null;
    }
  }

  getRole(): Role | null {
    const user = this.getUser();
    return (user?.rol ?? (this.read(this.ROLE_KEY) as Role | null)) || null;
  }

  getRoles(): Role[] {
    const rol = this.getRole();
    return rol ? [rol] : [];
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  clearAll(): void {
    this.remove(this.TOKEN_KEY);
    this.remove(this.USER_KEY);
    this.remove(this.ROLE_KEY);
    this.remove('roles');
  }
}
