import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, map, tap, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ApiService } from '../services/api.service';
import { TokenService } from '../services/token.service';
import {
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  UserInfo,
  JwtPayload
} from '../models/auth.models';
import { Router } from '@angular/router';

function decodeJwt(token: string): JwtPayload | null {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}

function rolesFromToken(token?: string | null): string[] {
  if (!token) return [];
  return decodeJwt(token)?.roles ?? [];
}

function usernameFromToken(token?: string | null): string {
  if (!token) return '';
  return decodeJwt(token)?.sub ?? '';
}

function isExpired(token?: string | null): boolean {
  if (!token) return true;
  const exp = decodeJwt(token)?.exp;
  return exp ? Date.now() >= exp * 1000 : true;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private user$ = new BehaviorSubject<UserInfo | null>(null);
  readonly currentUser$ = this.user$.asObservable();

  private refreshing = false;

  constructor(
    private api: ApiService,
    private tokens: TokenService,
    private router: Router,
    private zone: NgZone
  ) {
    const token = this.tokens.getAccessToken();
    if (token && !isExpired(token)) {
      this.runInsideZone(() => this.updateUserFromToken(token));
    } else {
      this.tokens.clear();
    }
  }

  /** Login */
  login(credentials: LoginRequest): Observable<void> {
    return this.api.post<LoginResponse>('/auth/login', credentials, true).pipe(
      tap((res) => this.setAccessToken(res.accessToken)),
      map(() => void 0)
    );
  }

  /** Refresh token */
  refresh(): Observable<string> {
    if (this.refreshing) {
      const token = this.tokens.getAccessToken();
      return of(token ?? '');
    }

    this.refreshing = true;

    return this.api.post<RefreshResponse>('/auth/refresh', {}, true).pipe(
      map((res) => res.accessToken),
      tap((newToken) => {
        if (newToken) {
          this.setAccessToken(newToken);
        } else {
          this.clearSession();
        }
      }),
      finalize(() => (this.refreshing = false))
    );
  }

  /** Logout */
  logout(): Observable<void> {
    return this.api.post<void>('/auth/logout', {}, true).pipe(
      catchError(() => []),
      finalize(() => this.clearSession())
    );
  }

  // ===========================================================
  // Utilidades de sesión
  // ===========================================================

  getAccessToken(): string | null {
    return this.tokens.getAccessToken();
  }

  setAccessToken(token: string): void {
    this.tokens.setAccessToken(token);
    console.log('🔄 setAccessToken(): zone.run ejecutado, actualizando usuario');
    // 🔹 Ejecutar actualización dentro del ciclo Angular
    this.zone.run(() => {
      this.updateUserFromToken(token, true);
      console.log('👤 Usuario actualizado en NgZone:', this.user$.value);
    });
  }

  isLoggedIn(): boolean {
    const token = this.tokens.getAccessToken();
    return !!token && !isExpired(token);
  }

  hasRole(role: string): boolean {
    return this.user$.value?.roles.includes(role) ?? false;
  }

  hasAnyRole(roles: string | string[]): boolean {
    const userRoles = this.user$.value?.roles ?? [];
    return Array.isArray(roles)
      ? roles.some((r) => userRoles.includes(r))
      : userRoles.includes(roles);
  }

  get isAdmin(): boolean {
    return this.hasRole('ROLE_ADMIN');
  }

  get isTechnician(): boolean {
    return this.hasRole('ROLE_TECHNICIAN');
  }

  get username(): string | null {
    return this.user$.value?.username ?? null;
  }

  // ===========================================================
  // Internos
  // ===========================================================

  private updateUserFromToken(token: string, force = false): void {
    if (!token) {
      this.user$.next(null);
      return;
    }

    const newUser: UserInfo = {
      username: usernameFromToken(token),
      roles: rolesFromToken(token)
    };

    const current = this.user$.value;
    const changed =
      !current ||
      current.username !== newUser.username ||
      current.roles.join(',') !== newUser.roles.join(',');

    if (changed || force) {
      console.log('🧭 Actualizando usuario desde token:', newUser);
      this.user$.next(newUser);
    }
  }

  private clearSession(): void {
    this.tokens.clear();
    this.runInsideZone(() => {
      this.user$.next(null);
      this.router.navigate(['/auth/login']);
    });
  }

  /** Ejecuta cualquier operación dentro del ciclo de Angular */
  private runInsideZone(fn: () => void): void {
    this.zone.run(() => fn());
  }
}
