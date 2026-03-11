import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { StorageService } from '../services/storage.service';

export const authGuard: CanActivateFn = () => {

  const router = inject(Router);
  const storage = inject(StorageService);

  const token = storage.getToken();

  if (token) {
    return true;
  }

  router.navigate(['/login']);
  return false;

};