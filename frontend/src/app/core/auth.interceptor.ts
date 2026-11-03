import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Injector, inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = typeof localStorage === 'undefined' ? null : localStorage.getItem('artistapp_token');
  if (!token) return next(request);
  const injector = inject(Injector);
  return next(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })).pipe(
    catchError((error: HttpErrorResponse) => {
      // La sesión ha caducado o ya no existe. /auth/me lo gestiona refreshSession sin cambiar de página.
      if (error.status === 401 && !request.url.endsWith('/auth/me')) injector.get(AuthService).clearSession();
      return throwError(() => error);
    }),
  );
};
