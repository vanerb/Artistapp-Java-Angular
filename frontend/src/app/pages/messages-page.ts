import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Api } from '../core/api';
import { assetUrl } from '../core/asset-url';

type Conversation = {
  id: number;
  name: string;
  image?: string | null;
  last_message?: string | null;
  updated_at?: string | null;
};
@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './messages-page.html',
  styleUrl: './messages-page.css',
})
export class MessagesPage {
  private readonly api = inject(Api);
  readonly direct = signal<Conversation[]>([]);
  readonly events = signal<Conversation[]>([]);
  readonly error = signal('');
  constructor() {
    this.api.get<{ direct: Conversation[]; events: Conversation[] }>('/conversations').subscribe({
      next: (r) => {
        this.direct.set(r.direct ?? []);
        this.events.set(r.events ?? []);
      },
      error: (e) => this.error.set(e.error?.message ?? 'No se pudieron cargar tus conversaciones.'),
    });
  }
  image(path?: string | null, fallback = 'media/no-user.png') {
    return assetUrl(path || undefined, fallback);
  }
}
