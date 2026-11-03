import { DemoApi } from './demo-api';
import { ApiFail, DemoStore } from './demo-store';

/**
 * La demo repite en TypeScript las reglas de la API Java: estos casos son los mismos que
 * backend/src/test/java/com/artistapp/OrderFlowTest.java. Un cambio de reglas debe tocar ambos.
 */
describe('DemoApi: pedidos con varios vendedores', () => {
  const ARTIST = 44;
  const PHYSICAL_A = 387;
  const PHYSICAL_B = 332;
  let store: DemoStore;
  let api: DemoApi;
  let buyer: string, sellerA: string, sellerB: string, admin: string;

  const call = async (token: string | null, method: string, path: string, body: Record<string, unknown> = {}) => {
    try {
      const response = await api.handle({ method, path, query: {}, body, files: {}, token });
      return { status: response.status, json: response.body as any, filename: response.filename };
    } catch (error) {
      if (error instanceof ApiFail) return { status: error.status, json: error.body as any, filename: undefined };
      throw error;
    }
  };
  const login = async (user: string) => (await call(null, 'POST', '/auth/login', { user, password: 'Usuario123' })).json.token as string;
  const stock = (id: number) => store.find('productos', id)!['cantidad'];
  const order = async (...ids: number[]) => {
    for (const id of ids) await call(buyer, 'POST', `/cart/items/${id}`);
    return (await call(buyer, 'POST', '/checkout', { nombre: 'V', direccion: 'D', telefono: '600000000' })).json.order;
  };
  const setStatus = async (token: string, id: number, estado: string) => (await call(token, 'PATCH', `/orders/${id}/status`, { estado })).status;
  const view = async (id: number) => (await call(buyer, 'GET', '/orders')).json.data.find((o: any) => o.id === id);
  const line = async (id: number, product: number) => (await view(id)).productos.find((p: any) => p.id === product);
  const confirm = async (id: number, product: number) =>
    (await call(buyer, 'PATCH', `/orders/${id}/items/${(await line(id, product)).detalle_id}/confirm-received`)).status;

  beforeEach(async () => {
    localStorage.clear();
    store = new DemoStore();
    api = new DemoApi(store);
    buyer = await login('visitante-uno');
    sellerA = await login('artista-uno');
    sellerB = await login('organizador-demo');
    admin = await login('admin-demo');
  });

  it('deriva el estado de los artículos de cada vendedor', async () => {
    const { id } = await order(PHYSICAL_A, PHYSICAL_B);
    expect((await view(id)).estado).toBe('preparando');
    await setStatus(sellerA, id, 'enviado');
    expect((await view(id)).estado).toBe('enviado');
    await setStatus(sellerA, id, 'entregado');
    expect((await view(id)).estado).toBe('entrega_parcial');
    expect(await confirm(id, PHYSICAL_A)).toBe(200);
    expect(await setStatus(sellerA, id, 'preparando')).toBe(422);
    await setStatus(sellerB, id, 'entregado');
    expect((await view(id)).estado).toBe('pendiente_confirmacion');
    await confirm(id, PHYSICAL_B);
    expect((await view(id)).estado).toBe('entregado');
  });

  it('el comprador solo cancela mientras nada haya salido', async () => {
    const before = stock(PHYSICAL_A);
    const first = await order(PHYSICAL_A);
    expect((await call(buyer, 'POST', `/orders/${first.id}/cancel`)).status).toBe(200);
    expect(stock(PHYSICAL_A)).toBe(before);

    const shipped = await order(PHYSICAL_A, PHYSICAL_B);
    await setStatus(sellerA, shipped.id, 'enviado');
    expect((await call(buyer, 'POST', `/orders/${shipped.id}/cancel`)).status).toBe(422);
  });

  it('administración respeta lo entregado y lo confirmado', async () => {
    const [a, b] = [stock(PHYSICAL_A), stock(PHYSICAL_B)];
    const { id } = await order(PHYSICAL_A, PHYSICAL_B);
    await setStatus(sellerA, id, 'entregado');
    expect(await setStatus(admin, id, 'enviado')).toBe(422);
    expect(await setStatus(admin, id, 'cancelado')).toBe(200);
    expect(stock(PHYSICAL_A)).toBe(a - 1);
    expect(stock(PHYSICAL_B)).toBe(b);

    const confirmed = await order(PHYSICAL_B);
    await setStatus(sellerB, confirmed.id, 'entregado');
    await confirm(confirmed.id, PHYSICAL_B);
    expect(await setStatus(admin, confirmed.id, 'cancelado')).toBe(422);
  });

  it('el histórico conserva el precio y el nombre de compra', async () => {
    const { id } = await order(PHYSICAL_B);
    const product = store.find('productos', PHYSICAL_B)!;
    const price = product['precio'];
    product['precio'] = 99;
    product['nombre'] = 'Otro';
    const item = await line(id, PHYSICAL_B);
    expect(item.precio).toBe(price);
    expect(item.nombre).not.toBe('Otro');
    expect((await view(id)).created_at).toBeTruthy();
  });

  it('libera cada archivo digital cuando lo entrega su vendedor', async () => {
    const digital = store.t('productos').find(p => p['id_tipo'] === 2 && p['id_usuario'] === ARTIST)!;
    digital['archivos'] = { name: 'obra.txt', type: 'text/plain', data: null };
    const { id } = await order(digital['id'], PHYSICAL_B);
    const path = `/orders/${id}/products/${digital['id']}/download`;
    expect((await call(buyer, 'GET', path)).status).toBe(403);
    await setStatus(sellerA, id, 'entregado');
    const download = await call(buyer, 'GET', path);
    expect(download.status).toBe(200);
    expect(download.filename).toBe('obra.txt');
    expect((await view(id)).estado).toBe('entrega_parcial');
  });

  it('borrar un pedido entregado no devuelve stock', async () => {
    const { id } = await order(PHYSICAL_B);
    await setStatus(sellerB, id, 'entregado');
    await confirm(id, PHYSICAL_B);
    const before = stock(PHYSICAL_B);
    expect((await call(admin, 'DELETE', `/orders/${id}`)).status).toBe(200);
    expect(stock(PHYSICAL_B)).toBe(before);
  });

  it('no borra a quien tiene ventas pendientes y conserva las terminadas', async () => {
    const { id } = await order(PHYSICAL_A);
    expect((await call(admin, 'DELETE', `/admin/users/${ARTIST}`)).status).toBe(422);
    await setStatus(sellerA, id, 'entregado');
    await confirm(id, PHYSICAL_A);
    for (const detail of store.t('detalles_pedido')) detail['recibido_confirmado_at'] ??= '2026-01-01 00:00:00';
    expect((await call(admin, 'DELETE', `/admin/users/${ARTIST}`)).status).toBe(200);
    const item = await line(id, PHYSICAL_A);
    expect(item.nombre).toBeTruthy();
    expect(item.imagen).toBeNull();
  });

  it('avisa a la otra parte', async () => {
    const { id } = await order(PHYSICAL_A);
    const titles = async (token: string) => (await call(token, 'GET', '/notifications')).json.data.data.map((n: any) => n.title);
    expect(await titles(sellerA)).toContain(`Nuevo pedido #${id}`);
    await setStatus(sellerA, id, 'enviado');
    expect(await titles(buyer)).toContain(`Tu pedido #${id} ha cambiado`);
  });

  it('nadie compra sus propios productos', async () => {
    const response = await call(sellerA, 'POST', `/cart/items/${PHYSICAL_A}`);
    expect(response.status).toBe(422);
    expect(response.json.message).toContain('propios productos');
  });

  it('protege las fechas y los participantes de los eventos', async () => {
    const event = store.t('eventos').find(e => e['id_usuario'] === 13)!;
    expect((await call(sellerB, 'PATCH', `/events/${event['id']}`, { fecha_fin: '2000-01-01' })).status).toBe(422);
    expect((await call(buyer, 'GET', `/events/${event['id']}/participants`)).status).toBe(403);
    expect((await call(sellerB, 'GET', `/events/${event['id']}/participants`)).status).toBe(200);
  });

  it('borrar contenido no deja datos huérfanos', async () => {
    const post = store.t('publicaciones').find(p => p['id_usuario'] === ARTIST && p['tipo'] === 'public')!;
    await call(buyer, 'POST', `/publications/${post['id']}/comments`, { body: 'c' });
    await call(sellerA, 'DELETE', `/publications/${post['id']}`);
    expect(store.t('publication_comments').filter(c => c['publication_id'] === post['id'])).toHaveLength(0);
  });
});
