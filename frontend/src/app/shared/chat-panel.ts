import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../core/api';
import { AuthService } from '../core/auth.service';
import { assetUrl } from '../core/asset-url';

type ChatMessage = {
  id: number;
  user_id?: number;
  sender_id?: number;
  body: string;
  created_at: string;
  usuario?: string;
  sender_name?: string;
  imagen?: string;
  sender_image?: string;
};
@Component({
  selector: 'app-chat-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-panel.html',
  styleUrl: './chat-panel.css',
})
export class ChatPanel implements OnChanges, OnDestroy {
  @Input() mode: 'event' | 'direct' = 'event';
  @Input() targetId = 0;
  @Input() currentUserId = 0;
  @Input() title = '';
  private readonly api = inject(Api);
  private readonly auth = inject(AuthService);
  readonly messages = signal<ChatMessage[]>([]);
  readonly error = signal('');
  readonly sending = signal(false);
  draft = '';
  private timer: any;
  ngOnChanges(changes: SimpleChanges) {
    if (changes['targetId'] || changes['mode']) {
      this.load();
      if (this.timer) clearInterval(this.timer);
      this.timer = setInterval(() => this.load(), 4500);
    }
  }
  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
  private path() {
    return this.mode === 'event'
      ? `/events/${this.targetId}/chat`
      : `/direct-messages/${this.targetId}`;
  }
  load() {
    if (!this.targetId) return;
    const path = this.path();
    this.api.get<ChatMessage[] | { messages: ChatMessage[] }>(path).subscribe({
      next: (r) => {
        this.messages.set(Array.isArray(r) ? r : (r.messages ?? []));
        this.error.set('');
      },
      error: (e) => this.error.set(e.error?.message ?? 'No se pudo acceder a esta conversación.'),
    });
  }
  send() {
    const body = this.draft.trim();
    if (!body || this.sending()) return;
    this.sending.set(true);
    this.api.post<ChatMessage>(this.path(), { body }).subscribe({
      next: (message) => {
        this.messages.update((rows) => [...rows, message]);
        this.draft = '';
        this.sending.set(false);
      },
      error: (e) => {
        this.error.set(e.error?.message ?? 'No se pudo enviar el mensaje.');
        this.sending.set(false);
      },
    });
  }
  isMine(message: ChatMessage) {
    return (
      Number(message.user_id ?? message.sender_id) ===
      Number(this.currentUserId || this.auth.user()?.id)
    );
  }
  image(path?: string) {
    return assetUrl(path, 'media/no-user.png');
  }
}
