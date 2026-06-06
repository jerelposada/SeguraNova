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

  public togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  public isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && (control?.dirty || control?.touched));
  }

  public getEmailError(): string {
    const control = this.form.get('email');
    if (control?.hasError('required')) return 'El email es requerido';
    if (control?.hasError('email')) return 'Ingresa un email válido';
    return '';
  }

  public getPasswordError(): string {
    const control = this.form.get('password');
    if (control?.hasError('required')) return 'La contraseña es requerida';
    if (control?.hasError('minlength')) return 'Mínimo 8 caracteres requeridos';
    return '';
  }

  public onSubmit(): void {
    if (this.isSubmitBlocked()) return;

    this.setSubmittingState();
    const { email, password } = this.getCredentialsFromForm();

    this.submitCredentials(email, password);
  }

  private isSubmitBlocked(): boolean {
    if (!this.form.invalid) return false;

    this.form.markAllAsTouched();
    return true;
  }

  private setSubmittingState(): void {
    this.isLoading.set(true);
    this.loginError.set(null);
  }

  private getCredentialsFromForm(): { email: string; password: string } {
    const email = this.form.get('email')!.value;
    const password = this.form.get('password')!.value;
    return { email, password };
  }

  private submitCredentials(email: string, password: string): void {
    this.authService
      .signIn(email, password)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => { this.isLoading.set(false); console.log('Login attempt finalized'); }))
      .subscribe({
        next: () => this.onLoginSuccess(),
        error: () => this.onLoginError(),
      });
  }

  private onLoginSuccess(): void {
    this.loginSuccess.set(true);
    this.isLoading.set(false);
    console.log('Login successful');
    this.router.navigate([this.authService.resolvePostLoginRoute()]);
  }

  private onLoginError(): void {
    this.loginError.set('Ocurrió un error. Por favor, intenta de nuevo.');
    this.isLoading.set(false);
    console.log('Login failed');
  }
}
