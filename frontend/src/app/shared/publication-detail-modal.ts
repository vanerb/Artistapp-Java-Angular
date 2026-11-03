import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Api } from '../core/api';
import { AuthService } from '../core/auth.service';
import { assetUrl } from '../core/asset-url';

type Comment = {
  id: number;
  user_id: number;
  body: string;
  created_at: string;
  usuario: string;
  imagen: string;
};
@Component({
  selector: 'app-publication-detail-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './publication-detail-modal.html',
  styleUrl: './publication-detail-modal.css',
})
export class PublicationDetailModal implements OnChanges {
  @Input() publication: any | null = null;
  @Output() close = new EventEmitter<void>();
  private readonly api = inject(Api);
  readonly auth = inject(AuthService);
  readonly comments = signal<Comment[]>([]);
  readonly error = signal('');
  readonly sending = signal(false);
  draft = '';
  ngOnChanges(changes: SimpleChanges) {
    if (changes['publication'] && this.publication) this.load();
  }
  load() {
    this.api.get<Comment[]>(`/publications/${this.publication.id}/comments`).subscribe({
      next: (r) => {
        this.comments.set(r ?? []);
        this.error.set('');
      },
      error: (e) => this.error.set(e.error?.message ?? 'No se pudieron cargar los comentarios.'),
    });
  }
  send() {
    const body = this.draft.trim();
    if (!body || this.sending()) return;
    this.sending.set(true);
    this.api.post<Comment>(`/publications/${this.publication.id}/comments`, { body }).subscribe({
      next: (r) => {
        this.comments.update((rows) => [...rows, r]);
        this.draft = '';
        this.sending.set(false);
      },
      error: (e) => {
        this.sending.set(false);
        this.error.set(e.error?.message ?? 'No se pudo publicar el comentario.');
      },
    });
  }
  canDelete(item: Comment) {
    return Number(this.auth.user()?.id) === item.user_id || this.auth.isAdmin();
  }
  remove(item: Comment) {
    this.api
      .delete(`/publications/${this.publication.id}/comments/${item.id}`)
      .subscribe({
        next: () => this.comments.update((rows) => rows.filter((row) => row.id !== item.id)),
        error: (e) => this.error.set(e.error?.message ?? 'No se pudo eliminar el comentario.'),
      });
  }
  image(path?: string, fallback = 'media/no-item.png') {
    return assetUrl(path, fallback);
  }
  imageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (!img.src.endsWith('media/no-item.png')) img.src = 'media/no-item.png';
  }
}
