import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const required: string[] = route.data['roles'] ?? [];
  if (!auth.isLoggedIn()) return router.parseUrl('/auth/login');

  const ok = required.length === 0 || required.some(r => auth.hasRole(r));
  return ok ? true : router.parseUrl('/auth/login');
};
