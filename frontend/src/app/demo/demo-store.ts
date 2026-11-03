import { DEMO_SEED } from './demo-seed';

export type Row = Record<string, any>;

const STORAGE_KEY = 'artistapp_demo_db_v1';
export const DEMO_PASSWORD = 'Usuario123';

/** Error HTTP con el mismo formato JSON que la API Spring Boot: {message, errors?}. */
export class ApiFail {
  constructor(readonly status: number, readonly body: { message: string; errors?: Record<string, string[]> }) {}
}

export function fail(status: number, message?: string, errors?: Record<string, string[]>): never {
  const fallback = status === 404 ? 'No encontrado.' : status === 403 ? 'Esta acción no está autorizada.' : status === 401 ? 'Unauthenticated.' : 'Error.';
  throw new ApiFail(status, errors ? { message: message ?? fallback, errors } : { message: message ?? fallback });
}

export function ensure(condition: unknown, status: number, message?: string): void {
  if (!condition) fail(status, message);
}

export function nowStamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function today(): string {
  return nowStamp().slice(0, 10);
}

/**
 * Base de datos en memoria para la demo de GitHub Pages: parte del SQL de muestra y
 * guarda los cambios en localStorage del navegador (cada visitante tiene su propia copia).
 */
export class DemoStore {
  private tables: Record<string, Row[]>;

  constructor() {
    this.tables = this.read() ?? DemoStore.initial();
  }

  private static initial(): Record<string, Row[]> {
    const tables: Record<string, Row[]> = JSON.parse(JSON.stringify(DEMO_SEED));
    for (const user of tables['usuarios']) user['contrasena'] = DEMO_PASSWORD;
    for (const name of ['cesta', 'cesta_producto', 'app_notifications', 'publication_comments', 'event_chat_messages', 'direct_messages', 'tokens']) tables[name] ??= [];
    // Mismo relleno que la migración de estado por artículo de la API.
    for (const detail of tables['detalles_pedido']) {
      const order = tables['pedidos'].find(o => o['id'] === detail['id_pedido']);
      const state = ['preparando', 'enviado', 'entregado'].includes(order?.['estado']) ? order!['estado'] : 'preparando';
      detail['estado_envio'] = state;
      detail['recibido_confirmado_at'] = state === 'entregado' ? nowStamp() : null;
      const product = tables['productos'].find(p => p['id'] === detail['id_producto']);
      detail['nombre_producto'] = product?.['nombre'] ?? null;
      detail['precio_unitario'] = product?.['precio'] ?? null;
    }
    for (const user of tables['usuarios']) {
      tables['app_notifications'].push({
        id: tables['app_notifications'].length + 1, user_id: user['id'], type: 'bienvenida', title: '¡Te damos la bienvenida a la demo de ArtistApp!',
        message: 'Esta demo funciona por completo en tu navegador: los cambios se guardan solo en este dispositivo.', link: '/descubrir',
        read_at: null, created_at: nowStamp(), updated_at: nowStamp()
      });
    }
    return tables;
  }

  private read(): Record<string, Row[]> | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tables));
    } catch {
      // Sin espacio o almacenamiento bloqueado: la demo sigue funcionando en memoria.
    }
  }

  reset(): void {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* sin almacenamiento */ }
    this.tables = DemoStore.initial();
  }

  t(name: string): Row[] {
    return (this.tables[name] ??= []);
  }

  find(name: string, id: number): Row | undefined {
    return this.t(name).find(row => row['id'] === id);
  }

  findOrFail(name: string, id: number): Row {
    return this.find(name, id) ?? fail(404);
  }

  insert(name: string, row: Row): Row {
    const table = this.t(name);
    const id = table.reduce((max, item) => Math.max(max, Number(item['id']) || 0), 0) + 1;
    const created = { id, ...row };
    table.push(created);
    return created;
  }

  remove(name: string, predicate: (row: Row) => boolean): number {
    const table = this.t(name);
    const before = table.length;
    this.tables[name] = table.filter(row => !predicate(row));
    return before - this.tables[name].length;
  }

  user(id: number): Row | undefined {
    return this.find('usuarios', id);
  }
}

export function paginate(rows: Row[], perPage: number, query: Record<string, string>): Row {
  const total = rows.length;
  const page = Math.max(1, parseInt(query['page'] ?? '1', 10) || 1);
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const data = rows.slice((page - 1) * perPage, page * perPage);
  return {
    current_page: page, data, from: data.length ? (page - 1) * perPage + 1 : null, last_page: lastPage,
    next_page_url: page < lastPage ? `?page=${page + 1}` : null, per_page: perPage,
    prev_page_url: page > 1 ? `?page=${page - 1}` : null, to: data.length ? (page - 1) * perPage + data.length : null, total
  };
}

export const by = <T extends Row>(key: string, desc = false) => (a: T, b: T) => {
  const x = a[key] ?? '';
  const y = b[key] ?? '';
  const result = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'es');
  return desc ? -result : result;
};

export const like = (value: unknown, search: string) => String(value ?? '').toLowerCase().includes(search.toLowerCase());
