import { Injectable, inject, signal } from '@angular/core';
import { Api } from './api';

@Injectable({ providedIn: 'root' })
export class CartState {
  private readonly api = inject(Api);
  readonly count = signal(0);
  refresh(): void {
    this.api.get<{ items: unknown[] }>('/cart').subscribe({
      next: response => this.count.set(response.items?.length ?? 0),
      error: () => this.count.set(0)
    });
  }
}
