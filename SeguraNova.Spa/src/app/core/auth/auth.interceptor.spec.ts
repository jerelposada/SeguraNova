import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of, Subject } from 'rxjs';
import { AuthService } from 'core';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', [
      'getAccessToken',
      'refreshToken',
      'signOut',
    ]);
    authService.getAccessToken.and.returnValue('initial-token');
    authService.refreshToken.and.returnValue(of('refreshed-token'));

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authService },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add authorization header for non auth endpoints', () => {
    httpClient.get('/api/cases').subscribe();

    const request = httpMock.expectOne('/api/cases');

    expect(request.request.headers.get('Authorization')).toBe('Bearer initial-token');
    request.flush({});
  });

  it('should skip authorization header for login and refresh endpoints', () => {
    httpClient.post('/api/auth/login', {}).subscribe();
    httpClient.post('/api/auth/refresh', {}).subscribe();

    const login = httpMock.expectOne('/api/auth/login');
    const refresh = httpMock.expectOne('/api/auth/refresh');

    expect(login.request.headers.has('Authorization')).toBeFalse();
    expect(refresh.request.headers.has('Authorization')).toBeFalse();

    login.flush({});
    refresh.flush({});
  });

  it('should refresh once on 401 and retry original request', () => {
    httpClient.get('/api/cases').subscribe();

    const first = httpMock.expectOne('/api/cases');
    first.flush({}, { status: 401, statusText: 'Unauthorized' });

    const retried = httpMock.expectOne('/api/cases');
    expect(retried.request.headers.get('Authorization')).toBe('Bearer refreshed-token');
    retried.flush({ ok: true });

    expect(authService.refreshToken).toHaveBeenCalledTimes(1);
  });

  it('should sign out when refresh flow fails', () => {
    authService.refreshToken.and.throwError('refresh failed');

    httpClient.get('/api/cases').subscribe({ error: () => undefined });

    const first = httpMock.expectOne('/api/cases');
    first.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(authService.signOut).toHaveBeenCalledTimes(1);
  });

  it('should coalesce concurrent 401 responses into a single refresh call', () => {
    const refreshSubject = new Subject<string>();
    authService.refreshToken.and.returnValue(refreshSubject.asObservable());

    httpClient.get('/api/cases/1').subscribe();
    httpClient.get('/api/cases/2').subscribe();

    const first = httpMock.expectOne('/api/cases/1');
    const second = httpMock.expectOne('/api/cases/2');
    first.flush({}, { status: 401, statusText: 'Unauthorized' });
    second.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(authService.refreshToken).toHaveBeenCalledTimes(1);

    refreshSubject.next('shared-token');
    refreshSubject.complete();

    const retriedFirst = httpMock.expectOne('/api/cases/1');
    const retriedSecond = httpMock.expectOne('/api/cases/2');

    expect(retriedFirst.request.headers.get('Authorization')).toBe('Bearer shared-token');
    expect(retriedSecond.request.headers.get('Authorization')).toBe('Bearer shared-token');

    retriedFirst.flush({ ok: true });
    retriedSecond.flush({ ok: true });
  });

  it('should not loop refresh when retried request returns 401 again', () => {
    let capturedStatus = 0;

    httpClient.get('/api/cases').subscribe({
      error: (error) => {
        capturedStatus = error.status;
      },
    });

    const first = httpMock.expectOne('/api/cases');
    first.flush({}, { status: 401, statusText: 'Unauthorized' });

    const retried = httpMock.expectOne('/api/cases');
    expect(retried.request.headers.get('X-Refresh-Retry')).toBe('1');
    retried.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(authService.refreshToken).toHaveBeenCalledTimes(1);
    expect(authService.signOut).not.toHaveBeenCalled();
    expect(capturedStatus).toBe(401);
  });
});
