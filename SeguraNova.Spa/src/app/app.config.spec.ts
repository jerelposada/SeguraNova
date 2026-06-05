import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from 'core';
import { appConfig } from './app.config';

describe('appConfig http wiring', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', [
      'getAccessToken',
      'refreshToken',
      'signOut',
    ]);
    authService.getAccessToken.and.returnValue('wired-token');

    TestBed.configureTestingModule({
      providers: [
        ...appConfig.providers,
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

  it('should register auth interceptor through app config providers', () => {
    httpClient.get('/api/wiring').subscribe();

    const request = httpMock.expectOne('/api/wiring');
    expect(request.request.headers.get('Authorization')).toBe('Bearer wired-token');
    request.flush({});
  });
});
