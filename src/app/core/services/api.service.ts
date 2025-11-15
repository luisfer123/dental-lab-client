import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  private url(path: string) {
    return path.startsWith('http') ? path : `${this.base}${path}`;
  }

  // ✅ Incluir automáticamente cookies en endpoints de autenticación
  private shouldUseCredentials(path: string, withCreds: boolean): boolean {
    return (
      withCreds ||
      path.includes('/auth/login') ||
      path.includes('/auth/refresh') ||
      path.includes('/auth/logout')
    );
  }

  get<T>(
    path: string,
    params?: HttpParams | Record<string, string | number | boolean>,
    withCreds = false
  ) {
    const creds = this.shouldUseCredentials(path, withCreds);
    return this.http.get<T>(this.url(path), {
      params: params as any,
      withCredentials: creds
    });
  }

  post<T>(path: string, body: any, withCreds = false) {
    const creds = this.shouldUseCredentials(path, withCreds);
    return this.http.post<T>(this.url(path), body, {
      withCredentials: creds,
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }

  delete<T>(path: string, withCreds = false) {
    const creds = this.shouldUseCredentials(path, withCreds);
    return this.http.delete<T>(this.url(path), { withCredentials: creds });
  }
}
