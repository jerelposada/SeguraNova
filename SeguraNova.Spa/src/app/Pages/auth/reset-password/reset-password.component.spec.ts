import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from 'core';
import { ResetPasswordComponent } from './reset-password.component';

describe('ResetPasswordComponent', () => {
  const authServiceMock = {
    resetPassword: jasmine.createSpy('resetPassword'),
  };

  function createRouteWithToken(token: string | null) {
    return {
      snapshot: {
        queryParamMap: convertToParamMap(token ? { token } : {}),
      },
    };
  }

  beforeEach(async () => {
    authServiceMock.resetPassword.calls.reset();
    authServiceMock.resetPassword.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [ResetPasswordComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthService, useValue: authServiceMock },
        { provide: ActivatedRoute, useValue: createRouteWithToken('valid-token') },
      ],
    }).compileComponents();
  });

  it('should block reset when passwords do not match', () => {
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    const component = fixture.componentInstance;
    component.form.controls.newPassword.setValue('NewPassword123');
    component.form.controls.confirmPassword.setValue('OtherPassword123');

    component.onSubmit();

    expect(authServiceMock.resetPassword).not.toHaveBeenCalled();
  });

  it('should reset password with token and new password when form is valid', () => {
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    const component = fixture.componentInstance;
    component.form.controls.newPassword.setValue('NewPassword123');
    component.form.controls.confirmPassword.setValue('NewPassword123');

    component.onSubmit();

    expect(authServiceMock.resetPassword).toHaveBeenCalledWith('valid-token', 'NewPassword123');
    expect(component.successMessage()).toContain('restablecida');
  });

  it('should expose invalid token message when token is missing', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [ResetPasswordComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthService, useValue: authServiceMock },
        { provide: ActivatedRoute, useValue: createRouteWithToken(null) },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ResetPasswordComponent);
    const component = fixture.componentInstance;
    component.form.controls.newPassword.setValue('NewPassword123');
    component.form.controls.confirmPassword.setValue('NewPassword123');

    component.onSubmit();

    expect(authServiceMock.resetPassword).not.toHaveBeenCalled();
    expect(component.errorMessage()).toContain('Token de recuperación inválido');
  });

  it('should expose reset error when backend rejects token', () => {
    authServiceMock.resetPassword.and.returnValue(throwError(() => new Error('invalid token')));
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    const component = fixture.componentInstance;
    component.form.controls.newPassword.setValue('NewPassword123');
    component.form.controls.confirmPassword.setValue('NewPassword123');

    component.onSubmit();

    expect(component.errorMessage()).toContain('inválido');
  });
});
