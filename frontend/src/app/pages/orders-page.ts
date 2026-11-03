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
  templateUrl: './orders-page.html',
  styleUrl: './orders-page.css',
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
