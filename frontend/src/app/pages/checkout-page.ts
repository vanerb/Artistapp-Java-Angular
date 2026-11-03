import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Api } from '../core/api';
import { CartState } from '../core/cart-state';
type Item = { id: number; nombre: string; precio: number | string };
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.css',
})
export class CheckoutPage {
  private readonly api = inject(Api);
  private readonly router = inject(Router);
  private readonly cart = inject(CartState);
  readonly items = signal<Item[]>([]);
  readonly shipping = signal(0);
  readonly total = signal(0);
  readonly busy = signal(false);
  readonly message = signal('');
  form = { nombre: '', direccion: '', telefono: '' };
  constructor() {
    this.api.get<{ items: Item[]; envio: number; total: number }>('/cart').subscribe({
      next: (r) => {
        this.items.set(r.items);
        this.shipping.set(r.envio);
        this.total.set(r.total);
        if (!r.items.length) void this.router.navigateByUrl('/tienda');
      },
      error: () => this.message.set('No se pudo cargar tu cesta.'),
    });
  }
  submit() {
    this.busy.set(true);
    this.message.set('');
    this.api.post<{ order: { id: number } }>('/checkout', this.form).subscribe({
      next: (r) => {
        this.busy.set(false);
        this.cart.count.set(0);
        this.message.set(`Pedido #${r.order.id} creado. Gracias por apoyar el arte independiente.`);
        setTimeout(() => void this.router.navigateByUrl('/pedidos'), 1200);
      },
      error: (e) => {
        this.busy.set(false);
        this.message.set(e.error?.message ?? 'No se pudo crear el pedido.');
      },
    });
  }
}
