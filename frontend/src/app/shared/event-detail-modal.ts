import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Api } from '../core/api';
import { AuthService } from '../core/auth.service';
import { assetUrl } from '../core/asset-url';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-event-detail-modal',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './event-detail-modal.html',
  styleUrl: './event-detail-modal.css',
})
export class EventDetailModal {
  @Input() event: any | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() join = new EventEmitter<any>();
  readonly auth = inject(AuthService);
  canChat() {
    return (
      !!this.event &&
      this.auth.isAuthenticated() &&
      (Number(this.auth.user()?.id) === Number(this.event.id_usuario) ||
        this.event.participation_status === 'aceptado')
    );
  }
  participationLabel(status: string) {
    return status === 'aceptado'
      ? 'Participación confirmada ✓'
      : status === 'rechazado'
        ? 'Solicitud rechazada'
        : 'Solicitud enviada · Pendiente';
  }
  image(path?: string) {
    return assetUrl(path, 'media/no-item.png');
  }
  imageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (!img.src.endsWith('media/no-item.png')) img.src = 'media/no-item.png';
  }
}
