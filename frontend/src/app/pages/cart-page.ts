import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Api } from '../core/api';
import { assetUrl } from '../core/asset-url';
import { CartState } from '../core/cart-state';
type CartItem = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number | string;
  imagen: string;
  cantidad: number;
  artist_name: string;
};
@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.css',
})
export class CartPage {
  private readonly api = inject(Api);
  private readonly cart = inject(CartState);
  readonly items = signal<CartItem[]>([]);
  readonly subtotal = signal(0);
  readonly shipping = signal(0);
  readonly total = signal(0);
  readonly busy = signal(true);
  readonly message = signal('');
  constructor() {
    this.load();
  }
  load() {
    this.busy.set(true);
    this.api
      .get<{ items: CartItem[]; subtotal: number; envio: number; total: number }>('/cart')
      .subscribe({
        next: (r) => {
          this.items.set(r.items ?? []);
          this.subtotal.set(r.subtotal);
          this.shipping.set(r.envio);
          this.total.set(r.total);
          this.cart.count.set(r.items?.length ?? 0);
          this.busy.set(false);
        },
        error: () => {
          this.busy.set(false);
          this.message.set('No se pudo cargar la cesta.');
        },
      });
  }
  remove(item: CartItem) {
    this.api
      .delete<{ items: CartItem[]; subtotal: number; envio: number; total: number }>(
        `/cart/items/${item.id}`,
      )
      .subscribe({
        next: (r) => {
          this.items.set(r.items ?? []);
          this.subtotal.set(r.subtotal);
          this.shipping.set(r.envio);
          this.total.set(r.total);
          this.cart.count.set(r.items?.length ?? 0);
        },
        error: () => this.message.set('No se pudo quitar este artículo.'),
      });
  }
  hasSoldOut() {
    return this.items().some((item) => item.cantidad < 1);
  }
  image(path: string) {
    return assetUrl(path);
  }
}
