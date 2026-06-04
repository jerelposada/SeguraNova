import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'core';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let router: jasmine.SpyObj<Router>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['getAccessToken']);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: Router, useValue: router },
        { provide: AuthService, useValue: authService },
      ],
    });
  });

  it('should redirect to login when token is missing', () => {
    authService.getAccessToken.and.returnValue(null);

    const canActivate = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

    expect(canActivate).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should redirect to login when token is expired', () => {
    authService.getAccessToken.and.returnValue(createToken(pastExp()));

    const canActivate = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

    expect(canActivate).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should allow access when token is valid', () => {
    authService.getAccessToken.and.returnValue(createToken(futureExp()));

    const canActivate = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

    expect(canActivate).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  function createToken(exp: number): string {
    const payload = btoa(JSON.stringify({ exp }));
    return `header.${payload}.signature`;
  }

  function futureExp(): number {
    return Math.floor(Date.now() / 1000) + 60;
  }

  function pastExp(): number {
    return Math.floor(Date.now() / 1000) - 60;
  }
});
