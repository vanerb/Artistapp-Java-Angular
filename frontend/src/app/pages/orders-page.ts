import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Api } from '../core/api';
import { AuthService } from '../core/auth.service';
import { assetUrl } from '../core/asset-url';
import { ConfirmModal } from '../shared/confirm-modal';
type Order = {
  id: number;
  nombre: string;
  buyer_name?: string;
  total_vendedor?: number | string;
  estado: string;
  direccion: string;
  telefono?: string;
  created_at?: string | null;
  pago: number | string;
  productos: {
    id: number;
    nombre: string;
    imagen: string | null;
    precio: number | string;
    id_tipo: number | null;
    seller_name?: string | null;
    detalle_id: number;
    estado_envio: string;
    recibido_confirmado_at: string | null;
  }[];
};
@Component({
  standalone: true,
  imports: [CommonModule, ConfirmModal],
  template: `<section class="orders">
    <span class="kicker">{{ received() ? 'COMPRAS DE TUS CLIENTES' : (auth.isAdmin() ? 'VENTAS DE LA COMUNIDAD' : 'TU HISTORIAL DE COMPRAS') }}</span>
    <h1>{{ received() ? 'Pedidos recibidos' : (auth.isAdmin() ? 'Pedidos de la tienda' : 'Mis compras') }}.</h1>
    <p>{{ received() ? 'Consulta quién ha comprado tus productos y el estado de cada pedido.' : 'El camino que ha recorrido el arte hasta llegar a su nueva casa.' }}</p>
    @if (message()) {
      <div class="message">{{ message() }}</div>
    }
    <div class="list">
      @for (order of orders(); track order.id) {
        <article>
          <header>
            <div>
              <span class="kicker">PEDIDO #{{ order.id }}</span>
              <h2>{{ received() ? 'Comprador: ' + (order.buyer_name || 'Cliente') : order.nombre }}</h2>
              @if (order.created_at) {
                <time class="date">{{ orderDate(order) | date: 'd MMM yyyy · HH:mm' }}</time>
              }
            </div>
            <span
              class="status"
              [class.sent]="order.estado === 'enviado'"
              [class.done]="order.estado === 'entregado'"
              [class.cancelled]="order.estado === 'cancelado'"
              >{{ statusLabel(order.estado) }}</span
            >
          </header>
          <div class="products">
            @for (product of order.productos; track product.detalle_id) {
              <div>
                <img [src]="image(product.imagen)" [alt]="product.nombre" loading="lazy" />
                <span>
                  {{ product.nombre }}
                  @if (!received() && product.seller_name) {
                    <small class="seller">Vende {{ product.seller_name }}</small>
                  }
                  <small class="item-status">{{ itemLabel(order, product) }}</small>
                </span>
                <strong>{{ product.precio | currency: 'EUR' }}</strong>
                @if (!received() && !auth.isAdmin() && order.estado !== 'cancelado' && product.estado_envio === 'entregado' && !product.recibido_confirmado_at) {
                  <button class="confirm-received" (click)="confirmReceived(order, product)">Confirmar recepción</button>
                }
                @if (!received() && product.id_tipo === 2 && order.estado !== 'cancelado' && product.estado_envio === 'entregado') {
                  <button (click)="download(order, product)">Descargar</button>
                }
              </div>
            }
          </div>
          <footer>
            <span>{{ received() ? 'Entrega a: ' + order.nombre + ' · ' + order.direccion + (order.telefono ? ' · Tel. ' + order.telefono : '') : order.direccion }}</span
            ><strong>{{ (received() ? (order.total_vendedor ?? 0) : order.pago) | currency: 'EUR' }}</strong>
            @if (auth.isAdmin() || received()) {
              <select
                #state
                [attr.aria-label]="'Estado del pedido ' + order.id"
                [disabled]="locked(order)"
                (change)="status(order, state)"
              >
                @if (showsMixedState(order)) {
                  <option value="mixto" disabled [selected]="true">Varios estados</option>
                }
                <option value="preparando" [selected]="selectedState(order) === 'preparando'">Preparando</option>
                <option value="enviado" [selected]="selectedState(order) === 'enviado'">Enviado</option>
                <option value="entregado" [selected]="selectedState(order) === 'entregado'">Entregado</option>
                @if (auth.isAdmin()) {
                  <option value="cancelado" [selected]="selectedState(order) === 'cancelado'">Cancelado</option>
                }
              </select>
            } @else if (!received() && order.estado === 'preparando') {
              <button (click)="cancel(order)">Cancelar pedido</button>
            }
          </footer>
        </article>
      } @empty {
        <div class="empty">
          {{ busy() ? 'Buscando tus pedidos…' : 'Todavía no tienes pedidos.' }}
        </div>
      }
    </div>
    @if (hasMore()) {
      <button class="more" [disabled]="busy()" (click)="loadMore()">{{ busy() ? 'Cargando…' : 'Ver más pedidos' }}</button>
    }
    @if (confirmation()) {
      <app-confirm-modal
        [open]="true"
        [title]="confirmation()!.title"
        [message]="confirmation()!.message"
        confirmLabel="Cancelar pedido"
        tone="danger"
        (cancel)="dismissConfirmation()"
        (confirm)="confirmCancellation()"
      />
    }
  </section>`,
  styles: [
    `
      :host {
        display: block;
        color: #272432;
      }
      .orders {
        max-width: 1060px;
        margin: 0 auto;
        padding: 54px 25px 90px;
      }
      .kicker {
        color: #7045d4;
        font-size: 9px;
        letter-spacing: 0.15em;
        font-weight: 850;
      }
      .orders > h1 {
        font-size: clamp(40px, 6vw, 65px);
        letter-spacing: -0.075em;
        margin: 12px 0;
      }
      .orders > p {
        font-size: 13px;
        color: #77727e;
        margin-bottom: 30px;
      }
      .list {
        display: grid;
        gap: 13px;
      }
      .list article {
        background: #fffdf9;
        border: 1px solid #ece5de;
        border-radius: 17px;
        padding: 18px;
      }
      .list header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .list h2 {
        font-size: 17px;
        margin: 5px 0;
      }
      .status {
        padding: 7px 11px;
        border-radius: 99px;
        background: #f8e8cd;
        color: #806014;
        font-size: 9px;
        font-weight: 800;
        text-transform: uppercase;
      }
      .status.sent {
        background: #e4e9ff;
        color: #414fbb;
      }
      .status.done {
        background: #e8f3d4;
        color: #546d22;
      }
      .status.cancelled {
        background: #fbe5e2;
        color: #9b463d;
      }
      .date {
        display: block;
        color: #77727e;
        font-size: 11px;
      }
      .seller {
        display: block;
        margin-top: 3px;
        color: #7045d4;
        font-size: 10px;
      }
      .more {
        display: block;
        margin: 18px auto 0;
        border: 1px solid #e4ded6;
        background: #fffdf9;
        color: #272432;
        border-radius: 99px;
        padding: 10px 18px;
        font-size: 12px;
        font-weight: 750;
        cursor: pointer;
      }
      .products {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
        margin: 14px 0;
      }
      .products > div {
        display: flex;
        align-items: center;
        gap: 10px;
        background: #faf8f3;
        padding: 8px;
        border-radius: 10px;
        font-size: 10px;
      }
      .products img {
        width: 40px;
        height: 46px;
        object-fit: cover;
        border-radius: 6px;
      }
      .products span {
        flex: 1;
      }
      .item-status { display: block; margin-top: 4px; color: #77727e; font-size: 9px; }
      .confirm-received { border: 0; background: #e8f3d4; color: #465d20; border-radius: 99px; padding: 8px 10px; font-size: 9px; font-weight: 750; white-space: nowrap; }
      .products strong {
        white-space: nowrap;
      }
      .list footer {
        border-top: 1px solid #eee8e0;
        padding-top: 13px;
        display: flex;
        align-items: center;
        gap: 15px;
        color: #77727e;
        font-size: 10px;
      }
      .list footer > strong {
        margin-left: auto;
        color: #272432;
        font-size: 14px;
      }
      .list footer button {
        border: 0;
        background: #fbe5e2;
        color: #9b463d;
        border-radius: 99px;
        padding: 9px 12px;
        font-size: 9px;
        font-weight: 750;
      }
      .list footer select {
        padding: 8px;
        border: 1px solid #e4ded6;
        border-radius: 8px;
        background: white;
      }
      .empty {
        padding: 40px;
        text-align: center;
        color: #77727e;
      }
      .message {
        padding: 12px;
        background: #eef5de;
        color: #4b5c2b;
        border-radius: 10px;
        font-size: 11px;
      }
      @media (max-width: 600px) {
        .orders {
          padding: 37px 17px 60px;
        }
        .products {
          grid-template-columns: 1fr;
        }
        .list footer {
          flex-wrap: wrap;
        }
        .list footer > strong {
          margin-left: 0;
        }
        .list footer select {
          margin-left: auto;
        }
      }
    `,
  ],
})
export class OrdersPage {
  private readonly api = inject(Api);
  private readonly router = inject(Router);
  readonly auth = inject(AuthService);
  readonly received = computed(() => this.router.url.split('?')[0] === '/pedidos-recibidos');
  readonly orders = signal<Order[]>([]);
  readonly busy = signal(true);
  readonly hasMore = signal(false);
  readonly message = signal('');
  readonly confirmation = signal<{ title: string; message: string } | null>(null);
  private pendingAction: (() => void) | null = null;
  private page = 1;
  constructor() {
    this.load();
  }
  /** Recarga tantas páginas como hubiera abiertas, para no perder de vista el pedido que se acaba de cambiar. */
  load() {
    const pages = this.page;
    this.page = 1;
    this.fetch(pages);
  }
  loadMore() {
    this.page += 1;
    this.fetch(1, true);
  }
  private fetch(pagesToReload: number, append = false) {
    this.busy.set(true);
    this.api.get<{ data: Order[]; current_page: number; last_page: number }>(this.received() ? '/orders/received' : '/orders', { page: this.page }).subscribe({
      next: (r) => {
        this.orders.update((list) => (append || this.page > 1 ? [...list, ...(r.data ?? [])] : (r.data ?? [])));
        const more = (r.current_page ?? 1) < (r.last_page ?? 1);
        this.hasMore.set(more);
        if (more && pagesToReload > 1) {
          this.page += 1;
          this.fetch(pagesToReload - 1, true);
          return;
        }
        this.busy.set(false);
      },
      error: (e) => {
        this.busy.set(false);
        this.message.set(e.error?.message ?? 'No se pudieron cargar los pedidos.');
      },
    });
  }
  status(order: Order, select: HTMLSelectElement) {
    this.api
      .patch(`/orders/${order.id}/status`, { estado: select.value })
      .subscribe({
        next: () => {
          this.message.set(this.auth.isAdmin() && !this.received() ? 'Estado del pedido actualizado.' : 'Estado de tus artículos actualizado.');
          this.load();
        },
        error: (e) => {
          // Si se rechaza el cambio, el selector vuelve al estado real.
          select.value = this.selectedState(order);
          this.message.set(e.error?.message ?? 'No se pudo cambiar el estado.');
        },
      });
  }
  /** En "Pedidos recibidos" el vendedor gestiona sus artículos; en la vista de admin, el pedido entero. */
  selectedState(order: Order): string {
    if (this.showsMixedState(order)) return 'mixto';
    if (order.estado === 'cancelado' && !this.received()) return 'cancelado';
    return order.productos[0]?.estado_envio || 'preparando';
  }
  showsMixedState(order: Order): boolean {
    return !this.received() && order.estado !== 'cancelado' && new Set(order.productos.map((p) => p.estado_envio)).size > 1;
  }
  locked(order: Order): boolean {
    return order.estado === 'cancelado' || (order.productos.length > 0 && order.productos.every((p) => p.recibido_confirmado_at));
  }
  orderDate(order: Order): string {
    return (order.created_at ?? '').replace(' ', 'T');
  }
  itemLabel(order: Order, product: Order['productos'][number]): string {
    if (product.recibido_confirmado_at) return 'Recibido';
    if (order.estado === 'cancelado') return 'Cancelado';
    return this.statusLabel(product.estado_envio === 'entregado' ? 'marcado_entregado' : product.estado_envio);
  }
  confirmReceived(order: Order, product: Order['productos'][number]) {
    this.api.patch(`/orders/${order.id}/items/${product.detalle_id}/confirm-received`, {}).subscribe({
      next: () => {
        this.message.set(`Has confirmado la recepción de «${product.nombre}».`);
        this.load();
      },
      error: (e) => this.message.set(e.error?.message ?? 'No se pudo confirmar la recepción.'),
    });
  }
  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      preparando: 'Preparando',
      enviado: 'Enviado',
      entregado: 'Entregado',
      marcado_entregado: 'Entregado por el vendedor, pendiente de confirmar',
      pendiente_confirmacion: 'Pendiente de confirmar recepción',
      entrega_parcial: 'Entrega parcial',
      cancelado: 'Cancelado',
    };
    return labels[status] ?? status;
  }
  cancel(order: Order) {
    this.pendingAction = () =>
      this.api.post(`/orders/${order.id}/cancel`, {}).subscribe({
        next: () => {
          this.message.set('Pedido cancelado.');
          this.load();
        },
        error: (e) => this.message.set(e.error?.message ?? 'No se pudo cancelar.'),
      });
    this.confirmation.set({
      title: 'Cancelar pedido',
      message: `¿Quieres cancelar el pedido #${order.id}?`,
    });
  }
  dismissConfirmation() {
    this.confirmation.set(null);
    this.pendingAction = null;
  }
  confirmCancellation() {
    const action = this.pendingAction;
    this.dismissConfirmation();
    action?.();
  }
  download(order: Order, product: Order['productos'][number]) {
    this.api.download(`/orders/${order.id}/products/${product.id}/download`).subscribe({
      next: (response) => {
        const url = URL.createObjectURL(response.body!);
        const link = document.createElement('a');
        // El archivo se guarda con el nombre del producto y la extensión real.
        const extension = /\.[a-z0-9]+(?=["';\s]|$)/i.exec(response.headers.get('Content-Disposition') ?? '')?.[0] ?? '';
        link.href = url;
        link.download = product.nombre + extension;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      },
      error: () => this.message.set('No se ha podido descargar este archivo.'),
    });
  }
  image(path: string | null) {
    return assetUrl(path ?? undefined, 'media/no-item.png');
  }
}
