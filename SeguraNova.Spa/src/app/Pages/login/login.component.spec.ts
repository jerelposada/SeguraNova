import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from 'core';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  const authServiceMock = {
    signIn: jasmine.createSpy('signIn'),
    resolvePostLoginRoute: jasmine.createSpy('resolvePostLoginRoute'),
  };

  const routerMock = {
    navigate: jasmine.createSpy('navigate'),
  };

  beforeEach(async () => {
    authServiceMock.signIn.calls.reset();
    authServiceMock.resolvePostLoginRoute.calls.reset();
    routerMock.navigate.calls.reset();

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();
  });

  it('should navigate to /admin after successful login for admin_ti role', () => {
    authServiceMock.signIn.and.returnValue(of(void 0));
    authServiceMock.resolvePostLoginRoute.and.returnValue('/admin');

    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    component.form.setValue({
      email: 'admin@seguranova.local',
      password: 'secret123',
      rememberMe: false,
    });

    component.onSubmit();

    expect(authServiceMock.signIn).toHaveBeenCalledWith('admin@seguranova.local', 'secret123');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/admin']);
  });

  it('should navigate to /chat after successful login for empleado role', () => {
    authServiceMock.signIn.and.returnValue(of(void 0));
    authServiceMock.resolvePostLoginRoute.and.returnValue('/chat');

    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    component.form.setValue({
      email: 'empleado@seguranova.local',
      password: 'secret123',
      rememberMe: true,
    });

    component.onSubmit();

    expect(authServiceMock.signIn).toHaveBeenCalledWith('empleado@seguranova.local', 'secret123');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/chat']);
  });

  it('should stop loading and set login error when signIn fails', () => {
    authServiceMock.signIn.and.returnValue(throwError(() => new Error('login failed')));

    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    component.form.setValue({
      email: 'empleado@seguranova.local',
      password: 'secret123',
      rememberMe: false,
    });

    component.onSubmit();

    expect(component.isLoading()).toBeFalse();
    expect(component.loginError()).toBe('Ocurrió un error. Por favor, intenta de nuevo.');
  });
});
