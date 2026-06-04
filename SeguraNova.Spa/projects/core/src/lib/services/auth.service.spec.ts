import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

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
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should store tokens using required localStorage keys on signIn', () => {
    service.signIn('agent@seguranova.local', 'secret123').subscribe();

    const request = httpMock.expectOne('/api/auth/login');
    request.flush({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      token_type: 'Bearer',
      expires_in: 3600,
    });

    expect(localStorage.getItem('sn_access_token')).toBe('access-token');
    expect(localStorage.getItem('sn_refresh_token')).toBe('refresh-token');
  });

  it('should clear tokens on signOut', () => {
    localStorage.setItem('sn_access_token', 'access-token');
    localStorage.setItem('sn_refresh_token', 'refresh-token');

    service.signOut();

    expect(localStorage.getItem('sn_access_token')).toBeNull();
    expect(localStorage.getItem('sn_refresh_token')).toBeNull();
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

  function createToken(payload: object): string {
    const encoded = btoa(JSON.stringify(payload));
    return `header.${encoded}.signature`;
  }

  function futureExp(): number {
    return Math.floor(Date.now() / 1000) + 3600;
  }
});
