import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, Observable, tap, throwError } from 'rxjs';

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

interface JwtPayload {
  exp?: number;
  roles?: string[] | string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly accessKey = 'sn_access_token';
  private readonly refreshKey = 'sn_refresh_token';
  private readonly missingRefreshTokenMessage = 'Missing refresh token.';

 public signIn(email: string, password: string): Observable<void> {
    return this.http.post<LoginResponse>('/api/auth/login', { email, password }).pipe(
      tap((tokens) => this.persistTokens(tokens)),
      map(() => undefined)
    );
  }

  public refreshToken(): Observable<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error(this.missingRefreshTokenMessage));
    }

    return this.http
      .post<LoginResponse>('/api/auth/refresh', { refresh_token: refreshToken })
      .pipe(
        tap((tokens) => this.persistTokens(tokens)),
        map((tokens) => tokens.access_token)
      );
  }

  public requestPasswordRecovery(email: string): Observable<void> {
    return this.http
      .post<{ message: string }>('/api/auth/password-recovery/request', { email })
      .pipe(map(() => undefined));
  }

  public resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http
      .post<void>('/api/auth/password-recovery/reset', {
        token,
        new_password: newPassword,
      })
      .pipe(map(() => undefined));
  }

  public signOut(): void {
    localStorage.removeItem(this.accessKey);
    localStorage.removeItem(this.refreshKey);
    this.router.navigate(['/login']);
  }

  public getAccessToken(): string | null {
    return localStorage.getItem(this.accessKey);
  }

  public getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshKey);
  }

  public isTokenExpired(token: string | null): boolean {
    if (!token) {
      return true;
    }

    const payload = this.decodeToken(token);
    if (!payload?.exp) {
      return true;
    }

    return payload.exp * 1000 <= Date.now();
  }

  public resolvePostLoginRoute(): string {
    const payload = this.decodeToken(this.getAccessToken());
    const roles = this.normalizeRoles(payload?.roles);
    if (roles.includes('admin_ti')) {
      return '/admin';
    }

    return roles.includes('agente_siniestros') || roles.includes('empleado') ? '/chat' : '/login';
  }

  private storeTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.accessKey, accessToken);
    localStorage.setItem(this.refreshKey, refreshToken);
  }

  private persistTokens(tokens: LoginResponse): void {
    this.storeTokens(tokens.access_token, tokens.refresh_token);
  }

  private decodeToken(token: string | null): JwtPayload | null {
    if (!token) {
      return null;
    }

    try {
      const [, payloadBase64] = token.split('.');
      if (!payloadBase64) {
        return null;
      }

      return JSON.parse(atob(payloadBase64)) as JwtPayload;
    } catch {
      return null;
    }
  }

  private normalizeRoles(roles: string[] | string | undefined): string[] {
    if (!roles) {
      return [];
    }

    if (Array.isArray(roles)) {
      return roles;
    }

    try {
      const parsed = JSON.parse(roles) as unknown;
      return Array.isArray(parsed) ? parsed.filter((role): role is string => typeof role === 'string') : [];
    } catch {
      return [roles];
    }
  }
}
