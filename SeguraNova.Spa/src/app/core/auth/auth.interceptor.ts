import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from 'core';
import { catchError, defer, finalize, Observable, shareReplay, switchMap, throwError } from 'rxjs';

let refreshInFlight$: Observable<string> | null = null;

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const isAuthEndpoint =
    request.url.includes('/api/auth/login') || request.url.includes('/api/auth/refresh');
  const accessToken = authService.getAccessToken();

  const authRequest =
    !isAuthEndpoint && accessToken
      ? request.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
      : request;

  return next(authRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || isAuthEndpoint || request.headers.has('X-Refresh-Retry')) {
        return throwError(() => error);
      }

      return getRefresh(authService).pipe(
        switchMap((token) => {
          const retry = request.clone({
            setHeaders: { Authorization: `Bearer ${token}`, 'X-Refresh-Retry': '1' },
          });
          return next(retry);
        }),
        catchError((refreshError) => {
          authService.signOut();
          return throwError(() => refreshError);
        })
      );
    })
  );
};

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
