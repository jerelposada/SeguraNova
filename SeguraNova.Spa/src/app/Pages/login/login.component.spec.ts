import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';
import { Observable } from 'rxjs';
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

  it('should stop loading and allow retry when signIn fails asynchronously', (done) => {
    // signIn will error on the next macrotask
    authServiceMock.signIn.and.returnValue(
      new Observable<void>((subscriber) => {
        setTimeout(() => subscriber.error(new Error('login async failed')), 0);
      })
    );

    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    component.form.setValue({
      email: 'empleado@seguranova.local',
      password: 'secret123',
      rememberMe: false,
    });

    component.onSubmit();

    // loading should be true immediately after submit
    expect(component.isLoading()).toBeTrue();

    // wait for async error delivery
    setTimeout(() => {
      // after error, loading must be false and error message shown
      expect(component.isLoading()).toBeFalse();
      expect(component.loginError()).toBe('Ocurrió un error. Por favor, intenta de nuevo.');

      // allow retry: call onSubmit again and expect signIn called twice
      component.onSubmit();
      expect(authServiceMock.signIn).toHaveBeenCalledTimes(2);
      done();
    }, 0);
  });

  it('should render button loading state and revert after signIn error (DOM)', (done) => {
    // signIn will error on the next macrotask
    authServiceMock.signIn.and.returnValue(
      new Observable<void>((subscriber) => {
        setTimeout(() => subscriber.error(new Error('login async failed')), 0);
      })
    );

    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    component.form.setValue({
      email: 'empleado@seguranova.local',
      password: 'secret123',
      rememberMe: false,
    });

    fixture.detectChanges();

    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');

    // initial state: not loading
    expect(btn.disabled).toBeFalse();
    expect(btn.textContent).toContain('Iniciar sesión');

    // submit -> should enter loading state in DOM
    component.onSubmit();
    fixture.detectChanges();
    expect(btn.disabled).toBeTrue();
    expect(btn.textContent).toContain('Iniciando sesión');
    expect(fixture.nativeElement.querySelector('.spinner')).not.toBeNull();

    // deliver async error on next macrotask
    setTimeout(() => {
      fixture.detectChanges();

      // after error, loading must be removed and button restored
      expect(component.isLoading()).toBeFalse();
      expect(btn.disabled).toBeFalse();
      expect(btn.textContent).toContain('Iniciar sesión');
      expect(fixture.nativeElement.querySelector('.spinner')).toBeNull();
      done();
    }, 0);
  });

  it('should render forgot password link pointing to forgot-password route', () => {
    authServiceMock.signIn.and.returnValue(of(void 0));

    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    const forgotPasswordLink = fixture.nativeElement.querySelector('.link--forgot') as HTMLAnchorElement;

    expect(forgotPasswordLink.getAttribute('href')).toBe('/forgot-password');
  });
});
