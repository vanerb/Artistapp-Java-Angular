import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Api } from '../core/api';
import { AuthService } from '../core/auth.service';
import { assetUrl } from '../core/asset-url';
import { PublicationDetailModal } from '../shared/publication-detail-modal';
import { EventDetailModal } from '../shared/event-detail-modal';

type Feed = {
  id: number;
  titulo?: string;
  nombre?: string;
  descripcion?: string;
  biografia?: string;
  imagen?: string;
  image_url?: string;
  artist_name?: string;
  usuario?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  ubicacion?: string;
  megusta?: number;
  liked_by_me?: boolean | number | string;
  followed_by_me?: boolean | number | string;
  id_tipo?: number;
  participation_status?: string;
};
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PublicationDetailModal, EventDetailModal],
  templateUrl: './discover-page.html',
  styleUrl: './discover-page.css',
})
export class DiscoverPage {
  private readonly api = inject(Api);
  readonly auth = inject(AuthService);
  readonly tab = signal<'obras' | 'artistas' | 'eventos'>('obras');
  readonly search = signal('');
  readonly items = signal<Feed[]>([]);
  readonly busy = signal(false);
  readonly followingIds = signal<number[]>([]);
  readonly likeBusyIds = signal<number[]>([]);
  readonly likedOverrides = signal<Record<number, boolean>>({});
  readonly message = signal('');
  readonly selectedPublication = signal<Feed | null>(null);
  readonly selectedEvent = signal<Feed | null>(null);
  readonly reportTarget = signal<Feed | null>(null);
  readonly reportBusy = signal(false);
  reportText = '';
  readonly counts = signal({ obras: 0, artistas: 0, eventos: 0 });
  readonly categories = signal<{ id: number; nombre: string }[]>([]);
  category = 0;
  fromDate = '';
  toDate = '';
  private page = 1;
  private requestVersion = 0;
  readonly pageNumber = signal(1);
  readonly totalPages = signal(1);
  readonly hasMore = signal(false);
  constructor() {
    this.load();
    this.loadCounts();
    this.api
      .get<{ id: number; nombre: string }[]>('/categories')
      .subscribe({ next: (items) => this.categories.set(items) });
  }
  private loadCounts() {
    for (const [key, path] of [
      ['obras', '/publications'],
      ['artistas', '/users'],
      ['eventos', '/events'],
    ] as const)
      this.api
        .get<{ total?: number; data?: Feed[] }>(path, { page: 1 })
        .subscribe({
          next: (r) => this.counts.update((c) => ({ ...c, [key]: r.total ?? r.data?.length ?? 0 })),
        });
  }
  select(tab: 'obras' | 'artistas' | 'eventos') {
    this.tab.set(tab);
    this.search.set('');
    this.category = 0;
    this.fromDate = '';
    this.toDate = '';
    this.load();
  }
  load() {
    this.page = 1;
    this.pageNumber.set(1);
    this.fetchPage(true);
  }
  openPublication(item: Feed) {
    this.selectedPublication.set(item);
  }
  openEvent(item: Feed) {
    this.selectedEvent.set(item);
  }
  goToPage(page: number) {
    if (this.busy() || page < 1 || page > this.totalPages()) return;
    this.page = page;
    this.pageNumber.set(page);
    this.fetchPage(true);
  }
  loadMore() {
    this.goToPage(this.pageNumber() + 1);
  }
  private fetchPage(reset: boolean) {
    const activeTab = this.tab(),
      version = ++this.requestVersion;
    this.busy.set(true);
    this.message.set('');
    const endpoint = { obras: '/publications', artistas: '/users', eventos: '/events' }[activeTab];
    const params: Record<string, string | number> = { page: this.page };
    const query = this.search().trim();
    if (query) params['q'] = query;
    if (activeTab === 'obras' && this.category) params['categoria'] = this.category;
    if (activeTab === 'eventos' && this.fromDate) params['desde'] = this.fromDate;
    if (activeTab === 'eventos' && this.toDate) params['hasta'] = this.toDate;
    this.api
      .get<{ data: Feed[]; total?: number; current_page: number; last_page: number }>(
        endpoint,
        params,
      )
      .subscribe({
        next: (result) => {
          if (version !== this.requestVersion) return;
          const entries = (result.data ?? []).map((entry) => ({
            ...entry,
            liked_by_me: Boolean(Number(entry.liked_by_me)),
            followed_by_me: Boolean(Number(entry.followed_by_me)),
          }));
          this.items.set(entries);
          this.likedOverrides.update((overrides) => {
            const next = { ...overrides };
            for (const entry of entries)
              if (activeTab === 'obras') next[entry.id] = Boolean(entry.liked_by_me);
            return next;
          });
          this.page = result.current_page ?? this.page;
          this.pageNumber.set(this.page);
          this.totalPages.set(result.last_page ?? 1);
          this.counts.update((counts) => ({
            ...counts,
            [activeTab]: result.total ?? entries.length,
          }));
          this.hasMore.set(this.page < this.totalPages());
          this.busy.set(false);
        },
        error: (error) => {
          if (version !== this.requestVersion) return;
          this.busy.set(false);
          this.message.set(error.error?.message ?? 'No se han podido cargar los contenidos.');
        },
      });
  }
  paginationItems(): Array<number | '…'> {
    const total = this.totalPages(),
      current = this.pageNumber();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: Array<number | '…'> = [1];
    const start = Math.max(2, current - 1),
      end = Math.min(total - 1, current + 1);
    if (start > 2) pages.push('…');
    for (let value = start; value <= end; value++) pages.push(value);
    if (end < total - 1) pages.push('…');
    pages.push(total);
    return pages;
  }
  image(path?: string) {
    return assetUrl(path, 'media/no-item.png');
  }
  imageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (!img.src.endsWith('media/no-item.png')) img.src = 'media/no-item.png';
  }
  role(type?: number) {
    return type === 5 ? 'ARTISTA' : type === 3 ? 'ORGANIZACIÓN' : 'COMUNIDAD';
  }
  canFollow(item: Feed) {
    return (
      this.auth.isAuthenticated() &&
      Number(this.auth.user()?.id) !== Number(item.id) &&
      !item.followed_by_me
    );
  }
  canToggleFollow(item: Feed) {
    return this.auth.isAuthenticated() && Number(this.auth.user()?.id) !== Number(item.id);
  }
  canMessage(item: Feed) {
    return (
      this.auth.isAuthenticated() &&
      this.canToggleFollow(item) &&
      (Number(item.id_tipo) === 5 || Number(this.auth.user()?.id_tipo) === 5)
    );
  }
  followBusy(item: Feed) {
    return this.followingIds().includes(Number(item.id));
  }
  isLiked(item: Feed) {
    return this.likedOverrides()[Number(item.id)] ?? Boolean(item.liked_by_me);
  }
  likeBusy(item: Feed) {
    return this.likeBusyIds().includes(Number(item.id));
  }
  canReport(item: Feed) {
    return this.auth.isAuthenticated() && Number(this.auth.user()?.id) !== Number(item.id);
  }
  like(item: Feed) {
    if (!this.auth.isAuthenticated() || this.likeBusy(item)) return;
    const id = Number(item.id),
      wasLiked = this.isLiked(item),
      nextLiked = !wasLiked,
      oldCount = Number(item.megusta) || 0;
    const update = (liked: boolean, count: number) => {
      this.likedOverrides.update((overrides) => ({ ...overrides, [id]: liked }));
      this.items.update((items) =>
        items.map((entry) =>
          Number(entry.id) === id ? { ...entry, liked_by_me: liked, megusta: count } : entry,
        ),
      );
      this.selectedPublication.update((selected) =>
        selected && Number(selected.id) === id
          ? { ...selected, liked_by_me: liked, megusta: count }
          : selected,
      );
    };
    this.likeBusyIds.update((ids) => [...ids, id]);
    update(nextLiked, Math.max(0, oldCount + (wasLiked ? -1 : 1)));
    this.api.post<{ liked: boolean; count: number }>(`/publications/${id}/like`, {}).subscribe({
      next: (r) => {
        update(nextLiked, Number(r.count));
        this.likeBusyIds.update((ids) => ids.filter((entry) => entry !== id));
      },
      error: () => {
        update(wasLiked, oldCount);
        this.likeBusyIds.update((ids) => ids.filter((entry) => entry !== id));
        this.message.set('No se pudo actualizar el me gusta.');
      },
    });
  }
  pin(item: Feed) {
    if (!this.canToggleFollow(item) || this.followBusy(item)) return;
    const id = Number(item.id);
    this.followingIds.update((ids) => [...ids, id]);
    this.api.post<{ pinned: boolean }>(`/users/${id}/favorite`, {}).subscribe({
      next: (r) => {
        this.items.update((items) =>
          items.map((entry) =>
            Number(entry.id) === id ? { ...entry, followed_by_me: r.pinned } : entry,
          ),
        );
        this.followingIds.update((ids) => ids.filter((entry) => entry !== id));
      },
      error: (e) => {
        this.followingIds.update((ids) => ids.filter((entry) => entry !== id));
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
  join(item: Feed) {
    this.api.post<{ estado: string }>(`/events/${item.id}/participants`, {}).subscribe({
      next: (r) => {
        this.items.update((list) =>
          list.map((event) =>
            event.id === item.id
              ? { ...event, participation_status: r.estado ?? 'pendiente' }
              : event,
          ),
        );
        this.message.set('Solicitud enviada al organizador.');
      },
      error: (e) => this.message.set(e.error?.message ?? 'No se ha podido enviar la solicitud.'),
    });
  }
  report(item: Feed) {
    if (!this.canReport(item)) return;
    this.reportText = '';
    this.reportTarget.set(item);
  }
  submitReport() {
    const target = this.reportTarget(),
      informe = this.reportText.trim();
    if (!target || !informe || this.reportBusy()) return;
    this.reportBusy.set(true);
    this.api.post('/reports', { id_usuarioreferenciado: target.id, informe }).subscribe({
      next: () => {
        this.reportBusy.set(false);
        this.reportTarget.set(null);
        this.message.set('Gracias. El informe se ha enviado al equipo.');
      },
      error: (e) => {
        this.reportBusy.set(false);
        this.reportTarget.set(null);
        this.message.set(e.error?.message ?? 'No se pudo enviar el informe.');
      },
    });
  }
}
