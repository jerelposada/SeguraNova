import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);

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

  // isFieldValid(field: string): boolean {
  //   const control = this.form.get(field);
  //   return !!(control?.valid && (control?.dirty || control?.touched));
  // }

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

  async onSubmit(): Promise<void> {
    console.log('console.log(form.value);');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    this.loginError.set(null);
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 1800));
      this.loginSuccess.set(true);
    } catch {
      this.loginError.set('Credenciales inválidas. Por favor, intenta de nuevo.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
