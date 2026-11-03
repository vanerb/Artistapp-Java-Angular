import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Api } from '../core/api';
import { NotificationState } from '../core/notification-state';

type Notice = {
  id: number;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read_at: string | null;
  created_at: string;
};
@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './notifications-page.html',
  styleUrl: './notifications-page.css',
})
export class NotificationsPage {
  private readonly api = inject(Api);
  private readonly state = inject(NotificationState);
  readonly items = signal<Notice[]>([]);
  readonly busy = signal(true);
  readonly message = signal('');
  readonly unread = this.state.unread;
  constructor() {
    this.load();
  }
  load() {
    this.busy.set(true);
    this.api.get<{ data: { data: Notice[] }; unread: number }>('/notifications').subscribe({
      next: (r) => {
        this.items.set(r.data?.data ?? []);
        this.state.unread.set(r.unread ?? 0);
        this.busy.set(false);
      },
      error: () => {
        this.message.set('No se pudieron cargar tus avisos.');
        this.busy.set(false);
      },
    });
  }
  markRead(item: Notice) {
    if (item.read_at) return;
    this.api.patch<{ unread: number }>(`/notifications/${item.id}/read`, {}).subscribe({
      next: (r) => {
        this.items.update((rows) =>
          rows.map((row) =>
            row.id === item.id ? { ...row, read_at: new Date().toISOString() } : row,
          ),
        );
        this.state.unread.set(r.unread);
      },
    });
  }
  readAll() {
    this.api.patch('/notifications/read-all', {}).subscribe({
      next: () => {
        const now = new Date().toISOString();
        this.items.update((rows) => rows.map((row) => ({ ...row, read_at: row.read_at ?? now })));
        this.state.unread.set(0);
      },
    });
  }
  icon(type: string) {
    return (
      (
        {
          bienvenida: '✳',
          informe: '⚑',
          aviso: '✦',
          obra: '▧',
          evento: '⌁',
          mensaje: '✉',
          pedido: '↗',
        } as Record<string, string>
      )[type] ?? '•'
    );
  }
}
