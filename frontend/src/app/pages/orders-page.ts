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
  fecha?: string;
  pago: number | string;
  productos: {
    id: number;
    nombre: string;
    imagen: string;
    precio: number | string;
    id_tipo: number;
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
            </div>
            <span
              class="status"
              [class.sent]="order.estado === 'enviado'"
              [class.done]="order.estado === 'entregado'"
              >{{ statusLabel(order.estado) }}</span
            >
          </header>
          <div class="products">
            @for (product of order.productos; track product.id) {
              <div>
                <img [src]="image(product.imagen)" [alt]="product.nombre" loading="lazy" />
                <span>
                  {{ product.nombre }}
                  <small class="item-status">{{ statusLabel(product.estado_envio) }}{{ product.recibido_confirmado_at ? ' · Recepción confirmada' : '' }}</small>
                </span>
                <strong>{{ product.precio | currency: 'EUR' }}</strong>
                @if (!received() && !auth.isAdmin() && order.estado !== 'cancelado' && product.estado_envio === 'entregado' && !product.recibido_confirmado_at) {
                  <button class="confirm-received" (click)="confirmReceived(order, product)">Confirmar recepción</button>
                }
                @if (!received() && product.id_tipo === 2 && order.estado === 'entregado') {
                  <button (click)="download(order, product)">Descargar</button>
                }
              </div>
            }
          </div>
          <footer>
            <span>{{ received() ? 'Entrega a: ' + order.nombre + ' · ' + order.direccion : order.direccion }}</span
            ><strong>{{ (received() ? (order.total_vendedor ?? 0) : order.pago) | currency: 'EUR' }}</strong>
            @if (auth.isAdmin() || received()) {
              <select #state [value]="order.productos[0]?.estado_envio || 'preparando'" (change)="status(order, state.value)">
                <option value="preparando">Preparando</option>
                <option value="enviado">Enviado</option>
                <option value="entregado">Entregado</option>
                @if (auth.isAdmin()) {
                  <option value="cancelado">Cancelado</option>
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
  readonly message = signal('');
  readonly confirmation = signal<{ title: string; message: string } | null>(null);
  private pendingAction: (() => void) | null = null;
  constructor() {
    this.load();
  }
  load() {
    this.busy.set(true);
    this.api.get<{ data: Order[] }>(this.received() ? '/orders/received' : '/orders').subscribe({
      next: (r) => {
        this.orders.set(r.data ?? []);
        this.busy.set(false);
      },
      error: (e) => {
        this.busy.set(false);
        this.message.set(e.error?.message ?? 'No se pudieron cargar los pedidos.');
      },
    });
  }
  status(order: Order, state: string) {
    this.api
      .patch(`/orders/${order.id}/status`, { estado: state })
      .subscribe({
        next: () => {
          this.message.set('Estado de tus artículos actualizado.');
          this.load();
        },
        error: (e) => {
          this.message.set(e.error?.message ?? 'No se pudo cambiar el estado.');
          this.load();
        },
      });
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
      entregado: 'Marcado como entregado',
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
          this.orders.update((list) =>
            list.map((item) => (item.id === order.id ? { ...item, estado: 'cancelado' } : item)),
          );
          this.message.set('Pedido cancelado.');
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
      next: (file) => {
        const url = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.download = product.nombre;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      },
      error: () => this.message.set('No se ha podido descargar este archivo.'),
    });
  }
  image(path: string) {
    return assetUrl(path);
  }
}
