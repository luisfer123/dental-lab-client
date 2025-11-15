import { Injectable } from '@angular/core';

const ACCESS_KEY = 'dl_access_token';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private storage: Storage = localStorage; // or sessionStorage

  getAccessToken(): string | null {
    return this.storage.getItem(ACCESS_KEY);
  }
  setAccessToken(token: string) {
    this.storage.setItem(ACCESS_KEY, token);
  }
  clear() {
    this.storage.removeItem(ACCESS_KEY);
  }
}
