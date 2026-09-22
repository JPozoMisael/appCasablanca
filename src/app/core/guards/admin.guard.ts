import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { MenuService } from '../services/menu.service';
import { StorageService } from '../services/storage.service';

/**
 * Acceso al panel: solo personal (alcance plataforma u hotel). El alcance lo confirma el servidor
 * al cargar el menú; lo guardado en el navegador no se usa para decidir.
 */
export const adminGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const menu = inject(MenuService);

  if (!inject(StorageService).getToken()) return router.createUrlTree(['/login']);
  await menu.asegurarCargado();
  return menu.alcance() === 'cliente' ? router.createUrlTree(['/inicio']) : true;
};
