import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn
} from '@angular/common/http';

import { inject } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  filter,
  finalize,
  switchMap,
  take,
  throwError,
  Observable
} from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

let refreshing = false;
const refreshSubject = new BehaviorSubject<string | null>(null);

export const errorInterceptor: HttpInterceptorFn = (
  req,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {

  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse): Observable<HttpEvent<any>> => {

      const isAuthEndpoint =
        req.url.includes('/auth/login') ||
        req.url.includes('/auth/refresh') ||
        req.url.includes('/auth/logout');

      // ⛔ SOLO intentar refresh si el error es 401 exacto
      if (error.status !== 401 || isAuthEndpoint) {
        return throwError(() => error);
      }

      console.warn('🔐 401 detected → attempting refresh');

      // ---------------------------
      // WAIT IF REFRESH IS RUNNING
      // ---------------------------
      if (refreshing) {
        console.log('⏳ Waiting for ongoing refresh...');

        return refreshSubject.pipe(
          filter((token) => token !== null),
          take(1),
          switchMap((token) => {
            const cloned = req.clone({
              setHeaders: { Authorization: `Bearer ${token}` }
            });
            return next(cloned);
          })
        );
      }

      // ---------------------------
      // PERFORM NEW REFRESH
      // ---------------------------
      refreshing = true;
      refreshSubject.next(null);

      return auth.refresh().pipe(
        switchMap((newToken) => {
          if (!newToken) {
            console.warn('❌ Refresh returned null → logging out');
            auth.logout().subscribe();
            router.navigate(['/auth/login']);
            return throwError(() => error);
          }

          console.log('✅ Refresh success, retrying request');

          auth.setAccessToken(newToken);
          refreshSubject.next(newToken);

          const retryReq = req.clone({
            setHeaders: { Authorization: `Bearer ${newToken}` }
          });

          return next(retryReq);
        }),
        catchError((refreshErr) => {
          console.error('💥 Refresh FAILED:', refreshErr);
          auth.logout().subscribe();
          router.navigate(['/auth/login']);
          return throwError(() => refreshErr);
        }),
        finalize(() => {
          refreshing = false;
        })
      );
    })
  );
};
