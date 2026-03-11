import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../config/endpoints';
import { ApiService } from './api.services';
import { Usuario } from '@app/shared/models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  constructor(private api: ApiService) {}

  getAll(): Observable<Usuario[]> {
    return this.api.get<Usuario[]>(API_ENDPOINTS.usuarios.list);
  }

  getById(id: number): Observable<Usuario> {
    return this.api.get<Usuario>(API_ENDPOINTS.usuarios.get(id));
  }

  create(payload: Partial<Usuario>): Observable<Usuario> {
    return this.api.post<Usuario>(API_ENDPOINTS.usuarios.create, payload);
  }

  update(id: number, payload: Partial<Usuario>): Observable<Usuario> {
    return this.api.put<Usuario>(API_ENDPOINTS.usuarios.update(id), payload);
  }

  delete(id: number): Observable<any> {
    return this.api.delete(API_ENDPOINTS.usuarios.delete(id));
  }
}
