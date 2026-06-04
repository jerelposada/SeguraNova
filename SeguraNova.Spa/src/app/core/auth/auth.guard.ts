import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from 'core';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getAccessToken();

  if (!token || isTokenExpired(token)) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};

function isTokenExpired(token: string): boolean {
  try {
    const [, payloadBase64] = token.split('.');
    if (!payloadBase64) {
      return true;
    }

    const payload = JSON.parse(atob(payloadBase64)) as { exp?: number };
    if (!payload.exp) {
      return true;
    }

    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}
