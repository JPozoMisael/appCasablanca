import {
  CanActivateFn,
  ActivatedRouteSnapshot,
  Router
} from '@angular/router';

import { inject }
  from '@angular/core';

import { StorageService }
  from '../services/storage.service';

import { Role }
  from '../config/roles';

export const roleGuard: CanActivateFn = (

  route: ActivatedRouteSnapshot

) => {

  console.log(
    '[ROLE GUARD] Ejecutando...'
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
    '[ROLE GUARD] Token:',
    token ? 'EXISTE' : 'NO EXISTE'
  );


  if (!token) {

    console.warn(
      '[ROLE GUARD] Sin token. Redirigiendo a /login'
    );

    router.navigate([
      '/login'
    ]);

    return false;
  }


  // =====================================
  // ROLES PERMITIDOS
  // =====================================

  const allowed =
    (route.data['roles'] ?? []) as Role[];

  console.log(
    '[ROLE GUARD] Allowed:',
    allowed
  );


  if (!allowed.length) {

    console.log(
      '[ROLE GUARD] Ruta libre'
    );

    return true;
  }


  // =====================================
  // ROLE USUARIO
  // =====================================

  const role =
    storage.getRole();

  console.log(
    '[ROLE GUARD] User role:',
    role
  );


  // =====================================
  // VALIDACIÓN
  // =====================================

  if (
    role &&
    allowed.includes(role)
  ) {

    console.log(
      '[ROLE GUARD] Acceso permitido'
    );

    return true;
  }


  console.warn(
    '[ROLE GUARD] Acceso denegado. Redirigiendo a /inicio'
  );

  router.navigate([
    '/inicio'
  ]);

  return false;
};