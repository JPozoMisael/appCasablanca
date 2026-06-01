import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  
  console.log('=========================================');
  console.log('🔵 [AUTH INTERCEPTOR] Ejecutándose');
  console.log(`🔵 [AUTH INTERCEPTOR] URL: ${req.url}`);
  console.log(`🔵 [AUTH INTERCEPTOR] Método: ${req.method}`);
  console.log(`🔵 [AUTH INTERCEPTOR] Token en localStorage: ${token ? '✅ EXISTE' : '❌ NO EXISTE'}`);
  
  if (token) {
    console.log(`🔵 [AUTH INTERCEPTOR] Token (primeros 50 chars): ${token.substring(0, 50)}...`);
  }

  if (!token) {
    console.log('🔴 [AUTH INTERCEPTOR] No hay token - Enviando petición sin autorización');
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log('🟢 [AUTH INTERCEPTOR] Token agregado al header Authorization');
  console.log('=========================================');
  
  return next(authReq);
};