import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { MenuService } from '../services/menu.service';

/**
 * Deja entrar a una página del panel solo si su ruta está en el menú del usuario
 * (que sale de la base de datos según su rol). Si no, lo lleva a la primera opción que sí tenga.
 */
export const menuGuard: CanActivateFn = async (_route, state) => {
  const router = inject(Router);
  const menu = inject(MenuService);

  await menu.asegurarCargado();
  if (menu.permiteRuta(state.url)) return true;

  const primera = menu.primeraRuta();
  return primera && primera !== state.url.split('?')[0] ? router.createUrlTree([primera]) : router.createUrlTree(['/inicio']);
};
