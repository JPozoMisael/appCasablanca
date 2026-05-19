import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { ADMIN_ROLES }
  from '../config/roles';

import { StorageService }
  from '../services/storage.service';

export const adminGuard: CanActivateFn = () => {

  console.log(
    '[ADMIN GUARD] Ejecutando...'
  );

  const router =
    inject(Router);

  const storage =
    inject(StorageService);


  // =====================================
  // TOKEN
  // =====================================

  const token =
    storage.getToken();

  console.log(
    '[ADMIN GUARD] Token:',
    token ? 'EXISTE' : 'NO EXISTE'
  );


  if (!token) {

    console.warn(
      '[ADMIN GUARD] Sin token. Redirigiendo a /login'
    );

    router.navigate([
      '/login'
    ]);

    return false;
  }


  // =====================================
  // ROLE
  // =====================================

  const role =
    storage.getRole();

  console.log(
    '[ADMIN GUARD] Role:',
    role
  );

  console.log(
    '[ADMIN GUARD] ADMIN_ROLES:',
    ADMIN_ROLES
  );


  // =====================================
  // VALIDACIÓN
  // =====================================

  if (
    role &&
    ADMIN_ROLES.includes(role)
  ) {

    console.log(
      '[ADMIN GUARD] Acceso permitido'
    );

    return true;
  }


  console.warn(
    '[ADMIN GUARD] Acceso denegado. Redirigiendo a /inicio'
  );

  router.navigate([
    '/inicio'
  ]);

  return false;
};