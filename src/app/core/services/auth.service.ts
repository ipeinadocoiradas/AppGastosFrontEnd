import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthUser, LoginCommand, LoginResponse } from '../models/api.models';
import { parseJwt } from '../utils/jwt.util';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly storage = inject(TokenStorageService);

  private readonly token = signal<string | null>(this.storage.getToken());

  readonly user = computed<AuthUser | null>(() => {
    const token = this.token();
    return token ? parseJwt(token) : null;
  });
  readonly isAdmin = computed(
    () => this.user()?.roles.some((role) => role.toLowerCase().startsWith('admin')) ?? false,
  );
  readonly roleLabel = computed(() => this.user()?.roles[0] ?? 'Usuario');

  /** Hay token y no ha caducado. */
  isAuthenticated(): boolean {
    if (!this.token()) return false;
    const exp = this.user()?.exp;
    return exp == null || exp * 1000 > Date.now();
  }

  login(command: LoginCommand): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/api/auth/login`, command)
      .pipe(
        tap(({ accessToken }) => {
          this.storage.setToken(accessToken);
          this.token.set(accessToken);
        }),
      );
  }

  logout(): void {
    this.storage.clear();
    this.token.set(null);
    void this.router.navigate(['/login']);
  }
}
