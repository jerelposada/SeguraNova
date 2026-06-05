import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const accessKey = 'sn_access_token';
  const refreshKey = 'sn_refresh_token';

  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should call login endpoint with POST and credentials body on signIn', () => {
    const credentials = { email: 'agent@seguranova.local', password: 'secret123' };

    service.signIn(credentials.email, credentials.password).subscribe();

    const request = httpMock.expectOne('/api/auth/login');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(credentials);
    request.flush(createTokenResponse('access-token', 'refresh-token'));
  });

  it('should store tokens using required localStorage keys on signIn', () => {
    service.signIn('agent@seguranova.local', 'secret123').subscribe();

    const request = httpMock.expectOne('/api/auth/login');
    request.flush(createTokenResponse('access-token', 'refresh-token'));

    expectStoredTokens('access-token', 'refresh-token');
  });

  it('should emit undefined on successful signIn without exposing login payload', () => {
    let signInResult: void | undefined = 'payload-exposed' as unknown as void;

    service.signIn('agent@seguranova.local', 'secret123').subscribe((result) => {
      signInResult = result;
    });

    const request = httpMock.expectOne('/api/auth/login');
    request.flush(createTokenResponse('access-token', 'refresh-token'));

    expect(signInResult).toBeUndefined();
  });

  it('should clear tokens and navigate to login on signOut', () => {
    localStorage.setItem(accessKey, 'access-token');
    localStorage.setItem(refreshKey, 'refresh-token');

    service.signOut();

    expect(localStorage.getItem(accessKey)).toBeNull();
    expect(localStorage.getItem(refreshKey)).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should call refresh endpoint with persisted refresh token', () => {
    localStorage.setItem(refreshKey, 'stored-refresh-token');

    service.refreshToken().subscribe();

    const request = httpMock.expectOne('/api/auth/refresh');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ refresh_token: 'stored-refresh-token' });
    request.flush(createTokenResponse('new-access-token', 'new-refresh-token'));
  });

  it('should return new access token and replace persisted tokens on refreshToken', () => {
    localStorage.setItem(refreshKey, 'stored-refresh-token');
    let refreshedAccessToken = '';

    service.refreshToken().subscribe((token) => {
      refreshedAccessToken = token;
    });

    const request = httpMock.expectOne('/api/auth/refresh');
    request.flush(createTokenResponse('new-access-token', 'new-refresh-token'));

    expect(refreshedAccessToken).toBe('new-access-token');
    expectStoredTokens('new-access-token', 'new-refresh-token');
  });

  it('should emit controlled error when refresh token is missing', (done) => {
    service.refreshToken().subscribe({
      next: () => fail('Expected refreshToken to fail when token is missing'),
      error: (error) => {
        expect(error.message).toBe('Missing refresh token.');
        done();
      },
    });
  });

  it('should resolve route by role using access token payload', () => {
    localStorage.setItem('sn_access_token', createToken({ roles: ['admin_ti'], exp: futureExp() }));

    const route = service.resolvePostLoginRoute();

    expect(route).toBe('/admin');
  });

  it('should resolve chat route for empleado role', () => {
    localStorage.setItem('sn_access_token', createToken({ roles: ['empleado'], exp: futureExp() }));

    const route = service.resolvePostLoginRoute();

    expect(route).toBe('/chat');
  });

  it('should resolve chat route for agente_siniestros role', () => {
    localStorage.setItem(
      'sn_access_token',
      createToken({ roles: ['agente_siniestros'], exp: futureExp() })
    );

    const route = service.resolvePostLoginRoute();

    expect(route).toBe('/chat');
  });

  it('should fallback to login route when token roles are missing', () => {
    localStorage.setItem('sn_access_token', createToken({ exp: futureExp() }));

    const route = service.resolvePostLoginRoute();

    expect(route).toBe('/login');
  });

  it('should fallback to login route when token roles are invalid', () => {
    localStorage.setItem('sn_access_token', createToken({ roles: '{"role":"admin_ti"}', exp: futureExp() }));

    const route = service.resolvePostLoginRoute();

    expect(route).toBe('/login');
  });

  function createToken(payload: object): string {
    const encoded = btoa(JSON.stringify(payload));
    return `header.${encoded}.signature`;
  }

  function createTokenResponse(accessToken: string, refreshToken: string) {
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: 3600,
    };
  }

  function expectStoredTokens(accessToken: string, refreshToken: string): void {
    expect(localStorage.getItem(accessKey)).toBe(accessToken);
    expect(localStorage.getItem(refreshKey)).toBe(refreshToken);
  }

  function futureExp(): number {
    return Math.floor(Date.now() / 1000) + 3600;
  }
});
