import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { StorageService } from '../services/storage.service';

export const authGuard: CanActivateFn = () => {

  console.log('[AUTH GUARD] Ejecutando...');

  const router = inject(Router);
  const storage = inject(StorageService);

  const token = storage.getToken();

  console.log('[AUTH GUARD] Token:', token ? 'EXISTE' : 'NO EXISTE');

  if (token) {
    console.log('[AUTH GUARD] Acceso permitido');
    return true;
  }

  console.warn('[AUTH GUARD] Sin token. Redirigiendo a /login');

  router.navigate(['/login']);
  return false;

};