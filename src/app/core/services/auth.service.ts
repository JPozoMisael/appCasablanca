import { Injectable, computed, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { StorageService, StoredUser } from './storage.service';
import { Role } from '../config/roles';
import { MenuService } from './menu.service';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
}

interface LoginResponse {
  ok: boolean;
  data: { token: string; usuario: StoredUser };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  /** Usuario en sesión; los componentes lo leen con `auth.usuario()` y se actualizan solos. */
  readonly usuario = signal<StoredUser | null>(null);
  readonly estaLogueado = computed(() => this.usuario() !== null);
  readonly esStaff = computed(() => ['plataforma', 'hotel'].includes(this.usuario()?.alcance ?? ''));
  readonly esSuperAdmin = computed(() => this.usuario()?.alcance === 'plataforma');
  readonly iniciales = computed(() => {
    const u = this.usuario();
    return `${u?.nombre?.charAt(0) ?? ''}${u?.apellido?.charAt(0) ?? ''}`.toUpperCase() || '?';
  });

  constructor(
    private api: ApiService,
    private storage: StorageService,
    private menu: MenuService
  ) {
    this.usuario.set(this.storage.getToken() ? this.storage.getUser() : null);
  }

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('/auth/login', payload).pipe(
      tap((res) => {
        if (!res?.data?.token || !res?.data?.usuario) {
          throw new Error('Respuesta inválida del servidor');
        }
        this.storage.setToken(res.data.token);
        this.storage.setUser(res.data.usuario);
        this.usuario.set(res.data.usuario);
        this.menu.limpiar();
      })
    );
  }

  register(payload: RegisterRequest): Observable<unknown> {
    return this.api.post('/auth/register', payload);
  }

  /** Vuelve a leer el perfil desde el servidor (rol/hotel pueden haber cambiado). */
  refrescarPerfil(): Observable<{ ok: boolean; data: StoredUser }> {
    return this.api.get<{ ok: boolean; data: StoredUser }>('/auth/me').pipe(
      tap((res) => {
        this.storage.setUser(res.data);
        this.usuario.set(res.data);
      })
    );
  }

  actualizarPerfil(datos: { nombre?: string; apellido?: string }) {
    return this.api.patch<{ ok: boolean; data: StoredUser }>('/auth/me', datos).pipe(
      tap((res) => {
        const actual = this.storage.getUser();
        const nuevo = { ...actual, ...res.data } as StoredUser;
        this.storage.setUser(nuevo);
        this.usuario.set(nuevo);
      })
    );
  }

  cambiarPassword(actual: string, nueva: string) {
    return this.api.post('/auth/change-password', { actual, nueva });
  }

  logout(): void {
    this.storage.clearAll();
    this.menu.limpiar();
    this.usuario.set(null);
  }

  // Compatibilidad con guards y páginas existentes
  isLoggedIn(): boolean {
    return this.storage.isLoggedIn();
  }

  getRole(): Role | null {
    return this.storage.getRole();
  }

  getUser(): StoredUser | null {
    return this.storage.getUser();
  }
}
