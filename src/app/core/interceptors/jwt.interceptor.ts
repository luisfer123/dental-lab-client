import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

console.log('🚀 jwtInterceptor file loaded');

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getAccessToken();

  console.log(
    '🛰️ [JWT Interceptor] →',
    req.method,
    req.url,
    '| hasToken =',
    !!token
  );

  // No añadir header en endpoints de autenticación
  if (req.url.includes('/auth/')) {
    console.log('   ↪️  /auth/* request, skipping token');
    return next(req);
  }

  if (!token) {
    console.log('   ⚠️  No token available, continuing without Authorization');
    return next(req);
  }

  const cloned = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });

  console.log('   ✅ Token attached, forwarding request');
  return next(cloned);
};
