import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';
import { AuthService } from 'core';
import { ForgotPasswordComponent } from './forgot-password.component';

describe('ForgotPasswordComponent', () => {
  const authServiceMock = {
    requestPasswordRecovery: jasmine.createSpy('requestPasswordRecovery'),
  };

  beforeEach(async () => {
    authServiceMock.requestPasswordRecovery.calls.reset();
    authServiceMock.requestPasswordRecovery.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();
  });

  it('should not request recovery when form is invalid', () => {
    const fixture = TestBed.createComponent(ForgotPasswordComponent);
    const component = fixture.componentInstance;

    component.onSubmit();

    expect(authServiceMock.requestPasswordRecovery).not.toHaveBeenCalled();
  });

  it('should request recovery with email when form is valid', () => {
    const fixture = TestBed.createComponent(ForgotPasswordComponent);
    const component = fixture.componentInstance;
    component.form.controls.email.setValue('agent@seguranova.local');

    component.onSubmit();

    expect(authServiceMock.requestPasswordRecovery).toHaveBeenCalledWith('agent@seguranova.local');
    expect(component.successMessage()).toContain('Si el correo existe');
  });

  it('should expose error state when recovery request fails', () => {
    authServiceMock.requestPasswordRecovery.and.returnValue(throwError(() => new Error('request failed')));
    const fixture = TestBed.createComponent(ForgotPasswordComponent);
    const component = fixture.componentInstance;
    component.form.controls.email.setValue('agent@seguranova.local');

    component.onSubmit();

    expect(component.errorMessage()).toContain('No fue posible procesar la solicitud');
  });
});
