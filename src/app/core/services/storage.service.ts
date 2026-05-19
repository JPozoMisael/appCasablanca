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

@Injectable({
  providedIn: 'root'
})

export class StorageService {

  private readonly TOKEN_KEY = 'token';

  private readonly USER_KEY = 'user';

  private readonly ROLE_KEY = 'rol';

  private readonly ROLES_KEY = 'roles';


  // =========================================
  // TOKEN
  // =========================================

  setToken(token: string): void {

    console.log(
      '[STORAGE] Guardando token'
    );

    localStorage.setItem(
      this.TOKEN_KEY,
      token
    );
  }


  getToken(): string | null {

    const token =
      localStorage.getItem(
        this.TOKEN_KEY
      );

    console.log(
      '[STORAGE] Token:',
      token ? 'EXISTE' : 'NO EXISTE'
    );

    return token;
  }


  clearToken(): void {

    console.log(
      '[STORAGE] Eliminando token'
    );

    localStorage.removeItem(
      this.TOKEN_KEY
    );
  }


  // =========================================
  // USER
  // =========================================

  setUser(user: StoredUser): void {

    console.log(
      '[STORAGE] Guardando usuario:',
      user
    );

    if (!user || !user.id) {

      console.warn(
        '[STORAGE] Usuario inválido'
      );

      return;
    }

    localStorage.setItem(
      this.USER_KEY,
      JSON.stringify(user)
    );


    if (user.rol) {

      console.log(
        '[STORAGE] Guardando rol:',
        user.rol
      );

      localStorage.setItem(
        this.ROLE_KEY,
        user.rol
      );
    }


    if (
      user.roles &&
      user.roles.length > 0
    ) {

      console.log(
        '[STORAGE] Guardando roles:',
        user.roles
      );

      localStorage.setItem(

        this.ROLES_KEY,

        JSON.stringify(user.roles)
      );
    }
  }


  getUser(): StoredUser | null {

    const raw =
      localStorage.getItem(
        this.USER_KEY
      );

    console.log(
      '[STORAGE] Obteniendo usuario'
    );

    if (!raw) {

      console.warn(
        '[STORAGE] Usuario no encontrado'
      );

      return null;
    }

    try {

      const parsed =
        JSON.parse(raw) as StoredUser;

      console.log(
        '[STORAGE] Usuario:',
        parsed
      );

      return parsed;

    } catch {

      console.error(
        '[STORAGE] Error parseando usuario'
      );

      return null;
    }
  }


  // =========================================
  // ROLES
  // =========================================

  getRole(): Role | null {

    const raw =
      localStorage.getItem(
        this.ROLE_KEY
      );

    console.log(
      '[STORAGE] Role:',
      raw
    );

    return raw
      ? (raw as Role)
      : null;
  }


  getRoles(): Role[] {

    const raw =
      localStorage.getItem(
        this.ROLES_KEY
      );

    console.log(
      '[STORAGE] Roles:',
      raw
    );

    if (!raw) {
      return [];
    }

    try {

      const parsed =
        JSON.parse(raw);

      return Array.isArray(parsed)

        ? (parsed as Role[])

        : [];

    } catch {

      console.error(
        '[STORAGE] Error parseando roles'
      );

      return [];
    }
  }


  // =========================================
  // VALIDACIÓN
  // =========================================

  isLoggedIn(): boolean {

    console.log(
      '[STORAGE] Validando sesión'
    );

    const token =
      this.getToken();

    const user =
      this.getUser();


    if (!token || !user) {

      console.warn(
        '[STORAGE] Sesión inválida'
      );

      return false;
    }


    // =====================================
    // VALIDAR JWT
    // =====================================

    if (
      this.isTokenExpired(token)
    ) {

      console.warn(
        '[STORAGE] Token expirado'
      );

      this.clearAll();

      return false;
    }


    console.log(
      '[STORAGE] Sesión válida'
    );

    return true;
  }


  private isTokenExpired(
    token: string
  ): boolean {

    try {

      const payload =
        JSON.parse(

          atob(
            token.split('.')[1]
          )
        );


      if (!payload.exp) {
        return false;
      }


      const now =
        Math.floor(
          Date.now() / 1000
        );


      return payload.exp < now;

    } catch {

      console.error(
        '[STORAGE] Token inválido'
      );

      return true;
    }
  }


  // =========================================
  // CLEAR
  // =========================================

  clearAll(): void {

    console.warn(
      '[STORAGE] Limpiando sesión'
    );

    localStorage.removeItem(
      this.TOKEN_KEY
    );

    localStorage.removeItem(
      this.USER_KEY
    );

    localStorage.removeItem(
      this.ROLE_KEY
    );

    localStorage.removeItem(
      this.ROLES_KEY
    );
  }

}