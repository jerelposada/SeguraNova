import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { authInterceptor } from './auth.interceptor';
import { authGuard } from './auth.guard';
import { AuthService } from 'core';

describe('auth flow integration', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let authService: AuthService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should refresh and retry once after 401 for an authenticated request', () => {
    authService.signIn('agent@seguranova.local', 'secret123').subscribe();

    const loginRequest = httpMock.expectOne('/api/auth/login');
    loginRequest.flush({
      access_token: createToken(futureExp()),
      refresh_token: 'refresh-1',
      token_type: 'Bearer',
      expires_in: 3600,
    });

    const canActivate = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));
    expect(canActivate).toBeTrue();

    httpClient.get('/api/cases').subscribe();

    const firstRequest = httpMock.expectOne('/api/cases');
    expect(firstRequest.request.headers.get('Authorization')).toContain('Bearer ');
    firstRequest.flush({}, { status: 401, statusText: 'Unauthorized' });

    const refreshRequest = httpMock.expectOne('/api/auth/refresh');
    expect(refreshRequest.request.body.refresh_token).toBe('refresh-1');
    refreshRequest.flush({
      access_token: createToken(futureExp()),
      refresh_token: 'refresh-2',
      token_type: 'Bearer',
      expires_in: 3600,
    });

    const retriedRequest = httpMock.expectOne('/api/cases');
    expect(retriedRequest.request.headers.get('X-Refresh-Retry')).toBe('1');
    retriedRequest.flush({ ok: true });
  });

  function createToken(exp: number): string {
    const payload = btoa(JSON.stringify({ exp, roles: ['empleado'] }));
    return `header.${payload}.signature`;
  }

  function futureExp(): number {
    return Math.floor(Date.now() / 1000) + 3600;
  }
});
