import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { HotelScopeService } from '../services/hotel-scope.service';
import { MenuService } from '../services/menu.service';
import { environment } from 'src/environments/environment';

/**
 * Agrega el token a las peticiones hacia nuestra API (y el hotel elegido si es super_admin) y cierra
 * la sesión si el servidor responde 401. No registra el token en consola.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(StorageService);
  const scope = inject(HotelScopeService);
  const menu = inject(MenuService);
  const router = inject(Router);

  const esNuestraApi = req.url.startsWith(environment.apiUrl);
  const token = storage.getToken();

  let peticion = req;
  if (token && esNuestraApi) {
    const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
    const hotel = scope.get();
    if (hotel && storage.getUser()?.alcance === 'plataforma') headers['X-Hotel-Id'] = String(hotel);
    peticion = req.clone({ setHeaders: headers });
  }

  return next(peticion).pipe(
    catchError((err: HttpErrorResponse) => {
      const esLogin = req.url.includes('/auth/login');
      if (err.status === 401 && token && esNuestraApi && !esLogin) {
        storage.clearAll();
        menu.limpiar();
        scope.set(null);
        router.navigate(['/login'], { queryParams: { sesion: 'expirada', returnUrl: router.url } });
      }
      return throwError(() => err);
    })
  );
};
