import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { OrdersPage } from './orders-page';

const product = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  detalle_id: 10,
  nombre: 'Lámina',
  imagen: 'img/a.jpg',
  precio: 10,
  id_tipo: 1,
  seller_name: 'artista-uno',
  estado_envio: 'preparando',
  recibido_confirmado_at: null,
  ...overrides,
});

const order = (overrides: Record<string, unknown> = {}) => ({
  id: 7,
  nombre: 'Vera',
  estado: 'preparando',
  direccion: 'Calle 1',
  pago: 14,
  productos: [product()],
  ...overrides,
});

describe('OrdersPage', () => {
  let page: OrdersPage;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    page = TestBed.createComponent(OrdersPage).componentInstance;
  });

  it('distingue lo entregado por el vendedor de lo recibido por el comprador', () => {
    const delivered = product({ estado_envio: 'entregado' });
    expect(page.itemLabel(order() as never, delivered as never)).toContain('pendiente de confirmar');
    expect(page.itemLabel(order() as never, { ...delivered, recibido_confirmado_at: '2026-01-01 10:00:00' } as never)).toBe('Recibido');
    expect(page.statusLabel('entregado')).toBe('Entregado');
  });

  it('los artículos de un pedido cancelado se muestran como cancelados', () => {
    expect(page.itemLabel(order({ estado: 'cancelado' }) as never, product() as never)).toBe('Cancelado');
  });

  it('bloquea el selector en pedidos cancelados o totalmente recibidos', () => {
    expect(page.locked(order() as never)).toBe(false);
    expect(page.locked(order({ estado: 'cancelado' }) as never)).toBe(true);
    expect(page.locked(order({ productos: [product({ recibido_confirmado_at: 'x' })] }) as never)).toBe(true);
    expect(page.locked(order({ productos: [product({ recibido_confirmado_at: 'x' }), product({ detalle_id: 11 })] }) as never)).toBe(false);
  });

  it('muestra "varios estados" si los vendedores van a ritmos distintos', () => {
    const mixed = order({ productos: [product({ estado_envio: 'enviado' }), product({ detalle_id: 11 })] });
    expect(page.showsMixedState(mixed as never)).toBe(true);
    expect(page.selectedState(mixed as never)).toBe('mixto');
    expect(page.selectedState(order({ estado: 'cancelado' }) as never)).toBe('cancelado');
  });

  it('pagina los pedidos sin perder los ya cargados', () => {
    http.expectOne(r => r.url === '/api/orders' && r.params.get('page') === '1').flush({ data: [order()], current_page: 1, last_page: 2 });
    expect(page.hasMore()).toBe(true);

    page.loadMore();
    http.expectOne(r => r.params.get('page') === '2').flush({ data: [order({ id: 8 })], current_page: 2, last_page: 2 });
    expect(page.orders().map(o => o.id)).toEqual([7, 8]);
    expect(page.hasMore()).toBe(false);
  });
});
