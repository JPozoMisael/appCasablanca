import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { API_ENDPOINTS } from '../config/endpoints';
import { ApiService } from './api.services';
import { StorageService, StoredUser } from './storage.service';
import { Role } from '../config/roles';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    nombres?: string;
    apellidos?: string;
    email?: string;
    rol?: Role;
    roles?: Role[];
  };
}

export interface RegisterRequest {
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  telefono?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(
    private api: ApiService,
    private storage: StorageService
  ) {}

  login(payload: LoginRequest): Observable<LoginResponse> {

    return this.api.post<LoginResponse>(API_ENDPOINTS.auth.login, payload).pipe(

      tap((res) => {

        // guardar token
        this.storage.setToken(res.token);

        // normalizar rol
        const role: Role | undefined = res.user.rol ?? res.user.roles?.[0];

        const user: StoredUser = {
          id: res.user.id,
          nombres: res.user.nombres,
          apellidos: res.user.apellidos,
          email: res.user.email,
          rol: role,
          roles: res.user.roles
        };

        // guardar usuario
        this.storage.setUser(user);

      })

    );

  }

  register(payload: RegisterRequest): Observable<any> {
    return this.api.post(API_ENDPOINTS.auth.register, payload);
  }

  profile(): Observable<StoredUser> {
    return this.api.get<StoredUser>(API_ENDPOINTS.auth.profile);
  }

  logout(): void {
    this.storage.clearAll();
  }

  isLoggedIn(): boolean {
    return !!this.storage.getToken();
  }

  getRole(): Role | null {
    return this.storage.getRole();
  }

  getUser(): StoredUser | null {
    return this.storage.getUser();
  }

}