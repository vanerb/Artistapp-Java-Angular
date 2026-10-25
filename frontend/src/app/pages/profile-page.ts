import { Component, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
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
  template: `
    <section class="profile wrap">
      <div class="profile-head">
        <img
          class="avatar"
          [src]="image(user()?.imagen)"
          (error)="imageError($event)"
          [alt]="user()?.usuario || 'Perfil'"
        />
        <div>
          <span class="kicker">TU ESPACIO CREATIVO</span>
          <h1>{{ user()?.usuario || 'Mi perfil' }}</h1>
          <p>
            {{ user()?.biografia || 'Dale forma a tu espacio y comparte lo que estás creando.' }}
          </p>
          <div class="profile-stats">
            <span
              ><strong>{{ posts().length }}</strong> publicaciones</span
            ><button type="button" (click)="openCommunity('seguidores')">
              <strong>{{ followers().length }}</strong> seguidores</button
            ><button type="button" (click)="openCommunity('seguidos')">
              <strong>{{ favorites().length }}</strong> seguidos
            </button>
          </div>
        </div>
        <button class="edit" (click)="openModal('profile')">Editar perfil</button>
      </div>
      @if (busy()) {
        <p class="profile-loading-inline" role="status">Guardando los cambios…</p>
      }
      @if (message()) {
        <div class="profile-alert-backdrop" (click)="message.set('')">
          <section
            class="profile-alert"
            role="alertdialog"
            aria-modal="true"
            (click)="$event.stopPropagation()"
          >
            <button class="modal-close" aria-label="Cerrar" (click)="message.set('')">×</button
            ><span class="kicker">{{
              message().toLowerCase().includes('no se pudo') ||
              message().toLowerCase().includes('no se han')
                ? 'NO SE PUDO COMPLETAR'
                : 'AVISO'
            }}</span>
            <h2>
              {{
                message().toLowerCase().includes('no se pudo') ||
                message().toLowerCase().includes('no se han')
                  ? 'Revisa este detalle'
                  : 'Hecho'
              }}
            </h2>
            <p>{{ message() }}</p>
            <button class="primary" (click)="message.set('')">Entendido</button>
          </section>
        </div>
      }
      @if (confirmation(); as dialog) {
        <app-confirm-modal
          [open]="true"
          [title]="dialog.title"
          [message]="dialog.message"
          [confirmLabel]="dialog.confirmLabel"
          tone="danger"
          (cancel)="dismissConfirmation()"
          (confirm)="confirmAction()"
        />
      }
      <div class="profile-tabs">
        <nav aria-label="Secciones del perfil">
          <button [class.selected]="section() === 'obras'" (click)="section.set('obras')">
            Mis obras <b>{{ posts().length }}</b>
          </button>
          @if (canManageNotices()) {
            <button [class.selected]="section() === 'avisos'" (click)="section.set('avisos')">
              Avisos <b>{{ notices().length }}</b>
            </button>
          }
          <button [class.selected]="section() === 'eventos'" (click)="section.set('eventos')">
            Eventos <b>{{ ownEvents().length + attendingEvents().length }}</b></button
          ><button [class.selected]="section() === 'favoritos'" (click)="section.set('favoritos')">
            Favoritos <b>{{ favoriteWorks().length }}</b>
          </button>
          @if (canManageProducts()) {
            <button [class.selected]="section() === 'tienda'" (click)="section.set('tienda')">
              Tienda <b>{{ products().length }}</b>
            </button>
          }
        </nav>
        <div>
          @if (section() === 'obras' && canPublishWorks()) {
            <button class="primary" (click)="openModal('publication')">Publicar obra</button>
          }
          @if (section() === 'avisos' && canManageNotices()) {
            <button class="primary" (click)="openModal('notice')">Publicar aviso</button>
          }
          @if (section() === 'tienda' && canManageProducts()) {
            <button class="primary" (click)="openModal('product')">Añadir producto</button>
          }
          <button (click)="openModal('password')">Cambiar contraseña</button
          ><button (click)="load()">Actualizar</button>
        </div>
      </div>
      @if (section() === 'avisos') {
        <div class="notice-grid">
          @for (item of notices(); track item.id) {
            <article>
              <span class="kicker">{{ item.fecha_publicacion }}</span>
              <h2>{{ item.titulo }}</h2>
              <p>{{ item.aviso }}</p>
              <div>
                <button class="action-edit" (click)="editNotice(item)">Editar</button
                ><button class="action-delete" (click)="removeNotice(item)">Eliminar</button>
              </div>
            </article>
          } @empty {
            <div class="empty">Aún no has publicado avisos.</div>
          }
        </div>
      }
      @if (section() === 'favoritos') {
        <div class="liked-grid">
          @for (item of favoriteWorks(); track item.id) {
            <article>
              <button class="liked-art" type="button" (click)="selectedPublication.set(item)">
                <img
                  [src]="image(item.imagen)"
                  (error)="imageError($event)"
                  [alt]="item.titulo"
                /><span
                  ><strong>{{ item.titulo }}</strong
                  ><small>Por {{ item.artist_name || 'artista de la comunidad' }}</small></span
                ></button
              ><button
                class="unlike"
                type="button"
                [disabled]="likeBusy(item)"
                (click)="unlike(item)"
              >
                {{ likeBusy(item) ? 'Actualizando…' : '♥ Quitar me gusta' }}
              </button>
            </article>
          } @empty {
            <div class="empty">Aún no has dado me gusta a ninguna obra.</div>
          }
        </div>
      }
      @if (communityModal(); as community) {
        <div class="modal-backdrop" (click)="communityModal.set(null)">
          <section
            class="profile-modal community-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Comunidad"
            (click)="$event.stopPropagation()"
          >
            <header>
              <div>
                <span class="kicker">TU COMUNIDAD</span>
                <h2>{{ community === 'seguidores' ? 'Seguidores' : 'Seguidos' }}</h2>
                <p>Personas conectadas con tu espacio creativo.</p>
              </div>
              <button
                type="button"
                class="modal-close"
                aria-label="Cerrar"
                (click)="communityModal.set(null)"
              >
                ×
              </button>
            </header>
            <nav class="community-switch">
              <button
                [class.selected]="community === 'seguidores'"
                (click)="communityModal.set('seguidores')"
              >
                Seguidores <b>{{ followers().length }}</b></button
              ><button
                [class.selected]="community === 'seguidos'"
                (click)="communityModal.set('seguidos')"
              >
                Seguidos <b>{{ favorites().length }}</b>
              </button>
            </nav>
            <div class="community-list">
              @for (item of community === 'seguidores' ? followers() : favorites(); track item.id) {
                <a [routerLink]="['/artistas', item.id]" (click)="communityModal.set(null)"
                  ><img
                    [src]="image(item.imagen)"
                    (error)="imageError($event)"
                    [alt]="item.usuario"
                  /><span
                    ><strong>{{ item.usuario }}</strong
                    ><small>{{ item.biografia || 'Perfil de la comunidad' }}</small></span
                  ><span class="view-profile">Ver perfil ↗</span></a
                >
              } @empty {
                <p class="empty">
                  {{
                    community === 'seguidores'
                      ? 'Todavía no tienes seguidores.'
                      : 'Todavía no sigues a ningún perfil.'
                  }}
                </p>
              }
            </div>
          </section>
        </div>
      }
      @if (section() === 'tienda' && canManageProducts()) {
        <section class="manage">
          <div>
            <span class="kicker">TU TIENDA</span>
            <h2>Tu escaparate</h2>
            <p>Gestiona las piezas físicas y descargas digitales que compartes con la comunidad.</p>
            <button class="primary" (click)="openModal('product')">Añadir producto</button>
          </div>
          <div class="mini-list">
            @for (item of products(); track item.id) {
              <article>
                <img [src]="image(item.imagen)" [alt]="item.nombre" /><span>{{ item.nombre }}</span
                ><strong>{{ item.precio | currency: 'EUR' }}</strong
                ><button class="row-edit" (click)="editProduct(item)">Editar</button
                ><button class="row-edit danger" (click)="removeProduct(item)">Eliminar</button>
              </article>
            } @empty {
              <p class="empty-inline">Todavía no tienes productos en tu tienda.</p>
            }
          </div>
        </section>
      }
      @if (user()?.id_tipo === 3 && section() === 'obras') {
        <section class="manage event-manage">
          <div>
            <span class="kicker">ENCUENTROS Y FERIAS</span>
            <h2>Tus eventos</h2>
            <p>Reúne a artistas y visitantes en el próximo punto de encuentro creativo.</p>
            @if (user()?.id_tipo === 3) {
              <button class="primary" (click)="openModal('event')">Crear evento</button>
            }
          </div>
          <div class="mini-list">
            @for (item of ownEvents(); track item.id) {
              <article>
                <img
                  [src]="image(item.imagen)"
                  (error)="imageError($event)"
                  [alt]="item.nombre"
                /><span>{{ item.nombre }}</span
                ><strong>{{ item.fecha_inicio }}</strong
                ><button type="button" class="row-edit" (click)="editEvent(item)">Editar</button
                ><button type="button" class="row-edit" (click)="loadParticipants(item)">
                  Participantes</button
                ><button type="button" class="row-edit danger" (click)="removeEvent(item)">
                  Eliminar
                </button>
              </article>
            } @empty {
              <p class="empty-inline">Aún no has organizado eventos.</p>
            }
          </div>
        </section>
        <section class="manage attending">
          <div>
            <span class="kicker">TU AGENDA</span>
            <h2>Eventos a los que asistirás</h2>
            <p>Encuentros donde tienes una solicitud o una plaza confirmada.</p>
          </div>
          <div class="mini-list">
            @for (item of attendingEvents(); track item.id) {
              <article>
                <img
                  [src]="image(item.imagen)"
                  (error)="imageError($event)"
                  [alt]="item.nombre"
                /><span>{{ item.nombre }} · {{ item.ubicacion }}</span
                ><strong>{{ item.fecha_inicio }}</strong
                ><button class="row-edit" (click)="leaveEvent(item)">Salir</button>
              </article>
            } @empty {
              <p class="empty-inline">No tienes eventos próximos confirmados.</p>
            }
          </div>
        </section>
      }
      @if (section() === 'eventos') {
        <section class="events-dashboard">
          <header>
            <div>
              <span class="kicker">TU AGENDA</span>
              <h2>Eventos</h2>
              <p>
                Consulta los eventos organizados y aquellos en los que has solicitado participar.
              </p>
            </div>
            @if (user()?.id_tipo === 3) {
              <button class="primary" (click)="openModal('event')">Crear evento</button>
            }
          </header>
          @if (user()?.id_tipo === 3) {
            <h3>
              Organizados por ti <span>{{ ownEvents().length }}</span>
            </h3>
            <div class="event-cards">
              @for (item of ownEvents(); track item.id) {
                <article>
                  <img
                    [src]="image(item.imagen)"
                    (error)="imageError($event)"
                    [alt]="item.nombre"
                  />
                  <div class="event-copy">
                    <span class="kicker">{{ item.fecha_inicio | date: 'd MMM yyyy' }}</span>
                    <h4>{{ item.nombre }}</h4>
                    <p>{{ item.ubicacion }}</p>
                  </div>
                  <div class="event-tools">
                    <button class="row-edit" (click)="editEvent(item)">Editar</button
                    ><button class="row-edit" (click)="loadParticipants(item)">Participantes</button
                    ><button class="row-edit danger" (click)="removeEvent(item)">Eliminar</button>
                  </div>
                </article>
              } @empty {
                <p class="empty-inline">Aún no has organizado eventos.</p>
              }
            </div>
          }
          <h3>
            Solicitudes y plazas <span>{{ attendingEvents().length }}</span>
          </h3>
          <div class="event-cards">
            @for (item of attendingEvents(); track item.id) {
              <article>
                <img [src]="image(item.imagen)" (error)="imageError($event)" [alt]="item.nombre" />
                <div class="event-copy">
                  <span class="kicker">{{ item.fecha_inicio | date: 'd MMM yyyy' }}</span>
                  <h4>{{ item.nombre }}</h4>
                  <p>{{ item.ubicacion }} · {{ participationLabel(item.participacion) }}</p>
                </div>
                <div class="event-tools">
                  <button class="row-edit" (click)="leaveEvent(item)">Salir del evento</button>
                </div>
              </article>
            } @empty {
              <p class="empty-inline">No tienes solicitudes ni plazas en eventos próximos.</p>
            }
          </div>
        </section>
      }
      @if (section() === 'obras') {
        <div class="art-grid">
          @for (post of posts(); track post.id) {
            <article>
              <img [src]="image(post.imagen)" [alt]="post.titulo" loading="lazy" />
              <div>
                <span>♥ {{ post.megusta }}</span
                ><span class="art-actions"
                  ><button type="button" class="action-edit" (click)="editPublication(post)">
                    Editar</button
                  ><button type="button" class="action-delete" (click)="remove(post)">
                    Eliminar</button
                  ><button
                    type="button"
                    class="action-comments"
                    (click)="selectedPublication.set(post)"
                  >
                    Comentarios
                  </button></span
                >
              </div>
              <h3>{{ post.titulo }}</h3>
              <p>{{ post.descripcion }}</p>
            </article>
          } @empty {
            <div class="empty">Tus primeras obras aparecerán aquí.</div>
          }
        </div>
      }
      @if (selectedPublication(); as publication) {
        <app-publication-detail-modal
          [publication]="publication"
          (close)="selectedPublication.set(null)"
        />
      }
      @if (participantEvent()) {
        <div class="modal-backdrop" (click)="participantEvent.set(null)">
          <section
            class="profile-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Participantes del evento"
            (click)="$event.stopPropagation()"
          >
            <header>
              <div>
                <span class="kicker">SOLICITUDES</span>
                <h2>{{ participantEvent().nombre }}</h2>
                <p>Revisa las solicitudes para participar.</p>
              </div>
              <button
                type="button"
                class="modal-close"
                aria-label="Cerrar"
                (click)="participantEvent.set(null)"
              >
                ×
              </button>
            </header>
            @for (person of participants(); track person.id) {
              <div class="participant">
                <img
                  [src]="image(person.imagen)"
                  (error)="imageError($event)"
                  [alt]="person.usuario"
                /><span
                  ><strong>{{ person.usuario }}</strong
                  ><small>{{ person.estado }}</small></span
                >
                @if (person.estado === 'aceptado') {
                  <button
                    type="button"
                    class="row-edit danger"
                    (click)="decideParticipant(person, 'rechazado')"
                  >
                    Eliminar participante
                  </button>
                } @else if (person.estado === 'pendiente') {
                  <button type="button" (click)="decideParticipant(person, 'aceptado')">
                    Aceptar</button
                  ><button
                    type="button"
                    class="row-edit danger"
                    (click)="decideParticipant(person, 'rechazado')"
                  >
                    Rechazar
                  </button>
                } @else {
                  <button type="button" (click)="decideParticipant(person, 'aceptado')">
                    Aceptar solicitud
                  </button>
                }
              </div>
            } @empty {
              <p class="empty">No hay solicitudes para este evento.</p>
            }
          </section>
        </div>
      }
      @if (modal()) {
        <div class="modal-backdrop" (click)="closeModal()">
          <section
            class="profile-modal"
            role="dialog"
            aria-modal="true"
            [attr.aria-label]="modalTitle()"
            (click)="$event.stopPropagation()"
          >
            <header>
              <div>
                <span class="kicker">{{ modalEyebrow() }}</span>
                <h2>{{ modalTitle() }}</h2>
                <p>{{ modalDescription() }}</p>
              </div>
              <button type="button" class="modal-close" aria-label="Cerrar" (click)="closeModal()">
                ×
              </button>
            </header>
            @if (modal() === 'profile') {
              <form (ngSubmit)="save()">
                <div class="profile-photo">
                  <img
                    [src]="profilePreview() || image(user()?.imagen)"
                    (error)="imageError($event)"
                    alt="Foto de perfil"
                  /><label
                    >Cambiar foto de perfil<input
                      type="file"
                      accept="image/*"
                      (change)="chooseProfileImage($event)"
                  /></label>
                </div>
                <div class="two">
                  <label>Nombre<input name="nombre" [(ngModel)]="form.nombre" required /></label
                  ><label
                    >Apellidos<input name="apellidos" [(ngModel)]="form.apellidos" required
                  /></label>
                </div>
                <label
                  >Nombre de usuario<input
                    name="usuario"
                    [(ngModel)]="form.usuario"
                    required /></label
                ><label
                  >Correo electrónico<input
                    name="correo"
                    [(ngModel)]="form.correo"
                    type="email"
                    required /></label
                ><label
                  >Biografía<textarea
                    name="biografia"
                    [(ngModel)]="form.biografia"
                    maxlength="255"
                  ></textarea>
                </label>
                <footer>
                  <button type="button" class="cancel" (click)="closeModal()">Cancelar</button
                  ><button class="primary" [disabled]="busy()">Guardar cambios</button>
                </footer>
              </form>
            }
            @if (modal() === 'password') {
              <form (ngSubmit)="changePassword()">
                <label
                  >Contraseña actual<input
                    type="password"
                    name="password_actual"
                    [(ngModel)]="passwordForm.password_actual"
                    autocomplete="current-password"
                    required /></label
                ><label
                  >Nueva contraseña<input
                    type="password"
                    name="password"
                    [(ngModel)]="passwordForm.password"
                    autocomplete="new-password"
                    minlength="8"
                    required /></label
                ><label
                  >Repite la nueva contraseña<input
                    type="password"
                    name="password_confirmation"
                    [(ngModel)]="passwordForm.password_confirmation"
                    autocomplete="new-password"
                    minlength="8"
                    required
                /></label>
                <footer>
                  <button type="button" class="cancel" (click)="closeModal()">Cancelar</button
                  ><button class="primary" [disabled]="busy()">Actualizar contraseña</button>
                </footer>
              </form>
            }
            @if (modal() === 'notice') {
              <form (ngSubmit)="saveNotice()">
                <label
                  >Título<input
                    name="notice-title"
                    [(ngModel)]="notice.titulo"
                    required
                    maxlength="255" /></label
                ><label
                  >Aviso<textarea
                    name="notice-body"
                    [(ngModel)]="notice.aviso"
                    required
                    maxlength="255"
                  ></textarea>
                </label>
                <footer>
                  <button type="button" class="cancel" (click)="closeModal()">Cancelar</button
                  ><button class="primary" [disabled]="busy()">
                    {{ editingNotice() ? 'Guardar cambios' : 'Publicar aviso' }}
                  </button>
                </footer>
              </form>
            }
            @if (modal() === 'publication') {
              <form (ngSubmit)="publish()">
                <label
                  >Título<input
                    name="titulo"
                    [(ngModel)]="draft.titulo"
                    required
                    maxlength="255"
                    placeholder="Título de la obra" /></label
                ><label
                  >Descripción<textarea
                    name="descripcion"
                    [(ngModel)]="draft.descripcion"
                    required
                    maxlength="255"
                    placeholder="Cuéntanos algo de ella"
                  ></textarea>
                </label>
                <div class="two">
                  <label
                    >Categoría<select name="id_categoria" [(ngModel)]="draft.id_categoria" required>
                      <option [ngValue]="0" disabled>Elige una categoría</option>
                      @for (category of categories(); track category.id) {
                        <option [ngValue]="category.id">{{ category.nombre }}</option>
                      }
                    </select></label
                  ><label
                    >Imagen<input
                      type="file"
                      accept="image/*"
                      (change)="chooseImage($event)"
                      [required]="!editingPost()"
                  /></label>
                </div>
                @if (publicationPreview()) {
                  <img
                    class="image-preview"
                    [src]="publicationPreview()"
                    alt="Vista previa de la obra"
                  />
                }
                <footer>
                  <button type="button" class="cancel" (click)="closeModal()">Cancelar</button
                  ><button class="primary" [disabled]="busy()">
                    {{
                      busy() ? 'Guardando…' : editingPost() ? 'Guardar cambios' : 'Publicar obra'
                    }}
                  </button>
                </footer>
              </form>
            }
            @if (modal() === 'product') {
              <form (ngSubmit)="createProduct()">
                <label
                  >Nombre<input
                    name="product-name"
                    [(ngModel)]="product.nombre"
                    required
                    placeholder="Nombre de la pieza" /></label
                ><label
                  >Descripción<textarea
                    name="product-description"
                    [(ngModel)]="product.descripcion"
                    required
                    placeholder="Descripción"
                  ></textarea>
                </label>
                <div class="two">
                  <label
                    >Precio (€)<input
                      name="price"
                      type="number"
                      min="0.01"
                      step="0.01"
                      [(ngModel)]="product.precio"
                      required /></label
                  ><label
                    >Unidades<input
                      name="stock"
                      type="number"
                      min="0"
                      [(ngModel)]="product.cantidad"
                      required
                  /></label>
                </div>
                <div class="two">
                  <label
                    >Formato<select name="product-type" [(ngModel)]="product.id_tipo">
                      <option [ngValue]="1">Pieza física</option>
                      <option [ngValue]="2">Descarga digital</option>
                    </select></label
                  ><label
                    >Imagen de portada<input
                      type="file"
                      accept="image/*"
                      (change)="chooseProductImage($event)"
                      [required]="!editingProduct()"
                  /></label>
                </div>
                @if (productPreview()) {
                  <img
                    class="image-preview"
                    [src]="productPreview()"
                    alt="Vista previa de la pieza"
                  />
                }
                @if (product.id_tipo === 2) {
                  <label
                    >Archivo para descarga<input
                      type="file"
                      (change)="chooseDigitalFile($event)"
                      [required]="!editingProduct()"
                  /></label>
                }
                <footer>
                  <button type="button" class="cancel" (click)="closeModal()">Cancelar</button
                  ><button class="primary" [disabled]="busy()">
                    {{
                      busy()
                        ? 'Guardando…'
                        : editingProduct()
                          ? 'Guardar cambios'
                          : 'Añadir a mi tienda'
                    }}
                  </button>
                </footer>
              </form>
            }
            @if (modal() === 'event') {
              <form (ngSubmit)="createEvent()">
                <label
                  >Nombre del evento<input
                    name="event-name"
                    [(ngModel)]="event.nombre"
                    required
                    placeholder="Nombre del evento" /></label
                ><label
                  >Lugar<input
                    name="venue"
                    [(ngModel)]="event.ubicacion"
                    required
                    placeholder="Lugar" /></label
                ><label
                  >Enlace<input
                    name="event-link"
                    [(ngModel)]="event.link"
                    type="url"
                    placeholder="https://"
                /></label>
                <div class="two">
                  <label
                    >Desde<input
                      name="start"
                      [(ngModel)]="event.fecha_inicio"
                      type="date"
                      required /></label
                  ><label
                    >Hasta<input name="end" [(ngModel)]="event.fecha_fin" type="date" required
                  /></label>
                </div>
                <label
                  >Cartel o imagen<input
                    type="file"
                    accept="image/*"
                    (change)="chooseEventImage($event)"
                /></label>
                @if (eventPreview()) {
                  <img class="image-preview" [src]="eventPreview()" alt="Vista previa del evento" />
                }
                <footer>
                  <button type="button" class="cancel" (click)="closeModal()">Cancelar</button
                  ><button class="primary" [disabled]="busy()">
                    {{
                      busy() ? 'Guardando…' : editingEvent() ? 'Guardar cambios' : 'Publicar evento'
                    }}
                  </button>
                </footer>
              </form>
            }
            @if (message()) {
              <p class="modal-message" role="alert">{{ message() }}</p>
            }
          </section>
        </div>
      }
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
        color: #272432;
      }
      .wrap {
        max-width: 1180px;
        margin: auto;
        padding: 48px 25px 90px;
      }
      .profile-head {
        display: flex;
        align-items: center;
        gap: 19px;
        padding: 24px;
        background: #29253a;
        color: white;
        border-radius: 20px;
        position: relative;
        overflow: hidden;
      }
      .profile-head:after {
        content: '✳';
        position: absolute;
        right: 5%;
        top: -40px;
        font-size: 210px;
        color: #ffffff0b;
        line-height: 1;
      }
      .avatar {
        width: 82px;
        height: 82px;
        border-radius: 50%;
        object-fit: cover;
        background: #d9fa72;
        color: #29253a;
        font-size: 33px;
        font-weight: 850;
        flex: 0 0 auto;
      }
      .kicker {
        color: #8a65e5;
        font-size: 9px;
        font-weight: 850;
        letter-spacing: 0.15em;
      }
      .profile-head .kicker {
        color: #d9fa72;
      }
      .profile-head h1 {
        font-size: clamp(30px, 4vw, 45px);
        letter-spacing: -0.07em;
        margin: 6px 0;
      }
      .profile-head p {
        font-size: 12px;
        color: #d8d3e7;
        margin: 0;
        max-width: 550px;
      }
      .edit {
        margin-left: auto;
        align-self: flex-end;
        white-space: nowrap;
        border: 1px solid #ffffff5a;
        border-radius: 99px;
        padding: 10px 14px;
        color: white;
        background: transparent;
        font-size: 10px;
        font-weight: 700;
        z-index: 1;
      }
      .two {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .profile-tabs {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #e9e2da;
        margin: 28px 0 18px;
      }
      .profile-tabs > div {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .profile-tabs button {
        border: 0;
        background: none;
        padding: 11px 10px;
        color: #77727e;
        font-weight: 750;
        font-size: 11px;
        cursor: pointer;
      }
      .profile-tabs .tab-title {
        padding: 13px 10px;
        color: #7045d4;
        font-size: 12px;
        font-weight: 800;
        border-bottom: 2px solid #7045d4;
      }
      .tab-title b {
        margin-left: 5px;
        color: #77727e;
      }
      .primary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 42px;
        padding: 0 16px;
        border: 0;
        border-radius: 999px;
        background: #7045d4;
        color: white;
        font-size: 11px;
        font-weight: 800;
        cursor: pointer;
      }
      .primary:hover {
        background: #5834b4;
      }
      .manage {
        display: grid;
        grid-template-columns: 0.8fr 1.2fr;
        gap: 18px 28px;
        margin-top: 17px;
        padding: 22px;
        background: #f6e5d7;
        border-radius: 17px;
      }
      .event-manage {
        background: #e9e2fa;
      }
      .manage h2 {
        font-size: 21px;
        letter-spacing: -0.05em;
        margin: 9px 0;
      }
      .manage p {
        font-size: 11px;
        color: #77727e;
        line-height: 1.65;
      }
      .manage > .mini-list {
        grid-column: auto;
        align-self: center;
      }
      .mini-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        overflow: auto;
      }
      .mini-list article {
        display: flex;
        align-items: center;
        gap: 9px;
        min-width: 0;
        background: #fffdf9;
        border: 1px solid #ece5de;
        border-radius: 10px;
        padding: 8px;
        font-size: 10px;
      }
      .mini-list img {
        width: 38px;
        height: 38px;
        object-fit: cover;
        border-radius: 7px;
      }
      .mini-list span {
        flex: 1;
      }
      .row-edit {
        border: 0;
        border-radius: 99px;
        padding: 7px 10px;
        background: #eee9fb;
        color: #563a9a;
        font-size: 10px;
        font-weight: 750;
        cursor: pointer;
      }
      .empty-inline {
        font-size: 11px;
        color: #77727e;
      }
      .art-grid {
        columns: 3;
        column-gap: 15px;
        margin-top: 26px;
      }
      .art-grid article {
        display: inline-block;
        width: 100%;
        break-inside: avoid;
        margin-bottom: 15px;
        padding: 9px;
        border: 1px solid #ece5de;
        border-radius: 15px;
        background: #fffdf9;
      }
      .art-grid img {
        width: 100%;
        max-height: 390px;
        object-fit: cover;
        border-radius: 10px;
      }
      .art-grid article > div {
        display: flex;
        justify-content: space-between;
        padding: 10px 2px 0;
        font-size: 10px;
        color: #77727e;
      }
      .art-grid article button {
        border: 0;
        background: none;
        color: #a64d56;
        font-size: 10px;
        font-weight: 750;
        cursor: pointer;
      }
      .art-grid h3 {
        font-size: 16px;
        margin: 5px 3px;
      }
      .art-grid p {
        font-size: 11px;
        color: #77727e;
        margin: 4px;
      }
      .empty {
        padding: 40px;
        text-align: center;
        background: #fffdf9;
        border: 1px dashed #d7cce8;
        border-radius: 15px;
        color: #77727e;
      }
      .message {
        font-size: 12px;
        color: #7045d4;
      }
      .modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 100;
        display: grid;
        place-items: center;
        padding: 20px;
        background: #211c2cb8;
        backdrop-filter: blur(6px);
      }
      .profile-modal {
        position: relative;
        width: min(650px, 100%);
        max-height: 90dvh;
        overflow: auto;
        padding: 27px;
        border: 1px solid #ffffffa8;
        border-radius: 22px;
        background: #fffdf9;
        box-shadow: 0 30px 100px #15121d55;
        animation: modal-in 0.18s ease-out;
      }
      .profile-modal > header {
        display: flex;
        justify-content: space-between;
        gap: 20px;
        margin-bottom: 20px;
      }
      .profile-modal h2 {
        font-size: clamp(26px, 4vw, 34px);
        letter-spacing: -0.06em;
        margin: 7px 0;
      }
      .profile-modal header p {
        margin: 0;
        color: #77727e;
        font-size: 12px;
      }
      .modal-close {
        width: 38px;
        height: 38px;
        flex: 0 0 auto;
        border: 1px solid #e9e2da;
        border-radius: 50%;
        background: white;
        color: #555160;
        font-size: 24px;
        cursor: pointer;
      }
      .profile-modal form {
        display: grid;
        gap: 14px;
      }
      .profile-modal form > label,
      .profile-modal .two label,
      .profile-photo label {
        display: grid;
        gap: 7px;
        color: #514c59;
        font-size: 11px;
        font-weight: 750;
      }
      .profile-photo {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .profile-photo img {
        width: 68px;
        height: 68px;
        border-radius: 50%;
        object-fit: cover;
      }
      .profile-modal input,
      .profile-modal select,
      .profile-modal textarea {
        width: 100%;
        min-height: 44px;
        padding: 11px 12px;
        border: 1px solid #e5dfd7;
        border-radius: 10px;
        background: white;
        color: #272432;
        font: 13px system-ui;
      }
      .profile-modal textarea {
        min-height: 92px;
        resize: vertical;
      }
      .profile-modal input[type='file'] {
        padding: 8px;
      }
      .image-preview {
        display: block;
        max-width: 100%;
        max-height: 240px;
        object-fit: contain;
        justify-self: start;
        border: 1px solid #ece5de;
        border-radius: 12px;
        background: #f3f0eb;
      }
      .profile-modal footer {
        display: flex;
        justify-content: flex-end;
        gap: 9px;
        margin-top: 5px;
        padding-top: 16px;
        border-top: 1px solid #eee8e1;
      }
      .profile-modal footer button {
        min-height: 42px;
        padding: 0 17px;
        border: 0;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 750;
        cursor: pointer;
      }
      .cancel {
        background: #f0ece6;
        color: #514c59;
      }
      .modal-message {
        padding: 11px 13px;
        border-radius: 10px;
        background: #fbe5e2;
        color: #8b3c32;
        font-size: 12px;
      }
      @keyframes modal-in {
        from {
          opacity: 0;
          transform: translateY(8px) scale(0.99);
        }
        to {
          opacity: 1;
          transform: none;
        }
      }
      @media (max-width: 720px) {
        .manage {
          grid-template-columns: 1fr;
          gap: 12px;
        }
        .manage > .mini-list {
          grid-column: 1/-1;
        }
        .art-grid {
          columns: 2;
        }
      }
      @media (max-width: 520px) {
        .wrap {
          padding: 30px 17px 55px;
        }
        .profile-head {
          align-items: flex-start;
          gap: 12px;
          padding: 17px;
        }
        .avatar {
          width: 55px;
          height: 55px;
          font-size: 22px;
        }
        .profile-head h1 {
          font-size: 27px;
        }
        .profile-head p {
          font-size: 10px;
        }
        .edit {
          position: absolute;
          right: 12px;
          bottom: 12px;
          padding: 7px 10px;
          font-size: 9px;
        }
        .profile-head > div:nth-child(2) {
          padding-bottom: 25px;
        }
        .two {
          grid-template-columns: 1fr;
        }
        .art-grid {
          columns: 1;
        }
        .profile-tabs {
          align-items: flex-start;
          gap: 8px;
          flex-direction: column;
        }
        .profile-modal {
          padding: 22px;
        }
      }
    `,
    `
      .profile-tabs nav,
      .profile-tabs > div {
        display: flex;
        align-items: center;
        gap: 5px;
        flex-wrap: wrap;
      }
      .profile-tabs nav button {
        border-radius: 9px;
      }
      .profile-tabs nav button.selected {
        background: #eee9fb;
        color: #7045d4;
      }
      .profile-head > div {
        position: relative;
        z-index: 1;
        flex: 1;
        min-width: 200px;
      }
      .profile-stats {
        display: flex;
        gap: 24px;
        margin-top: 17px;
        flex-wrap: wrap;
      }
      .profile-stats span,
      .profile-stats button {
        padding: 0;
        border: 0;
        background: transparent;
        color: #ded9e7;
        font-size: 11px;
      }
      .profile-stats button {
        cursor: pointer;
      }
      .profile-stats strong {
        color: #fff;
        font-size: 13px;
        margin-right: 4px;
      }
      .profile-stats button:hover {
        color: #d9fa72;
      }
      .notice-grid,
      .favorite-grid,
      .liked-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
        gap: 12px;
      }
      .notice-grid article,
      .favorite-grid > a,
      .liked-grid article {
        padding: 16px;
        border: 1px solid #ece5de;
        border-radius: 14px;
        background: #fffdf9;
      }
      .notice-grid h2 {
        font-size: 17px;
      }
      .notice-grid p {
        font-size: 12px;
        color: #77727e;
        line-height: 1.6;
      }
      .notice-grid article > div {
        display: flex;
        gap: 8px;
      }
      .notice-grid button {
        border: 0;
        border-radius: 99px;
        padding: 8px 11px;
        background: #eee9fb;
        color: #563a9a;
        font-size: 10px;
        font-weight: 750;
      }
      .favorite-grid > a {
        display: flex;
        align-items: center;
        gap: 12px;
        color: #272432;
        text-decoration: none;
      }
      .favorite-grid img {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        object-fit: cover;
      }
      .favorite-grid span,
      .favorite-grid strong,
      .favorite-grid small {
        display: block;
      }
      .favorite-grid small {
        margin-top: 4px;
        color: #77727e;
        font-size: 10px;
      }
      .liked-grid article {
        padding: 10px;
      }
      .liked-art {
        display: flex;
        width: 100%;
        align-items: center;
        gap: 11px;
        padding: 0;
        border: 0;
        background: transparent;
        text-align: left;
        cursor: pointer;
      }
      .liked-art img {
        width: 72px;
        height: 72px;
        object-fit: cover;
        border-radius: 9px;
        background: #eee8e1;
      }
      .liked-art span,
      .liked-art strong,
      .liked-art small {
        display: block;
      }
      .liked-art small {
        margin-top: 5px;
        color: #77727e;
        font-size: 10px;
      }
      .unlike {
        margin-top: 11px;
        border: 0;
        border-radius: 99px;
        padding: 8px 11px;
        background: #fbe5e2;
        color: #9b463d;
        font-size: 10px;
        font-weight: 750;
        cursor: pointer;
      }
      .unlike:disabled {
        opacity: 0.6;
      }
      .community-modal {
        width: min(520px, 100%);
      }
      .community-switch {
        display: flex;
        border-bottom: 1px solid #ece5de;
        margin-bottom: 7px;
      }
      .community-switch button {
        flex: 1;
        padding: 12px;
        border: 0;
        border-bottom: 2px solid transparent;
        background: transparent;
        color: #77727e;
        font-size: 11px;
        font-weight: 750;
        cursor: pointer;
      }
      .community-switch button.selected {
        border-bottom-color: #7045d4;
        color: #7045d4;
      }
      .community-switch b {
        margin-left: 4px;
      }
      .community-list {
        max-height: 55dvh;
        overflow: auto;
      }
      .community-list > a {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 4px;
        border-bottom: 1px solid #f0ece6;
        color: #272432;
        text-decoration: none;
      }
      .community-list > a:hover {
        background: #faf7f1;
      }
      .community-list img {
        width: 46px;
        height: 46px;
        border-radius: 50%;
        object-fit: cover;
        background: #eee8e1;
      }
      .community-list a > span:nth-child(2) {
        flex: 1;
        min-width: 0;
      }
      .community-list strong,
      .community-list small {
        display: block;
      }
      .community-list strong {
        font-size: 12px;
      }
      .community-list small {
        margin-top: 4px;
        color: #77727e;
        font-size: 10px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .community-list .view-profile {
        color: #7045d4;
        font-size: 10px;
        font-weight: 750;
        white-space: nowrap;
      }
    `,
  ],
})
export class ProfilePage {
  readonly confirmation = signal<{ title: string; message: string; confirmLabel: string } | null>(
    null,
  );
  private pendingConfirmation: (() => void) | null = null;
  private readonly api = inject(Api);
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
  constructor() {
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
        this.message.set(
          'No se pudo cargar tu perfil. Comprueba tu conexión y vuelve a intentarlo.',
        );
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
        this.message.set(e.error?.message ?? 'No se pudo quitar el me gusta.');
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
        this.message.set(e.error?.message ?? 'No se pudo guardar el perfil.');
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
        this.message.set(e.error?.message ?? 'No se pudo cambiar la contraseña.');
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
        this.message.set(e.error?.message ?? 'No se pudo guardar el aviso.');
      },
    });
  }
  removeNotice(item: any) {
    this.askConfirmation('Eliminar aviso', `¿Quieres eliminar «${item.titulo}»?`, 'Eliminar', () =>
      this.api
        .delete(`/notices/${item.id}`)
        .subscribe({
          next: () => this.notices.update((items) => items.filter((entry) => entry.id !== item.id)),
          error: (e) => this.message.set(e.error?.message ?? 'No se pudo eliminar el aviso.'),
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
      this.message.set('Añade una imagen para publicar.');
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
        this.message.set(e.error?.message ?? 'No se pudo guardar la obra.');
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
      this.message.set('Añade las imágenes y el archivo digital que correspondan.');
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
        this.message.set(e.error?.message ?? 'No se pudo guardar la pieza.');
      },
    });
  }
  removeProduct(item: any) {
    this.askConfirmation('Eliminar pieza', `¿Quieres eliminar «${item.nombre}»?`, 'Eliminar', () =>
      this.api
        .delete(`/products/${item.id}`)
        .subscribe({
          next: () => this.products.update((list) => list.filter((row) => row.id !== item.id)),
          error: (e) => this.message.set(e.error?.message ?? 'No se pudo eliminar la pieza.'),
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
            error: (e) => this.message.set(e.error?.message ?? 'No se pudo eliminar el evento.'),
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
            error: (e) => this.message.set(e.error?.message ?? 'No se pudo salir del evento.'),
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
          this.message.set(e.error?.message ?? 'No se pudieron cargar las solicitudes.'),
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
        error: (e) => this.message.set(e.error?.message ?? 'No se pudo actualizar la solicitud.'),
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
        this.message.set(e.error?.message ?? 'No se pudo guardar el evento.');
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
            error: () => this.message.set('No se pudo eliminar la obra.'),
          }),
    );
  }
  image(path?: string) {
    return assetUrl(path);
  }
  imageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (!img.src.endsWith('/media/no-user.png')) img.src = '/media/no-user.png';
  }
}
