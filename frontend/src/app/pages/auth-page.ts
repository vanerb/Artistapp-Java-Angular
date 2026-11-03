import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Api } from '../core/api';
import { Observable } from 'rxjs';

type AuthMode = 'login' | 'register' | 'recover' | 'reset';
type AuthForm = {
  user: string;
  password: string;
  password_confirmation: string;
  nombre: string;
  apellidos: string;
  usuario: string;
  correo: string;
  id_tipo: number;
  token: string;
};

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './auth-page.html',
  styleUrl: './auth-page.css',
})
export class AuthPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(Api);
  private readonly auth = inject(AuthService);
  readonly mode = this.route.snapshot.data['mode'] as AuthMode;
  busy = false;
  message = '';
  isError = false;
  form: AuthForm = {
    user: '',
    password: '',
    password_confirmation: '',
    nombre: '',
    apellidos: '',
    usuario: '',
    correo: '',
    id_tipo: 5,
    token: '',
  };

  constructor() {
    this.form['correo'] = this.route.snapshot.queryParamMap.get('email') ?? '';
    this.form['token'] = this.route.snapshot.queryParamMap.get('token') ?? '';
  }

  passwordHasMinLength(): boolean {
    return this.form.password.length >= 8;
  }
  passwordHasLowercase(): boolean {
    return /[a-z]/.test(this.form.password);
  }
  passwordHasUppercase(): boolean {
    return /[A-Z]/.test(this.form.password);
  }
  passwordHasNumber(): boolean {
    return /\d/.test(this.form.password);
  }
  passwordsMatch(): boolean {
    return this.form.password.length > 0 && this.form.password === this.form.password_confirmation;
  }
  registrationPasswordValid(): boolean {
    return (
      this.passwordHasMinLength() &&
      this.passwordHasLowercase() &&
      this.passwordHasUppercase() &&
      this.passwordHasNumber() &&
      this.passwordsMatch()
    );
  }

  submit(): void {
    this.busy = true;
    this.message = '';
    const request: Observable<any> =
      this.mode === 'login'
        ? this.auth.login({
            user: String(this.form['user']),
            password: String(this.form['password']),
          })
        : this.mode === 'register'
          ? this.auth.register(this.form)
          : this.mode === 'recover'
            ? this.api.post<{ message: string }>('/auth/forgot-password', {
                correo: this.form['correo'],
              })
            : this.api.post<{ message: string }>('/auth/reset-password', {
                correo: this.form['correo'],
                token: this.form['token'],
                password: this.form['password'],
                password_confirmation: this.form['password_confirmation'],
              });
    request.subscribe({
      next: (result: any) => {
        this.busy = false;
        if (this.mode === 'recover') {
          this.message = result.message ?? 'Si el correo existe, recibirás instrucciones.';
          return;
        }
        if (this.mode === 'reset') {
          this.message = result.message ?? 'Contraseña actualizada.';
          setTimeout(() => void this.router.navigateByUrl('/login'), 1500);
          return;
        }
        this.auth.acceptSession(result);
        const requested = this.route.snapshot.queryParamMap.get('redirect');
        const destination =
          requested?.startsWith('/') && !requested.startsWith('//') ? requested : '/admin';
        void this.router.navigateByUrl(this.auth.isAdmin() ? destination : '/descubrir');
      },
      error: (error: any) => {
        this.busy = false;
        this.isError = true;
        const validation = error.error?.errors ? Object.values(error.error.errors).flat()[0] : null;
        this.message = String(
          validation ??
            error.error?.message ??
            'No se pudo conectar con ArtistApp. Revisa que la API esté en marcha.',
        );
      },
    });
  }
}
