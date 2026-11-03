import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Api } from '../core/api';
import { AuthService } from '../core/auth.service';
import { assetUrl } from '../core/asset-url';
import { PublicationDetailModal } from '../shared/publication-detail-modal';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, PublicationDetailModal],
  templateUrl: './artist-page.html',
  styleUrl: './artist-page.css',
})
export class ArtistPage {
  private readonly api = inject(Api);
  private readonly route = inject(ActivatedRoute);
  readonly auth = inject(AuthService);
  readonly user = signal<any>(null);
  readonly followed = signal(false);
  readonly busy = signal(false);
  readonly message = signal('');
  readonly selectedPublication = signal<any | null>(null);
  readonly pages = signal({ obras: 1, avisos: 1, eventos: 1 });
  readonly pagination = signal<any>({
    obras: { page: 1, last_page: 1 },
    avisos: { page: 1, last_page: 1 },
    eventos: { page: 1, last_page: 1 },
  });
  readonly communityTarget = signal<'seguidores' | 'seguidos' | null>(null);
  readonly communityUsers = signal<any[]>([]);
  readonly communityBusy = signal(false);
  readonly communityPage = signal(1);
  readonly communityLastPage = signal(1);
  private artistId = 0;
  private communityRequest = 0;
  constructor() {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (!id) return;
      this.artistId = id;
      this.pages.set({ obras: 1, avisos: 1, eventos: 1 });
      this.loadProfile();
    });
  }
  openCommunity(type: 'seguidores' | 'seguidos') {
    this.communityTarget.set(type);
    this.communityUsers.set([]);
    this.communityPage.set(1);
    this.communityLastPage.set(1);
    this.loadCommunity(1, false);
  }
  loadCommunity(page: number, append: boolean) {
    const type = this.communityTarget();
    if (!type) return;
    const version = ++this.communityRequest;
    this.communityBusy.set(true);
    this.api
      .get<{ data: any[]; current_page: number; last_page: number }>(
        `/users/${this.artistId}/community`,
        { tipo: type, page },
      )
      .subscribe({
        next: (r) => {
          if (version !== this.communityRequest) return;
          this.communityUsers.update((items) =>
            append ? [...items, ...(r.data ?? [])] : (r.data ?? []),
          );
          this.communityPage.set(r.current_page ?? page);
          this.communityLastPage.set(r.last_page ?? 1);
          this.communityBusy.set(false);
        },
        error: (e) => {
          if (version !== this.communityRequest) return;
          this.communityBusy.set(false);
          this.message.set(e.error?.message ?? 'No se pudo cargar la comunidad.');
        },
      });
  }
  loadMoreCommunity() {
    if (!this.communityBusy() && this.communityPage() < this.communityLastPage())
      this.loadCommunity(this.communityPage() + 1, true);
  }
  loadProfile() {
    this.busy.set(true);
    this.api
      .get<any>(`/users/${this.artistId}`, {
        obras_page: this.pages().obras,
        avisos_page: this.pages().avisos,
        eventos_page: this.pages().eventos,
      })
      .subscribe({
        next: (u) => {
          this.user.set(u);
          this.followed.set(!!u.fijado);
          this.pagination.set(u.pagination ?? this.pagination());
          this.busy.set(false);
        },
        error: (e) => {
          this.busy.set(false);
          this.message.set(e.error?.message ?? 'No se pudo abrir este perfil.');
        },
      });
  }
  changePage(section: 'obras' | 'avisos' | 'eventos', page: number) {
    const last = this.pagination()[section].last_page;
    if (page < 1 || page > last || this.busy()) return;
    this.pages.update((p) => ({ ...p, [section]: page }));
    this.loadProfile();
  }
  dismissMessage() {
    this.message.set('');
  }
  scrollTo(section: string) {
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  image(path?: string, fallback = 'media/no-user.png') {
    return assetUrl(path, fallback);
  }
  imageError(event: Event, fallback = 'media/no-user.png') {
    const img = event.target as HTMLImageElement;
    const src = `/${fallback}`;
    if (!img.src.endsWith(src)) img.src = src;
  }
  role(type: number) {
    return Number(type) === 5 ? 'ARTISTA' : Number(type) === 3 ? 'ORGANIZACIÓN' : 'COMUNIDAD';
  }
  canFollow(artist: any) {
    return (
      this.auth.isAuthenticated() &&
      Number(this.auth.user()?.id) !== Number(artist.id) &&
      !this.followed()
    );
  }
  canToggleFollow(artist: any) {
    return this.auth.isAuthenticated() && Number(this.auth.user()?.id) !== Number(artist.id);
  }
  canMessage(artist: any) {
    return (
      this.auth.isAuthenticated() &&
      Number(this.auth.user()?.id) !== Number(artist.id) &&
      (Number(artist.id_tipo) === 5 || Number(this.auth.user()?.id_tipo) === 5)
    );
  }
  follow() {
    const artist = this.user();
    if (!artist || this.busy() || !this.canToggleFollow(artist)) return;
    this.busy.set(true);
    this.api.post<{ pinned: boolean }>(`/users/${artist.id}/favorite`, {}).subscribe({
      next: (r) => {
        this.followed.set(r.pinned);
        this.busy.set(false);
      },
      error: (e) => {
        this.busy.set(false);
        this.message.set(e.error?.message ?? 'No se pudo actualizar el seguimiento.');
      },
    });
  }
  participationLabel(status: string) {
    return status === 'aceptado'
      ? 'Participación confirmada ✓'
      : status === 'rechazado'
        ? 'Solicitud rechazada'
        : 'Solicitud enviada · Pendiente';
  }
  join(event: any) {
    if (this.busy()) return;
    this.busy.set(true);
    this.api.post<{ estado: string }>(`/events/${event.id}/participants`, {}).subscribe({
      next: (r) => {
        const user = this.user();
        if (user)
          this.user.set({
            ...user,
            eventos: user.eventos.map((item: any) =>
              item.id === event.id
                ? { ...item, participation_status: r.estado ?? 'pendiente' }
                : item,
            ),
          });
        this.busy.set(false);
        this.message.set('Solicitud de participación enviada.');
      },
      error: (e) => {
        this.busy.set(false);
        this.message.set(e.error?.message ?? 'No se pudo solicitar la participación.');
      },
    });
  }
}
