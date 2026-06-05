import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from 'core';
import { catchError, defer, finalize, Observable, shareReplay, switchMap, throwError } from 'rxjs';

let refreshInFlight$: Observable<string> | null = null;
const RETRY_HEADER = 'X-Refresh-Retry';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const isAuthEndpoint = isAuthenticationEndpoint(request.url);
  const authRequest = addBearerToken(request, isAuthEndpoint, authService.getAccessToken());

  return next(authRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (shouldPropagateError(error, isAuthEndpoint, request)) {
        return throwError(() => error);
      }

      return retryWithRefresh(request, next, authService);
    })
  );
};

function addBearerToken(
  request: HttpRequest<unknown>,
  isAuthEndpoint: boolean,
  accessToken: string | null
): HttpRequest<unknown> {
  if (isAuthEndpoint || !accessToken) {
    return request;
  }

  return request.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } });
}

function shouldPropagateError(
  error: HttpErrorResponse,
  isAuthEndpoint: boolean,
  request: HttpRequest<unknown>
): boolean {
  return error.status !== 401 || isAuthEndpoint || request.headers.has(RETRY_HEADER);
}

function retryWithRefresh(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService
) {
  return getRefresh(authService).pipe(
    catchError((refreshError) => {
      authService.signOut();
      return throwError(() => refreshError);
    }),
    switchMap((token) => {
      const retry = request.clone({
        setHeaders: { Authorization: `Bearer ${token}`, [RETRY_HEADER]: '1' },
      });
      return next(retry);
    })
  );
}

function isAuthenticationEndpoint(url: string): boolean {
  return url.includes('/api/auth/login') || url.includes('/api/auth/refresh');
}

function getRefresh(authService: AuthService): Observable<string> {
  if (!refreshInFlight$) {
    refreshInFlight$ = defer(() => authService.refreshToken()).pipe(
      shareReplay(1),
      finalize(() => {
        refreshInFlight$ = null;
      })
    );
  }

  return refreshInFlight$;
}
