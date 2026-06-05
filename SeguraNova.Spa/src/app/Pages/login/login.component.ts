import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from 'core';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly showPassword = signal(false);
  readonly isLoading = signal(false);
  readonly loginError = signal<string | null>(null);
  readonly loginSuccess = signal(false);

  readonly passwordInputType = computed(() =>
    this.showPassword() ? 'text' : 'password'
  );

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    rememberMe: [false],
  });

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && (control?.dirty || control?.touched));
  }

  getEmailError(): string {
    const control = this.form.get('email');
    if (control?.hasError('required')) return 'El email es requerido';
    if (control?.hasError('email')) return 'Ingresa un email válido';
    return '';
  }

  getPasswordError(): string {
    const control = this.form.get('password');
    if (control?.hasError('required')) return 'La contraseña es requerida';
    if (control?.hasError('minlength')) return 'Mínimo 8 caracteres requeridos';
    return '';
  }

  onSubmit(): void {
    if (this.shouldAbortSubmit()) {
      return;
    }

    this.prepareSubmitState();
    const { email, password } = this.getCredentials();

    this.authService
      .signIn(email, password)
      .pipe(finalize(() => this.isLoading.set(false)))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.handleLoginSuccess(),
        error: () => this.handleLoginError(),
      });
  }

  private shouldAbortSubmit(): boolean {
    if (!this.form.invalid) {
      return false;
    }

    this.form.markAllAsTouched();
    return true;
  }

  private prepareSubmitState(): void {
    this.isLoading.set(true);
    this.loginError.set(null);
  }

  private getCredentials(): { email: string; password: string } {
    const email = this.form.get('email')!.value;
    const password = this.form.get('password')!.value;
    return { email, password };
  }

  private handleLoginSuccess(): void {
    this.loginSuccess.set(true);
    this.router.navigate([this.authService.resolvePostLoginRoute()]);
  }

  private handleLoginError(): void {
    this.loginError.set('Ocurrió un error. Por favor, intenta de nuevo.');
  }
}
