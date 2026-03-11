import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { inject } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { Role } from '../config/roles';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {

  const router = inject(Router);
  const storage = inject(StorageService);

  const token = storage.getToken();

  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  const allowed = (route.data['roles'] ?? []) as Role[];

  if (!allowed.length) {
    return true;
  }

  const role = storage.getRole();

  if (role && allowed.includes(role)) {
    return true;
  }

  router.navigate(['/inicio']);
  return false;

};