import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Api } from '../core/api';
import { assetUrl } from '../core/asset-url';
import { CartState } from '../core/cart-state';
import { AuthService } from '../core/auth.service';

type Product = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number | string;
  cantidad: number;
  imagen: string;
  artist_name: string;
  type_name: string;
};
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './shop-page.html',
  styleUrl: './shop-page.css',
})
export class ShopPage {
  private readonly api = inject(Api);
  private readonly cart = inject(CartState);
  readonly auth = inject(AuthService);
  readonly products = signal<Product[]>([]);
  readonly query = signal('');
  readonly type = signal('');
  readonly price = signal('');
  readonly busy = signal(false);
  readonly message = signal('');
  readonly selectedProduct = signal<Product | null>(null);
  readonly pageNumber = signal(1);
  readonly totalPages = signal(1);
  private page = 1;
  private requestVersion = 0;
  constructor() {
    this.load();
  }
  load() {
    this.goToPage(1);
  }
  goToPage(page: number) {
    if (this.busy() || page < 1 || (this.totalPages() > 1 && page > this.totalPages())) return;
    this.page = page;
    this.pageNumber.set(page);
    const version = ++this.requestVersion;
    this.busy.set(true);
    this.message.set('');
    const params: Record<string, string | number> = { disponible: 'true', page };
    if (this.query().trim()) params['q'] = this.query().trim();
    if (this.type()) params['tipo'] = this.type();
    if (this.price()) params['precio'] = this.price();
    this.api
      .get<{ data: Product[]; current_page: number; last_page: number }>('/products', params)
      .subscribe({
        next: (r) => {
          if (version !== this.requestVersion) return;
          this.products.set(r.data ?? []);
          this.page = Number(r.current_page ?? page);
          this.pageNumber.set(this.page);
          this.totalPages.set(Math.max(1, Number(r.last_page ?? 1)));
          this.busy.set(false);
        },
        error: (e) => {
          if (version !== this.requestVersion) return;
          this.busy.set(false);
          this.message.set(e.error?.message ?? 'No se pudo conectar con la tienda.');
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
  selectProduct(product: Product) {
    this.selectedProduct.set(product);
  }
  add(product: Product) {
    if (!this.auth.isAuthenticated()) return;
    this.api.post(`/cart/items/${product.id}`, {}).subscribe({
      next: () => {
        this.cart.refresh();
        this.message.set(`${product.nombre} añadido a la cesta.`);
      },
      error: (e) => this.message.set(e.error?.message ?? 'No se pudo añadir este producto.'),
    });
  }
  image(path: string) {
    return assetUrl(path, 'media/no-item.png');
  }
  imageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (!img.src.endsWith('media/no-item.png')) img.src = 'media/no-item.png';
  }
}
