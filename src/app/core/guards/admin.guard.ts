import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { ADMIN_ROLES } from '../config/roles';
import { StorageService } from '../services/storage.service';

export const adminGuard: CanActivateFn = () => {

  const router = inject(Router);
  const storage = inject(StorageService);

  const token = storage.getToken();
  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  const role = storage.getRole();

  if (role && ADMIN_ROLES.includes(role)) {
    return true;
  }

  router.navigate(['/inicio']);
  return false;

};