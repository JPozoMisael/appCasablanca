import { Injectable } from '@angular/core';

import { Observable, tap } from 'rxjs';

import { API_ENDPOINTS } from '../config/endpoints';

import { ApiService } from './api.service';

import {
  StorageService,
  StoredUser
} from './storage.service';

import { Role } from '../config/roles';


// =========================================
// INTERFACES
// =========================================

export interface LoginRequest {

  email: string;

  password: string;
}


// 🔥 ADAPTADO A TU BACKEND REAL

export interface LoginResponse {

  ok: boolean;

  message: string;

  data: {

    token: string;

    usuario: {

      id: number;

      nombre?: string;

      apellido?: string;

      email?: string;

      rol?: Role;
    };
  };
}


export interface RegisterRequest {

  nombre: string;

  apellido: string;

  email: string;

  password: string;

  telefono?: string;
}


// =========================================
// SERVICE
// =========================================

@Injectable({
  providedIn: 'root'
})

export class AuthService {


  constructor(

    private api: ApiService,

    private storage: StorageService

  ) {}


  // =======================================
  // LOGIN
  // =======================================

  login(
    payload: LoginRequest
  ): Observable<LoginResponse> {

    return this.api
      .post<LoginResponse>(
        API_ENDPOINTS.auth.login,
        payload
      )

      .pipe(

        tap((res) => {

          // =================================
          // VALIDAR RESPONSE
          // =================================

          if (
            !res?.data?.token ||
            !res?.data?.usuario
          ) {

            throw new Error(
              'Respuesta inválida del servidor'
            );
          }


          // =================================
          // EXTRAER DATOS
          // =================================

          const token =
            res.data.token;

          const usuario =
            res.data.usuario;


          // =================================
          // GUARDAR TOKEN
          // =================================

          this.storage.setToken(
            token
          );


          // =================================
          // NORMALIZAR USER
          // =================================

          const user: StoredUser = {

            id:
              usuario.id,

            nombres:
              usuario.nombre,

            apellidos:
              usuario.apellido,

            email:
              usuario.email,

            rol:
              usuario.rol,

            roles:
              usuario.rol
                ? [usuario.rol]
                : []
          };


          // =================================
          // GUARDAR USER
          // =================================

          this.storage.setUser(
            user
          );

        })
      );
  }


  // =======================================
  // REGISTER
  // =======================================

  register(
    payload: RegisterRequest
  ): Observable<any> {

    return this.api.post(

      API_ENDPOINTS.auth.register,

      payload
    );
  }


  // =======================================
  // PROFILE
  // =======================================

  profile(): Observable<StoredUser> {

    return this.api.get<StoredUser>(
      API_ENDPOINTS.auth.profile
    );
  }


  // =======================================
  // LOGOUT
  // =======================================

  logout(): void {

    this.storage.clearAll();
  }


  // =======================================
  // HELPERS
  // =======================================

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