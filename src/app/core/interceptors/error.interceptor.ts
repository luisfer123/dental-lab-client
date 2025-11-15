import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpHandlerFn,
  HttpEvent
} from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import {
  BehaviorSubject,
  catchError,
  filter,
  finalize,
  switchMap,
  take,
  throwError,
  of,
  Observable
} from 'rxjs';
import { Router } from '@angular/router';

let refreshing = false;
const refreshSubject = new BehaviorSubject<string | null>(null);

export const errorInterceptor: HttpInterceptorFn = (
  req,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const auth = inject(AuthService);
  const router = inject(Router);

  console.log('🧩 [Error Interceptor] Listening on →', req.url);

  return next(req).pipe(
    catchError((error: HttpErrorResponse): Observable<HttpEvent<any>> => {
      console.warn('🚨 [Error Interceptor] caught →', error.status, req.url);

      // Si no es 401, pasa el error tal cual
      if (
        error.status !== 401 ||
        req.url.includes('/auth/login') ||
        req.url.includes('/auth/refresh') ||
        req.url.includes('/auth/logout')
      ) {
        return throwError(() => error);
      }

      console.log('🔒 Detected 401 for →', req.url);

      if (refreshing) {
        console.log('⏳ Waiting for active refresh...');
        return refreshSubject.pipe(
          filter((token): token is string => token !== null),
          take(1),
          switchMap((token) => {
            console.log('✅ Received new token from another refresh');
            const cloned = req.clone({
              setHeaders: { Authorization: `Bearer ${token}` }
            });
            return next(cloned);
          })
        );
      }

      refreshing = true;
      refreshSubject.next(null);
      console.log('🔄 Starting refresh flow...');

      return auth.refresh().pipe(
        switchMap((newToken) => {
          console.log('✅ Refresh completed →', newToken ? 'YES' : 'NO');
          if (!newToken) {
            auth.logout().subscribe();
            router.navigate(['/auth/login']);
            return throwError(() => error);
          }

          auth.setAccessToken(newToken);
          refreshSubject.next(newToken);

          const cloned = req.clone({
            setHeaders: { Authorization: `Bearer ${newToken}` }
          });
          console.log('🔁 Retrying →', cloned.url);

          return next(cloned);
        }),
        catchError((refreshErr) => {
          console.error('💥 Refresh failed:', refreshErr);
          auth.logout().subscribe();
          router.navigate(['/auth/login']);
          return throwError(() => refreshErr);
        }),
        finalize(() => {
          refreshing = false;
          console.log('🔚 Refresh cycle complete');
        })
      );
    })
  );
};
