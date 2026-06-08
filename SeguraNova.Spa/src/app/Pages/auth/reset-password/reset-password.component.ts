import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from 'core';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  readonly isSubmitting = signal(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group(
    {
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: ResetPasswordComponent.matchPasswords }
  );

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.errorMessage.set('Token de recuperación inválido o ausente.');
      return;
    }

    this.isSubmitting.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    this.authService
      .resetPassword(token, this.form.controls.newPassword.value)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => this.successMessage.set('Tu contraseña fue restablecida correctamente.'),
        error: () => this.errorMessage.set('El token es inválido, expiró o ya fue utilizado.'),
      });
  }

  private static matchPasswords(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value as string | undefined;
    const confirmPassword = control.get('confirmPassword')?.value as string | undefined;

    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }
}
