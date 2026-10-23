import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Api } from './api';

export interface ArtistUser {
  id: number;
  nombre: string;
  apellidos: string;
  usuario: string;
  correo: string;
  id_tipo: number | string;
  imagen?: string;
  biografia?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(Api);
  private readonly router = inject(Router);
  private readonly userSignal = signal<ArtistUser | null>(this.readCachedUser());
  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.userSignal());
  readonly isAdmin = computed(() => Number(this.userSignal()?.id_tipo) === 1);

  login(credentials: { user: string; password: string }) {
    return this.api.post<{ user: ArtistUser; token: string }>('/auth/login', credentials);
  }

  register(data: Record<string, string | number>) {
    return this.api.post<{ user: ArtistUser; token: string }>('/auth/register', data);
  }

  refreshSession(): void {
    if (!localStorage.getItem('artistapp_token')) return;
    this.api.get<{ user: ArtistUser }>('/auth/me').subscribe({
      next: response => {
        const user = this.normalizeUser(response.user);
        localStorage.setItem('artistapp_user', JSON.stringify(user));
        this.userSignal.set(user);
      },
      error: error => {
        if (error.status === 401) this.clearSession(false);
      }
    });
  }

  acceptSession(session: { user: ArtistUser; token: string }): void {
    session = { ...session, user: this.normalizeUser(session.user) };
    localStorage.setItem('artistapp_token', session.token);
    localStorage.setItem('artistapp_user', JSON.stringify(session.user));
    this.userSignal.set(session.user);
  }

  updateUser(changes: Partial<ArtistUser>): void {
    const current = this.userSignal();
    if (!current) return;
    const user = this.normalizeUser({ ...current, ...changes });
    localStorage.setItem('artistapp_user', JSON.stringify(user));
    this.userSignal.set(user);
  }

  logout(): void {
    this.api.post('/auth/logout', {}).subscribe({ complete: () => this.clearSession(), error: () => this.clearSession() });
  }

  clearSession(navigate = true): void {
    localStorage.removeItem('artistapp_token');
    localStorage.removeItem('artistapp_user');
    this.userSignal.set(null);
    if (navigate) void this.router.navigateByUrl('/login');
  }

  private readCachedUser(): ArtistUser | null {
    try {
      if (typeof localStorage === 'undefined') return null;
      if (!localStorage.getItem('artistapp_token')) return null;
      const cached = JSON.parse(localStorage.getItem('artistapp_user') ?? 'null') as ArtistUser | null;
      return cached ? this.normalizeUser(cached) : null;
    } catch {
      return null;
    }
  }

  private normalizeUser(user: ArtistUser): ArtistUser {
    return { ...user, id: Number(user.id), id_tipo: Number(user.id_tipo) };
  }
}
