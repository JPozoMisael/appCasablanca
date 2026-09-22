import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { StorageService } from '../services/storage.service';

/** Exige sesión iniciada. */
export const authGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  if (inject(StorageService).getToken()) return true;
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
