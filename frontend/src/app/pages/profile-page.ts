import { Component, computed, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Api } from '../core/api';
import { AuthService } from '../core/auth.service';
import { assetUrl } from '../core/asset-url';
import { PublicationDetailModal } from '../shared/publication-detail-modal';
import { ConfirmModal } from '../shared/confirm-modal';
type Artwork = {
  id: number;
  titulo: string;
  descripcion: string;
  imagen: string;
  megusta: number;
  artist_name?: string;
};
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PublicationDetailModal, ConfirmModal],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage {
  readonly confirmation = signal<{ title: string; message: string; confirmLabel: string } | null>(
    null,
  );
  private pendingConfirmation: (() => void) | null = null;
  private readonly api = inject(Api);
  private readonly route = inject(ActivatedRoute);
  readonly auth = inject(AuthService);
  readonly modal = signal<
    'profile' | 'publication' | 'product' | 'event' | 'notice' | 'password' | null
  >(null);
  readonly communityModal = signal<'seguidos' | 'seguidores' | null>(null);
  readonly selectedPublication = signal<Artwork | null>(null);
  readonly section = signal<'obras' | 'avisos' | 'eventos' | 'favoritos' | 'tienda'>('obras');
  readonly user = signal<any>(null);
  readonly posts = signal<Artwork[]>([]);
  readonly products = signal<any[]>([]);
  readonly ownEvents = signal<any[]>([]);
  readonly attendingEvents = signal<any[]>([]);
  readonly favorites = signal<any[]>([]);
  readonly followers = signal<any[]>([]);
  readonly favoriteWorks = signal<Artwork[]>([]);
  readonly likeBusyIds = signal<number[]>([]);
  readonly notices = signal<any[]>([]);
  readonly categories = signal<{ id: number; nombre: string }[]>([]);
  readonly busy = signal(false);
  readonly message = signal('');
  private readonly failedMessage = signal('');
  readonly messageFailed = computed(() => !!this.message() && this.message() === this.failedMessage());
  readonly profilePreview = signal<string | null>(null);
  readonly publicationPreview = signal<string | null>(null);
  readonly productPreview = signal<string | null>(null);
  readonly eventPreview = signal<string | null>(null);
  readonly editingEvent = signal<any | null>(null);
  readonly editingNotice = signal<any | null>(null);
  readonly editingPost = signal<Artwork | null>(null);
  readonly editingProduct = signal<any | null>(null);
  readonly participantEvent = signal<any | null>(null);
  readonly participants = signal<any[]>([]);
  profileImage: File | null = null;
  file: File | null = null;
  productImage: File | null = null;
  digitalFile: File | null = null;
  eventImage: File | null = null;
  form = { nombre: '', apellidos: '', usuario: '', correo: '', biografia: '' };
  notice = { titulo: '', aviso: '' };
  passwordForm = { password_actual: '', password: '', password_confirmation: '' };
  draft = { titulo: '', descripcion: '', id_categoria: 0 };
  product = { nombre: '', descripcion: '', precio: 1, cantidad: 1, id_tipo: 1 };
  event = { nombre: '', ubicacion: '', link: '', fecha_inicio: '', fecha_fin: '' };
  private showError(text: string) {
    this.failedMessage.set(text);
    this.message.set(text);
  }
  constructor() {
    const section = this.route.snapshot.queryParamMap.get('section');
    const allowedSections = ['obras', 'avisos', 'eventos', 'favoritos', 'tienda'];
    if (section && allowedSections.includes(section)) {
      this.section.set(section as 'obras' | 'avisos' | 'eventos' | 'favoritos' | 'tienda');
    }
    this.load();
    this.api
      .get<{ id: number; nombre: string }[]>('/categories')
      .subscribe({ next: (c) => this.categories.set(c) });
  }
  participationLabel(status: string) {
    return status === 'aceptado'
      ? 'Participación confirmada'
      : status === 'rechazado'
        ? 'Solicitud rechazada'
        : 'Solicitud pendiente';
  }
  load() {
    this.busy.set(true);
    this.api.get<any>('/account').subscribe({
      next: (u) => {
        u.id_tipo = Number(u.id_tipo);
        this.user.set(u);
        this.posts.set(u.publicaciones ?? []);
        this.notices.set(u.avisos ?? []);
        this.products.set(u.productos ?? []);
        this.ownEvents.set(u.id_tipo === 3 ? (u.eventos_propios ?? []) : []);
        this.attendingEvents.set(
          (u.eventos ?? []).filter(
            (item: any) =>
              item.participacion !== 'rechazado' &&
              item.fecha_fin >= new Date().toISOString().slice(0, 10),
          ),
        );
        this.favorites.set(u.favoritos ?? []);
        this.followers.set(u.seguidores ?? []);
        this.favoriteWorks.set(u.obras_favoritas ?? []);
        this.form = {
          nombre: u.nombre,
          apellidos: u.apellidos,
          usuario: u.usuario,
          correo: u.correo,
          biografia: u.biografia ?? '',
        };
        this.busy.set(false);
      },
      error: () => {
        this.busy.set(false);
        this.showError('No se pudo cargar tu perfil. Comprueba tu conexión y vuelve a intentarlo.');
      },
    });
  }
  likeBusy(item: Artwork) {
    return this.likeBusyIds().includes(Number(item.id));
  }
  unlike(item: Artwork) {
    const id = Number(item.id);
    if (this.likeBusy(item)) return;
    this.likeBusyIds.update((ids) => [...ids, id]);
    this.api.post<{ liked: boolean; count: number }>(`/publications/${id}/like`, {}).subscribe({
      next: (r) => {
        this.favoriteWorks.update((items) =>
          r.liked
            ? items.map((row) => (row.id === id ? { ...row, megusta: r.count } : row))
            : items.filter((row) => row.id !== id),
        );
        this.likeBusyIds.update((ids) => ids.filter((entry) => entry !== id));
      },
      error: (e) => {
        this.likeBusyIds.update((ids) => ids.filter((entry) => entry !== id));
        this.showError(e.error?.message ?? 'No se pudo quitar el me gusta.');
      },
    });
  }
  canPublishWorks() {
    return [1, 3, 5].includes(Number(this.user()?.id_tipo));
  }
  canManageProducts() {
    return [1, 3, 5].includes(Number(this.user()?.id_tipo));
  }
  canManageNotices() {
    return Number(this.user()?.id_tipo) === 1;
  }
  openCommunity(view: 'seguidos' | 'seguidores') {
    this.communityModal.set(view);
  }
  openModal(kind: 'profile' | 'publication' | 'product' | 'event' | 'notice' | 'password') {
    if (
      (kind === 'publication' && !this.canPublishWorks()) ||
      (kind === 'product' && !this.canManageProducts()) ||
      (kind === 'event' && ![1, 3].includes(Number(this.user()?.id_tipo))) ||
      (kind === 'notice' && !this.canManageNotices())
    )
      return;
    this.message.set('');
    if (kind === 'publication') {
      this.editingPost.set(null);
      this.draft = { titulo: '', descripcion: '', id_categoria: 0 };
      this.file = null;
      this.setPreview(this.publicationPreview, null);
    }
    if (kind === 'product') {
      this.editingProduct.set(null);
      this.product = { nombre: '', descripcion: '', precio: 1, cantidad: 1, id_tipo: 1 };
      this.productImage = this.digitalFile = null;
      this.setPreview(this.productPreview, null);
    }
    if (kind === 'event') {
      this.editingEvent.set(null);
      this.event = { nombre: '', ubicacion: '', link: '', fecha_inicio: '', fecha_fin: '' };
      this.eventImage = null;
      this.setPreview(this.eventPreview, null);
    }
    if (kind === 'notice') {
      this.editingNotice.set(null);
      this.notice = { titulo: '', aviso: '' };
    }
    this.modal.set(kind);
  }
  closeModal() {
    this.modal.set(null);
    this.message.set('');
    this.profileImage = this.file = this.productImage = this.eventImage = null;
    this.digitalFile = null;
    this.setPreview(this.profilePreview, null);
    this.setPreview(this.publicationPreview, null);
    this.setPreview(this.productPreview, null);
    if (!this.editingEvent()) this.setPreview(this.eventPreview, null);
  }
  modalTitle() {
    return (
      {
        profile: 'Editar perfil',
        publication: this.editingPost() ? 'Editar obra' : 'Publicar una obra',
        product: this.editingProduct() ? 'Editar pieza' : 'Añadir una pieza',
        event: this.editingEvent() ? 'Editar evento' : 'Crear un evento',
        notice: this.editingNotice() ? 'Editar aviso' : 'Publicar un aviso',
        password: 'Cambiar contraseña',
      } as const
    )[this.modal() ?? 'profile'];
  }
  modalEyebrow() {
    return (
      {
        profile: 'TU CUENTA',
        publication: 'NUEVA OBRA',
        product: 'TU TIENDA',
        event: 'ENCUENTROS Y FERIAS',
        notice: 'TU COMUNIDAD',
        password: 'SEGURIDAD',
      } as const
    )[this.modal() ?? 'profile'];
  }
  modalDescription() {
    return (
      {
        profile: 'Actualiza la información de tu espacio creativo.',
        publication: 'Comparte una nueva pieza de tu proceso.',
        product: 'Añade una pieza original a tu escaparate.',
        event: 'Reúne a artistas y visitantes.',
        notice: 'Comparte una novedad con quienes siguen tu trabajo.',
        password: 'Usa tu contraseña actual para definir una nueva.',
      } as const
    )[this.modal() ?? 'profile'];
  }
  save() {
    this.busy.set(true);
    let body: any = this.form;
    if (this.profileImage) {
      const data = new FormData();
      Object.entries(this.form).forEach(([key, value]) => data.append(key, value));
      data.append('imagen', this.profileImage);
      data.append('_method', 'PATCH');
      body = data;
    }
    const request =
      body instanceof FormData
        ? this.api.post<{ user: any }>('/account', body)
        : this.api.patch<{ user: any }>('/account', body);
    request.subscribe({
      next: (r) => {
        this.user.update((user) => ({ ...user, ...r.user }));
        this.auth.updateUser(r.user);
        this.busy.set(false);
        this.closeModal();
        this.message.set('Perfil actualizado.');
      },
      error: (e) => {
        this.busy.set(false);
        this.showError(e.error?.message ?? 'No se pudo guardar el perfil.');
      },
    });
  }
  changePassword() {
    this.busy.set(true);
    this.api.patch('/account', this.passwordForm).subscribe({
      next: () => {
        this.busy.set(false);
        this.passwordForm = { password_actual: '', password: '', password_confirmation: '' };
        this.closeModal();
        this.message.set('Contraseña actualizada.');
      },
      error: (e) => {
        this.busy.set(false);
        this.showError(e.error?.message ?? 'No se pudo cambiar la contraseña.');
      },
    });
  }
  editNotice(item: any) {
    this.editingNotice.set(item);
    this.notice = { titulo: item.titulo, aviso: item.aviso };
    this.modal.set('notice');
  }
  saveNotice() {
    this.busy.set(true);
    const item = this.editingNotice();
    let body: any = this.notice;
    let path = '/notices';
    if (item) {
      path += `/${item.id}`;
      body = new FormData();
      body.append('titulo', this.notice.titulo);
      body.append('aviso', this.notice.aviso);
      body.append('_method', 'PATCH');
    }
    const request = item ? this.api.post(path, body) : this.api.post(path, body);
    request.subscribe({
      next: () => {
        this.busy.set(false);
        this.closeModal();
        this.editingNotice.set(null);
        this.message.set(item ? 'Aviso actualizado.' : 'Aviso publicado.');
        this.load();
      },
      error: (e) => {
        this.busy.set(false);
        this.showError(e.error?.message ?? 'No se pudo guardar el aviso.');
      },
    });
  }
  removeNotice(item: any) {
    this.askConfirmation('Eliminar aviso', `¿Quieres eliminar «${item.titulo}»?`, 'Eliminar', () =>
      this.api
        .delete(`/notices/${item.id}`)
        .subscribe({
          next: () => this.notices.update((items) => items.filter((entry) => entry.id !== item.id)),
          error: (e) => this.showError(e.error?.message ?? 'No se pudo eliminar el aviso.'),
        }),
    );
  }
  private askConfirmation(
    title: string,
    message: string,
    confirmLabel: string,
    action: () => void,
  ) {
    this.pendingConfirmation = action;
    this.confirmation.set({ title, message, confirmLabel });
  }
  dismissConfirmation() {
    this.confirmation.set(null);
    this.pendingConfirmation = null;
  }
  confirmAction() {
    const action = this.pendingConfirmation;
    this.dismissConfirmation();
    action?.();
  }
  private setPreview(target: WritableSignal<string | null>, next: string | null) {
    const previous = target();
    if (previous?.startsWith('blob:')) URL.revokeObjectURL(previous);
    target.set(next);
  }
  private preview(target: WritableSignal<string | null>, file: File | null) {
    this.setPreview(target, file ? URL.createObjectURL(file) : null);
  }
  chooseProfileImage(event: Event) {
    this.profileImage = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.preview(this.profilePreview, this.profileImage);
  }
  chooseImage(event: Event) {
    this.file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.preview(this.publicationPreview, this.file);
  }
  chooseProductImage(event: Event) {
    this.productImage = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.preview(this.productPreview, this.productImage);
  }
  chooseDigitalFile(event: Event) {
    this.digitalFile = (event.target as HTMLInputElement).files?.[0] ?? null;
  }
  chooseEventImage(event: Event) {
    this.eventImage = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.preview(this.eventPreview, this.eventImage);
  }
  editPublication(item: Artwork) {
    this.editingPost.set(item);
    this.draft = {
      titulo: item.titulo,
      descripcion: item.descripcion,
      id_categoria: Number((item as any).id_categoria),
    };
    this.file = null;
    this.setPreview(this.publicationPreview, this.image(item.imagen));
    this.modal.set('publication');
  }
  publish() {
    if (!this.canPublishWorks()) return;
    const editing = this.editingPost();
    if (!this.file && !editing) {
      this.showError('Añade una imagen para publicar.');
      return;
    }
    this.busy.set(true);
    this.message.set('');
    let request: any;
    if (editing && !this.file) {
      request = this.api.patch(`/publications/${editing.id}`, this.draft);
    } else {
      const data = new FormData();
      data.append('titulo', this.draft.titulo);
      data.append('descripcion', this.draft.descripcion);
      data.append('id_categoria', String(this.draft.id_categoria));
      if (this.file) data.append('imagen', this.file);
      if (editing) data.append('_method', 'PATCH');
      request = editing
        ? this.api.post(`/publications/${editing.id}`, data)
        : this.api.post('/publications', data);
    }
    request.subscribe({
      next: () => {
        this.busy.set(false);
        this.draft = { titulo: '', descripcion: '', id_categoria: 0 };
        this.file = null;
        this.closeModal();
        this.message.set(editing ? 'Obra actualizada.' : 'Tu obra ya está en la comunidad.');
        this.editingPost.set(null);
        this.load();
      },
      error: (e: any) => {
        this.busy.set(false);
        this.showError(e.error?.message ?? 'No se pudo guardar la obra.');
      },
    });
  }
  editProduct(item: any) {
    this.editingProduct.set(item);
    this.product = {
      nombre: item.nombre,
      descripcion: item.descripcion,
      precio: Number(item.precio),
      cantidad: Number(item.cantidad),
      id_tipo: Number(item.id_tipo),
    };
    this.productImage = this.digitalFile = null;
    this.setPreview(this.productPreview, this.image(item.imagen));
    this.modal.set('product');
  }
  createProduct() {
    if (!this.canManageProducts()) return;
    const editing = this.editingProduct();
    if (
      (!editing && !this.productImage) ||
      (this.product.id_tipo === 2 && !editing && !this.digitalFile)
    ) {
      this.showError('Añade las imágenes y el archivo digital que correspondan.');
      return;
    }
    this.busy.set(true);
    this.message.set('');
    const data = new FormData();
    for (const [key, value] of Object.entries(this.product)) data.append(key, String(value));
    if (this.productImage) data.append('imagen', this.productImage);
    if (this.digitalFile) data.append('archivo_digital', this.digitalFile);
    if (editing) data.append('_method', 'PATCH');
    const request = editing
      ? this.api.post(`/products/${editing.id}`, data)
      : this.api.post('/products', data);
    request.subscribe({
      next: () => {
        this.busy.set(false);
        this.closeModal();
        this.message.set(editing ? 'Pieza actualizada.' : 'La pieza ya está en tu tienda.');
        this.product = { nombre: '', descripcion: '', precio: 1, cantidad: 1, id_tipo: 1 };
        this.productImage = null;
        this.digitalFile = null;
        this.editingProduct.set(null);
        this.load();
      },
      error: (e) => {
        this.busy.set(false);
        this.showError(e.error?.message ?? 'No se pudo guardar la pieza.');
      },
    });
  }
  removeProduct(item: any) {
    this.askConfirmation('Eliminar pieza', `¿Quieres eliminar «${item.nombre}»?`, 'Eliminar', () =>
      this.api
        .delete(`/products/${item.id}`)
        .subscribe({
          next: () => this.products.update((list) => list.filter((row) => row.id !== item.id)),
          error: (e) => this.showError(e.error?.message ?? 'No se pudo eliminar la pieza.'),
        }),
    );
  }
  editEvent(item: any) {
    if (Number(this.user()?.id_tipo) !== 3) return;
    this.editingEvent.set(item);
    this.event = {
      nombre: item.nombre,
      ubicacion: item.ubicacion,
      link: item.link ?? '',
      fecha_inicio: String(item.fecha_inicio).slice(0, 10),
      fecha_fin: String(item.fecha_fin).slice(0, 10),
    };
    this.eventImage = null;
    this.setPreview(this.eventPreview, item.imagen ? this.image(item.imagen) : null);
    this.message.set('');
    this.modal.set('event');
  }
  removeEvent(item: any) {
    this.askConfirmation(
      'Eliminar evento',
      `¿Quieres eliminar «${item.nombre}» y sus solicitudes?`,
      'Eliminar evento',
      () =>
        this.api
          .delete(`/events/${item.id}`)
          .subscribe({
            next: () => this.ownEvents.update((list) => list.filter((row) => row.id !== item.id)),
            error: (e) => this.showError(e.error?.message ?? 'No se pudo eliminar el evento.'),
          }),
    );
  }
  leaveEvent(item: any) {
    this.askConfirmation(
      'Salir del evento',
      `¿Quieres salir de «${item.nombre}»?`,
      'Salir del evento',
      () =>
        this.api
          .delete(`/events/${item.id}/participants/me`)
          .subscribe({
            next: () =>
              this.attendingEvents.update((list) => list.filter((row) => row.id !== item.id)),
            error: (e) => this.showError(e.error?.message ?? 'No se pudo salir del evento.'),
          }),
    );
  }
  loadParticipants(item: any) {
    this.participantEvent.set(item);
    this.api
      .get<any[]>(`/events/${item.id}/participants`)
      .subscribe({
        next: (list) => this.participants.set(list),
        error: (e) =>
          this.showError(e.error?.message ?? 'No se pudieron cargar las solicitudes.'),
      });
  }
  decideParticipant(person: any, state: 'aceptado' | 'rechazado') {
    const event = this.participantEvent();
    if (!event) return;
    this.api
      .patch(`/events/${event.id}/participants/${person.id}`, { estado: state })
      .subscribe({
        next: () =>
          this.participants.update((list) =>
            list.map((item) => (item.id === person.id ? { ...item, estado: state } : item)),
          ),
        error: (e) => this.showError(e.error?.message ?? 'No se pudo actualizar la solicitud.'),
      });
  }
  createEvent() {
    if (Number(this.user()?.id_tipo) !== 3) return;
    this.busy.set(true);
    this.message.set('');
    const data = new FormData();
    for (const [key, value] of Object.entries(this.event)) data.append(key, String(value));
    if (this.eventImage) data.append('imagen', this.eventImage);
    const editing = this.editingEvent();
    if (editing) data.append('_method', 'PATCH');
    const request = editing
      ? this.api.post(`/events/${editing.id}`, data)
      : this.api.post('/events', data);
    request.subscribe({
      next: () => {
        this.busy.set(false);
        this.closeModal();
        this.editingEvent.set(null);
        this.setPreview(this.eventPreview, null);
        this.message.set(editing ? 'Evento actualizado.' : 'El evento ya está publicado.');
        this.event = { nombre: '', ubicacion: '', link: '', fecha_inicio: '', fecha_fin: '' };
        this.eventImage = null;
        this.load();
      },
      error: (e) => {
        this.busy.set(false);
        this.showError(e.error?.message ?? 'No se pudo guardar el evento.');
      },
    });
  }
  remove(post: Artwork) {
    this.askConfirmation(
      'Eliminar obra',
      `¿Quieres eliminar «${post.titulo}»?`,
      'Eliminar obra',
      () =>
        this.api
          .delete(`/publications/${post.id}`)
          .subscribe({
            next: () => this.posts.update((posts) => posts.filter((item) => item.id !== post.id)),
            error: () => this.showError('No se pudo eliminar la obra.'),
          }),
    );
  }
  image(path?: string) {
    return assetUrl(path);
  }
  imageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (!img.src.endsWith('media/no-user.png')) img.src = 'media/no-user.png';
  }
}
