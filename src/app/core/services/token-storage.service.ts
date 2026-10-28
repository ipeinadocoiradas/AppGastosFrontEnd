import { Injectable } from '@angular/core';

const TOKEN_KEY = 'gastos.access_token';

/** Único punto de acceso a localStorage para el JWT. */
@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }
  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
  }
}
