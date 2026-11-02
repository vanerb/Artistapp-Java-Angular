import { DEMO_PASSWORD, DemoStore, Row, by, ensure, fail, like, nowStamp, paginate, today } from './demo-store';
import { RequestData, validate } from './demo-validation';
import { digitalFile, downloadBlob, imageDataUrl } from './demo-files';

/**
 * Réplica en el navegador de la API REST de Spring Boot (mismas rutas, permisos y respuestas)
 * para que la demo de GitHub Pages funcione sin servidor.
 */
export interface DemoRequest extends RequestData {
  method: string;
  path: string;
  query: Record<string, string>;
  token: string | null;
}

export interface DemoResponse {
  status: number;
  body: unknown;
}

interface Ctx extends DemoRequest {
  params: number[];
  viewer: Row | null;
}

type Handler = (ctx: Ctx) => unknown | Promise<unknown>;

const ADMIN = 1;
const NO_FILES = 'Sin archivos';
const SHIPPING = 4;
const PUBLIC_USER = ['id', 'nombre', 'apellidos', 'usuario', 'correo', 'id_tipo', 'imagen', 'biografia'];

export class DemoApi {
  private readonly routes: { method: string; pattern: RegExp; handler: Handler }[] = [];

  constructor(private readonly db: DemoStore) {
    this.registerRoutes();
  }

  async handle(request: DemoRequest): Promise<DemoResponse> {
    for (const route of this.routes) {
      const match = route.method === request.method && route.pattern.exec(request.path);
      if (!match) continue;
      const ctx: Ctx = { ...request, params: match.slice(1).map(Number), viewer: this.resolveUser(request.token) };
      const result = await route.handler(ctx);
      this.db.save();
      if (result instanceof Created) return { status: 201, body: result.body };
      return { status: 200, body: result };
    }
    fail(404);
  }

  reset(): void {
    this.db.reset();
  }

  // ---------------------------------------------------------------- utilidades

  private on(method: string, path: string, handler: Handler): void {
    const pattern = new RegExp('^' + path.replace(/:\w+/g, '(\\d+)') + '$');
    this.routes.push({ method, pattern, handler });
  }

  private resolveUser(token: string | null): Row | null {
    if (!token) return null;
    const entry = this.db.t('tokens').find(row => row['token'] === token);
    return entry ? this.db.user(entry['user_id']) ?? null : null;
  }

  private auth(ctx: Ctx): Row {
    return ctx.viewer ?? fail(401);
  }

  private isAdmin(user: Row | null): boolean {
    return Number(user?.['id_tipo']) === ADMIN;
  }

  private publicUser(user: Row): Row {
    return Object.fromEntries(PUBLIC_USER.map(key => [key, user[key]]));
  }

  private session(user: Row): Row {
    const token = `${Date.now()}|${crypto.getRandomValues(new Uint32Array(4)).join('')}`;
    this.db.t('tokens').push({ token, user_id: user['id'] });
    return { user: this.publicUser(user), token };
  }

  private notify(userIds: number[], type: string, title: string, message: string, link: string | null): void {
    const stamp = nowStamp();
    for (const userId of new Set(userIds)) {
      this.db.insert('app_notifications', { user_id: userId, type, title, message, link, read_at: null, created_at: stamp, updated_at: stamp });
    }
  }

  private followers(artistId: number): number[] {
    return this.db.t('favoritos').filter(f => f['id_usuariopin'] === artistId).map(f => f['id_usuario']);
  }

  private owner(row: Row, user: Row): void {
    ensure(row['id_usuario'] === user['id'] || this.isAdmin(user), 403);
  }

  private v(ctx: Ctx, rules: Record<string, string>): Row {
    return validate(this.db, ctx, rules);
  }

  private registerRoutes(): void {
    this.authRoutes();
    this.userRoutes();
    this.publicationRoutes();
    this.eventRoutes();
    this.communityRoutes();
    this.catalogRoutes();
    this.shopRoutes();
    this.orderRoutes();
    this.adminRoutes();
  }

  // ---------------------------------------------------------------- autenticación

  private authRoutes(): void {
    this.on('POST', '/auth/login', ctx => {
      const data = this.v(ctx, { user: 'required|string|max:255', password: 'required|string|max:240' });
      const user = this.db.t('usuarios').find(u => u['usuario'] === data['user'] || u['correo'] === data['user']);
      if (!user || user['contrasena'] !== data['password']) fail(422, 'Usuario o contraseña incorrectos.');
      return this.session(user);
    });

    this.on('POST', '/auth/register', ctx => {
      const data = this.v(ctx, {
        nombre: 'required|string|max:100', apellidos: 'required|string|max:140',
        usuario: 'required|string|max:100|unique:usuarios,usuario', correo: 'required|email|max:240|unique:usuarios,correo',
        password: 'required|string|min:8|max:240|confirmed|strong', id_tipo: 'required|integer|in:3,5,7'
      });
      const user = this.db.insert('usuarios', {
        nombre: data['nombre'], apellidos: data['apellidos'], usuario: data['usuario'], correo: String(data['correo']).toLowerCase(),
        contrasena: data['password'], id_tipo: data['id_tipo'], imagen: 'media/no-user.png', biografia: 'Aún no tiene'
      });
      this.notify([user['id']], 'bienvenida', '¡Te damos la bienvenida a ArtistApp!', 'Tu espacio creativo ya está listo. Descubre artistas, comparte tu obra y participa en eventos.', '/descubrir');
      return this.session(user);
    });

    this.on('GET', '/auth/me', ctx => ({ user: this.publicUser(this.auth(ctx)) }));

    this.on('POST', '/auth/logout', ctx => {
      this.db.remove('tokens', row => row['token'] === ctx.token);
      return { message: 'Sesión cerrada.' };
    });

    this.on('POST', '/auth/forgot-password', ctx => {
      this.v(ctx, { correo: 'required|email|max:240' });
      return { message: `Si existe una cuenta con ese correo, recibirás un enlace para recuperar el acceso. (En la demo no se envían correos: todas las cuentas usan ${DEMO_PASSWORD}.)` };
    });

    this.on('POST', '/auth/reset-password', ctx => {
      this.v(ctx, { correo: 'required|email', token: 'required|string', password: 'required|string|min:8|max:240|confirmed|strong' });
      fail(422, 'El enlace no es válido o ha caducado.');
    });
  }

  // ---------------------------------------------------------------- usuarios y perfiles

  private userRoutes(): void {
    this.on('GET', '/users', ctx => {
      const viewer = ctx.viewer;
      let rows = this.db.t('usuarios').filter(u => !viewer || u['id'] !== viewer['id']);
      if (ctx.query['q']) rows = rows.filter(u => like(u['usuario'], ctx.query['q']) || like(u['nombre'], ctx.query['q']));
      if (ctx.query['tipo']) rows = rows.filter(u => u['id_tipo'] === Number(ctx.query['tipo']));
      const followed = new Set(viewer ? this.db.t('favoritos').filter(f => f['id_usuario'] === viewer['id']).map(f => f['id_usuariopin']) : []);
      const data = rows.sort(by('usuario')).map(u => ({
        id: u['id'], nombre: u['nombre'], apellidos: u['apellidos'], usuario: u['usuario'], id_tipo: u['id_tipo'],
        imagen: u['imagen'], biografia: u['biografia'], followed_by_me: followed.has(u['id']) ? 1 : 0
      }));
      return paginate(data, 24, ctx.query);
    });

    this.on('GET', '/users/:id', ctx => {
      const [id] = ctx.params;
      const found = this.db.findOrFail('usuarios', id);
      const user: Row = { id, nombre: found['nombre'], apellidos: found['apellidos'], usuario: found['usuario'], id_tipo: found['id_tipo'], imagen: found['imagen'], biografia: found['biografia'] };
      const perPage = 6;
      const page = (key: string) => Math.max(1, parseInt(ctx.query[key] ?? '1', 10) || 1);
      const slice = (rows: Row[], p: number) => rows.slice((p - 1) * perPage, p * perPage);
      const info = (p: number, total: number) => ({ page: p, per_page: perPage, total, last_page: Math.max(1, Math.ceil(total / perPage)) });
      const works = this.db.t('publicaciones').filter(p => p['id_usuario'] === id && p['tipo'] === 'public').sort(by('id', true));
      const notices = this.db.t('avisos').filter(a => a['id_usuario'] === id).sort(by('id', true));
      const events = this.db.t('eventos').filter(e => e['id_usuario'] === id).sort(by('fecha_inicio', true))
        .map(e => (ctx.viewer ? { ...e, participation_status: this.participation(e['id'], ctx.viewer['id']) } : e));
      user['publicaciones'] = slice(works, page('obras_page'));
      user['avisos'] = slice(notices, page('avisos_page'));
      user['eventos'] = slice(events, page('eventos_page'));
      user['pagination'] = { obras: info(page('obras_page'), works.length), avisos: info(page('avisos_page'), notices.length), eventos: info(page('eventos_page'), events.length) };
      const favorites = this.db.t('favoritos');
      user['fijado'] = !!ctx.viewer && favorites.some(f => f['id_usuario'] === ctx.viewer!['id'] && f['id_usuariopin'] === id);
      user['seguidores_count'] = new Set(favorites.filter(f => f['id_usuariopin'] === id).map(f => f['id_usuario'])).size;
      user['seguidos_count'] = new Set(favorites.filter(f => f['id_usuario'] === id).map(f => f['id_usuariopin'])).size;
      return user;
    });

    this.on('GET', '/users/:id/community', ctx => {
      const [id] = ctx.params;
      this.db.findOrFail('usuarios', id);
      const data = this.v(ctx, { tipo: 'required|in:seguidores,seguidos' });
      return paginate(this.community(id, data['tipo'] === 'seguidores'), 30, ctx.query);
    });

    this.on('GET', '/account', ctx => {
      const auth = this.auth(ctx);
      const id = auth['id'];
      const liked = new Set(this.db.t('megusta').filter(m => m['id_usuario'] === id && m['megusta'] === 1).map(m => m['id_publicacion']));
      return {
        ...this.publicUser(auth),
        publicaciones: this.db.t('publicaciones').filter(p => p['id_usuario'] === id).sort(by('id', true)),
        avisos: this.db.t('avisos').filter(a => a['id_usuario'] === id).sort(by('id', true)),
        eventos: this.db.t('listado_evento').filter(l => l['id_usuario'] === id)
          .map((l): Row => ({ ...this.db.find('eventos', l['id_evento']), participacion: l['estado'] })).filter(e => e['id']),
        eventos_propios: this.db.t('eventos').filter(e => e['id_usuario'] === id).sort(by('fecha_inicio', true)),
        productos: this.db.t('productos').filter(p => p['id_usuario'] === id).sort(by('id', true)).map(p => this.pick(p, ['id', 'nombre', 'descripcion', 'precio', 'cantidad', 'imagen', 'id_tipo'])),
        favoritos: this.community(id, false),
        seguidores: this.community(id, true),
        obras_favoritas: this.db.t('publicaciones').filter(p => liked.has(p['id']) && p['tipo'] === 'public').sort(by('id', true))
          .map(p => ({ ...this.pick(p, ['id', 'titulo', 'descripcion', 'imagen', 'megusta']), artist_name: this.db.user(p['id_usuario'])?.['usuario'] }))
      };
    });

    this.on('PATCH', '/account', async ctx => {
      const auth = this.auth(ctx);
      const data = this.v(ctx, {
        nombre: 'sometimes|required|string|max:100', apellidos: 'sometimes|required|string|max:140',
        usuario: `sometimes|required|string|max:100|unique:usuarios,usuario,${auth['id']}`,
        correo: `sometimes|required|email|max:240|unique:usuarios,correo,${auth['id']}`,
        biografia: 'sometimes|nullable|string|max:255', imagen: 'sometimes|image|max:8192',
        password_actual: 'sometimes|required_with:password|string', password: 'sometimes|required|string|min:8|confirmed|strong'
      });
      if (data['password']) {
        if ((data['password_actual'] ?? '') !== auth['contrasena']) fail(422, 'La contraseña actual no es correcta.');
        auth['contrasena'] = data['password'];
      }
      delete data['password'];
      delete data['password_actual'];
      if (data['imagen'] instanceof File) data['imagen'] = await imageDataUrl(data['imagen']);
      else delete data['imagen'];
      if ('biografia' in data && data['biografia'] === null) data['biografia'] = '';
      Object.assign(auth, data);
      return { user: this.publicUser(auth) };
    });

    this.on('POST', '/users/:id/favorite', ctx => {
      const auth = this.auth(ctx);
      const [id] = ctx.params;
      this.db.findOrFail('usuarios', id);
      if (id === auth['id']) fail(422, 'No puedes fijar tu propio perfil.');
      const match = (f: Row) => f['id_usuario'] === auth['id'] && f['id_usuariopin'] === id;
      if (this.db.t('favoritos').some(match)) {
        this.db.remove('favoritos', match);
        return { pinned: false };
      }
      this.db.insert('favoritos', { id_usuario: auth['id'], id_usuariopin: id });
      return { pinned: true };
    });
  }

  private community(id: number, followers: boolean): Row[] {
    const ids = new Set(this.db.t('favoritos')
      .filter(f => (followers ? f['id_usuariopin'] : f['id_usuario']) === id)
      .map(f => (followers ? f['id_usuario'] : f['id_usuariopin'])));
    return [...ids].map(userId => this.db.user(userId)).filter((u): u is Row => !!u)
      .map(u => this.pick(u, ['id', 'usuario', 'imagen', 'biografia'])).sort(by('usuario'));
  }

  private pick(row: Row, keys: string[]): Row {
    return Object.fromEntries(keys.map(key => [key, row[key]]));
  }

  private participation(eventId: number, userId: number): string | null {
    return this.db.t('listado_evento').find(l => l['id_evento'] === eventId && l['id_usuario'] === userId)?.['estado'] ?? null;
  }

  // ---------------------------------------------------------------- publicaciones

  private publicationRoutes(): void {
    this.on('GET', '/publications', ctx => {
      const viewer = ctx.viewer;
      let rows = this.db.t('publicaciones');
      if (!this.isAdmin(viewer)) rows = rows.filter(p => p['tipo'] === 'public');
      if (ctx.query['q']) rows = rows.filter(p => like(p['titulo'], ctx.query['q']) || like(p['descripcion'], ctx.query['q']));
      if (ctx.query['categoria']) rows = rows.filter(p => p['id_categoria'] === Number(ctx.query['categoria']));
      const liked = new Set(viewer ? this.db.t('megusta').filter(m => m['id_usuario'] === viewer['id'] && m['megusta'] === 1).map(m => m['id_publicacion']) : []);
      const data = [...rows].sort((a, b) => b['megusta'] - a['megusta'] || b['id'] - a['id']).map(p => {
        const artist = this.db.user(p['id_usuario']);
        return {
          ...p, artist_name: artist?.['usuario'] ?? null, artist_image: artist?.['imagen'] ?? null,
          category_name: this.db.find('categoria', p['id_categoria'])?.['nombre'] ?? null, liked_by_me: liked.has(p['id']) ? 1 : 0
        };
      });
      return paginate(data, 24, ctx.query);
    });

    this.on('POST', '/publications', async ctx => {
      const auth = this.auth(ctx);
      ensure([1, 3, 5].includes(auth['id_tipo']), 403, 'Solo artistas y organizadores pueden publicar obras.');
      const data = this.v(ctx, { titulo: 'required|string|max:255', descripcion: 'required|string|max:255', id_categoria: 'required|integer|exists:categoria,id', imagen: 'nullable|image|max:8192' });
      const post = this.db.insert('publicaciones', {
        titulo: data['titulo'], descripcion: data['descripcion'], tipo: 'public', id_categoria: data['id_categoria'], id_usuario: auth['id'], megusta: 0,
        imagen: data['imagen'] instanceof File ? await imageDataUrl(data['imagen']) : ''
      });
      this.notify(this.followers(auth['id']), 'obra', 'Nueva obra de ' + auth['usuario'], data['titulo'], '/descubrir');
      return new Created(post);
    });

    this.on('PATCH', '/publications/:id', async ctx => {
      const auth = this.auth(ctx);
      const post = this.db.findOrFail('publicaciones', ctx.params[0]);
      this.owner(post, auth);
      const data = this.v(ctx, { titulo: 'sometimes|required|string|max:255', descripcion: 'sometimes|required|string|max:255', id_categoria: 'sometimes|integer|exists:categoria,id', imagen: 'nullable|image|max:8192' });
      if (data['imagen'] instanceof File) data['imagen'] = await imageDataUrl(data['imagen']);
      else delete data['imagen'];
      if (data['id_categoria'] === null) delete data['id_categoria'];
      return Object.assign(post, data);
    });

    this.on('DELETE', '/publications/:id', ctx => {
      const auth = this.auth(ctx);
      const [id] = ctx.params;
      this.owner(this.db.findOrFail('publicaciones', id), auth);
      this.db.remove('megusta', m => m['id_publicacion'] === id);
      this.db.remove('publicaciones', p => p['id'] === id);
      return { message: 'Publicación eliminada.' };
    });

    this.on('POST', '/publications/:id/like', ctx => {
      const auth = this.auth(ctx);
      const [id] = ctx.params;
      const post = this.db.findOrFail('publicaciones', id);
      const mine = this.db.t('megusta').filter(m => m['id_usuario'] === auth['id'] && m['id_publicacion'] === id);
      let liked = mine.some(m => m['megusta'] === 1);
      if (liked) {
        mine.forEach(m => (m['megusta'] = 0));
        liked = false;
      } else {
        if (mine.length) mine.forEach((m, index) => (m['megusta'] = index === 0 ? 1 : 0));
        else this.db.insert('megusta', { id_usuario: auth['id'], id_publicacion: id, megusta: 1 });
        liked = true;
      }
      const count = new Set(this.db.t('megusta').filter(m => m['id_publicacion'] === id && m['megusta'] === 1).map(m => m['id_usuario'])).size;
      post['megusta'] = count;
      return { liked, count };
    });

    this.on('PATCH', '/publications/:id/visibility', ctx => {
      ensure(this.isAdmin(this.auth(ctx)), 403);
      const post = this.db.findOrFail('publicaciones', ctx.params[0]);
      post['tipo'] = post['tipo'] === 'public' ? 'private' : 'public';
      return { tipo: post['tipo'] };
    });

    this.on('GET', '/publications/:id/comments', ctx => {
      const [id] = ctx.params;
      const post = this.db.find('publicaciones', id);
      ensure(post && (post['tipo'] === 'public' || post['id_usuario'] === ctx.viewer?.['id']), 404);
      return this.db.t('publication_comments').filter(c => c['publication_id'] === id).sort(by('id')).slice(0, 200).map(c => this.withAuthor(c, 'user_id'));
    });

    this.on('POST', '/publications/:id/comments', ctx => {
      const auth = this.auth(ctx);
      const [id] = ctx.params;
      const post = this.db.find('publicaciones', id);
      ensure(post && post['tipo'] === 'public', 404);
      const { body } = this.v(ctx, { body: 'required|string|max:1000' });
      const comment = this.db.insert('publication_comments', { publication_id: id, user_id: auth['id'], body, created_at: nowStamp(), updated_at: nowStamp() });
      return new Created(this.withAuthor(comment, 'user_id'));
    });

    this.on('DELETE', '/publications/:id/comments/:comment', ctx => {
      const auth = this.auth(ctx);
      const [id, commentId] = ctx.params;
      const comment = this.db.t('publication_comments').find(c => c['id'] === commentId && c['publication_id'] === id);
      ensure(comment, 404);
      ensure(comment!['user_id'] === auth['id'] || this.isAdmin(auth), 403);
      this.db.remove('publication_comments', c => c['id'] === commentId);
      return { message: 'Comentario eliminado.' };
    });
  }

  private withAuthor(row: Row, key: string): Row {
    const user = this.db.user(row[key]);
    const { updated_at: _updated, ...rest } = row;
    return { ...rest, usuario: user?.['usuario'] ?? null, imagen: user?.['imagen'] ?? null };
  }

  // ---------------------------------------------------------------- eventos

  private eventRoutes(): void {
    this.on('GET', '/events', ctx => {
      const dates = this.v(ctx, { desde: 'sometimes|nullable|date', hasta: 'sometimes|nullable|date' });
      const from = dates['desde'] as string | null;
      const to = dates['hasta'] as string | null;
      if (from && to && to < from) {
        const message = 'La fecha final debe ser igual o posterior a la fecha inicial.';
        fail(422, message, { hasta: [message] });
      }
      let rows = this.db.t('eventos').filter(e => e['fecha_fin'] >= today());
      if (ctx.query['q']) rows = rows.filter(e => like(e['nombre'], ctx.query['q']) || like(e['ubicacion'], ctx.query['q']));
      if (from) rows = rows.filter(e => e['fecha_fin'] >= from);
      if (to) rows = rows.filter(e => e['fecha_inicio'] <= to);
      const data = [...rows].sort(by('fecha_inicio')).map(e => {
        const organizer = this.db.user(e['id_usuario']);
        const row: Row = {
          ...e, organizer_name: organizer?.['usuario'], organizer_image: organizer?.['imagen'],
          participant_count: this.db.t('listado_evento').filter(l => l['id_evento'] === e['id'] && l['estado'] === 'aceptado').length
        };
        if (ctx.viewer) row['participation_status'] = this.participation(e['id'], ctx.viewer['id']);
        return row;
      });
      return paginate(data, 24, ctx.query);
    });

    this.on('POST', '/events', async ctx => {
      const auth = this.auth(ctx);
      ensure([1, 3].includes(auth['id_tipo']), 403);
      const data = this.v(ctx, {
        nombre: 'required|string|max:255', ubicacion: 'required|string|max:255', link: 'nullable|url|max:255',
        fecha_inicio: 'required|date', fecha_fin: 'required|date|after_or_equal:fecha_inicio', imagen: 'nullable|image|max:8192'
      });
      const event = this.db.insert('eventos', {
        nombre: data['nombre'], ubicacion: data['ubicacion'], link: data['link'] ?? '', fecha_inicio: data['fecha_inicio'], fecha_fin: data['fecha_fin'],
        id_usuario: auth['id'], imagen: data['imagen'] instanceof File ? await imageDataUrl(data['imagen']) : ''
      });
      this.notify(this.followers(auth['id']), 'evento', 'Nuevo evento: ' + data['nombre'], data['ubicacion'], '/descubrir');
      return new Created(event);
    });

    this.on('PATCH', '/events/:id', async ctx => {
      const auth = this.auth(ctx);
      const event = this.db.findOrFail('eventos', ctx.params[0]);
      this.owner(event, auth);
      const data = this.v(ctx, {
        nombre: 'sometimes|required|string|max:255', ubicacion: 'sometimes|required|string|max:255', link: 'sometimes|nullable|url|max:255',
        fecha_inicio: 'sometimes|required|date', fecha_fin: 'sometimes|required|date', imagen: 'nullable|image|max:8192'
      });
      if (data['imagen'] instanceof File) data['imagen'] = await imageDataUrl(data['imagen']);
      else delete data['imagen'];
      if ('link' in data && data['link'] === null) data['link'] = '';
      return Object.assign(event, data);
    });

    this.on('DELETE', '/events/:id', ctx => {
      const auth = this.auth(ctx);
      const [id] = ctx.params;
      this.owner(this.db.findOrFail('eventos', id), auth);
      this.db.remove('listado_evento', l => l['id_evento'] === id);
      this.db.remove('eventos', e => e['id'] === id);
      return { message: 'Evento eliminado.' };
    });

    this.on('POST', '/events/:id/participants', ctx => {
      const auth = this.auth(ctx);
      const [id] = ctx.params;
      this.db.findOrFail('eventos', id);
      const entry = this.db.t('listado_evento').find(l => l['id_evento'] === id && l['id_usuario'] === auth['id']);
      if (entry) return { message: 'Ya has solicitado participar.', estado: entry['estado'] };
      this.db.insert('listado_evento', { id_evento: id, id_usuario: auth['id'], estado: 'pendiente' });
      return new Created({ message: 'Solicitud enviada.', estado: 'pendiente' });
    });

    this.on('DELETE', '/events/:id/participants/me', ctx => {
      const auth = this.auth(ctx);
      this.db.remove('listado_evento', l => l['id_evento'] === ctx.params[0] && l['id_usuario'] === auth['id']);
      return { message: 'Has salido del evento.' };
    });

    this.on('GET', '/events/:id/participants', ctx => {
      this.auth(ctx);
      const [id] = ctx.params;
      this.db.findOrFail('eventos', id);
      return this.db.t('listado_evento').filter(l => l['id_evento'] === id).map(l => {
        const user = this.db.user(l['id_usuario']);
        return { id: l['id'], estado: l['estado'], user_id: l['id_usuario'], usuario: user?.['usuario'], imagen: user?.['imagen'], biografia: user?.['biografia'] };
      }).filter(row => row.usuario).sort(by('usuario'));
    });

    this.on('PATCH', '/events/:id/participants/:participant', ctx => {
      const auth = this.auth(ctx);
      const [id, participant] = ctx.params;
      this.owner(this.db.findOrFail('eventos', id), auth);
      const { estado } = this.v(ctx, { estado: 'required|in:aceptado,rechazado,pendiente' });
      const entry = this.db.t('listado_evento').find(l => l['id'] === participant && l['id_evento'] === id);
      ensure(entry, 404);
      entry!['estado'] = estado;
      return { estado };
    });
  }

  // ---------------------------------------------------------------- mensajes, avisos, notificaciones e informes

  private communityRoutes(): void {
    this.on('GET', '/conversations', ctx => {
      const auth = this.auth(ctx);
      const userId = auth['id'];
      const messages = this.db.t('direct_messages');
      const peers = new Set(messages.flatMap(m => (m['sender_id'] === userId ? [m['recipient_id']] : m['recipient_id'] === userId ? [m['sender_id']] : [])));
      const newest = (a: Row, b: Row) => String(b['updated_at'] ?? '').localeCompare(String(a['updated_at'] ?? ''));
      const direct = [...peers].map(peerId => {
        const peer = this.db.user(peerId);
        const last = messages.filter(m => (m['sender_id'] === userId && m['recipient_id'] === peerId) || (m['sender_id'] === peerId && m['recipient_id'] === userId)).sort(by('id', true))[0];
        return { id: peerId, name: peer?.['usuario'], image: peer?.['imagen'], last_message: last?.['body'] ?? null, updated_at: last?.['created_at'] ?? null, kind: 'direct' };
      }).filter(c => c.name).sort(newest);
      const eventIds = new Set([
        ...this.db.t('eventos').filter(e => e['id_usuario'] === userId).map(e => e['id']),
        ...this.db.t('listado_evento').filter(l => l['id_usuario'] === userId && l['estado'] === 'aceptado').map(l => l['id_evento'])
      ]);
      const events = [...eventIds].map(id => this.db.find('eventos', id)).filter((e): e is Row => !!e).map(event => {
        const last = this.db.t('event_chat_messages').filter(m => m['event_id'] === event['id']).sort(by('id', true))[0];
        return { id: event['id'], name: event['nombre'], image: event['imagen'], last_message: last?.['body'] ?? null, updated_at: last?.['created_at'] ?? null, kind: 'event' };
      }).sort(newest);
      return { direct, events };
    });

    const eventAccess = (ctx: Ctx) => {
      const auth = this.auth(ctx);
      const event = this.db.findOrFail('eventos', ctx.params[0]);
      const allowed = event['id_usuario'] === auth['id'] || this.participation(event['id'], auth['id']) === 'aceptado';
      ensure(allowed, 403, 'El chat está disponible para la organización y las personas aceptadas en el evento.');
      return auth;
    };

    this.on('GET', '/events/:id/chat', ctx => {
      eventAccess(ctx);
      return this.db.t('event_chat_messages').filter(m => m['event_id'] === ctx.params[0]).sort(by('id')).slice(-100).map(m => this.withAuthor(m, 'user_id'));
    });

    this.on('POST', '/events/:id/chat', ctx => {
      const auth = eventAccess(ctx);
      const { body } = this.v(ctx, { body: 'required|string|max:1000' });
      const message = this.db.insert('event_chat_messages', { event_id: ctx.params[0], user_id: auth['id'], body, created_at: nowStamp(), updated_at: nowStamp() });
      return new Created(this.withAuthor(message, 'user_id'));
    });

    const directTarget = (ctx: Ctx) => {
      const auth = this.auth(ctx);
      const other = this.db.user(ctx.params[0]);
      ensure(other, 404);
      if (auth['id'] === other!['id']) fail(422, 'No puedes abrir un chat contigo.');
      ensure(other!['id_tipo'] === 5 || auth['id_tipo'] === 5, 404, 'El chat directo está reservado para conversaciones con artistas.');
      return { auth, other: other! };
    };
    const directRow = (m: Row) => {
      const sender = this.db.user(m['sender_id']);
      return { id: m['id'], sender_id: m['sender_id'], recipient_id: m['recipient_id'], body: m['body'], created_at: m['created_at'], sender_name: sender?.['usuario'], sender_image: sender?.['imagen'] };
    };

    this.on('GET', '/direct-messages/:id', ctx => {
      const { auth, other } = directTarget(ctx);
      const a = auth['id'];
      const b = other['id'];
      const messages = this.db.t('direct_messages').filter(m => (m['sender_id'] === a && m['recipient_id'] === b) || (m['sender_id'] === b && m['recipient_id'] === a))
        .sort(by('id')).slice(-100).map(directRow);
      return { peer: this.pick(other, ['id', 'usuario', 'imagen', 'id_tipo']), messages };
    });

    this.on('POST', '/direct-messages/:id', ctx => {
      const { auth, other } = directTarget(ctx);
      const { body } = this.v(ctx, { body: 'required|string|max:1000' });
      const message = this.db.insert('direct_messages', { sender_id: auth['id'], recipient_id: other['id'], body, created_at: nowStamp(), updated_at: nowStamp() });
      this.notify([other['id']], 'mensaje', 'Mensaje de ' + auth['usuario'], String(body).slice(0, 180), '/mensajes/artista/' + auth['id']);
      return new Created(directRow(message));
    });

    this.on('GET', '/notices', ctx => {
      let rows = this.db.t('avisos');
      if (ctx.query['usuario']) rows = rows.filter(a => a['id_usuario'] === Number(ctx.query['usuario']));
      const data = [...rows].sort(by('id', true)).map((a): Row | null => {
        const user = this.db.user(a['id_usuario']);
        return user ? { ...a, artist_name: user['usuario'], artist_image: user['imagen'] } : null;
      }).filter((a): a is Row => !!a);
      return paginate(data, 30, ctx.query);
    });

    this.on('POST', '/notices', ctx => {
      const auth = this.auth(ctx);
      ensure(this.isAdmin(auth), 403, 'Solo administración puede publicar avisos generales.');
      const data = this.v(ctx, { titulo: 'required|string|max:255', aviso: 'required|string|max:255' });
      const stamp = nowStamp();
      const notice = this.db.insert('avisos', { titulo: data['titulo'], aviso: data['aviso'], fecha_publicacion: stamp.slice(0, 10), id_usuario: auth['id'], hora: stamp.slice(11) });
      this.notify(this.db.t('usuarios').map(u => u['id']).filter(id => id !== auth['id']), 'aviso', 'Aviso importante de ArtistApp', data['titulo'], '/artistas/' + auth['id']);
      return new Created(notice);
    });

    this.on('PATCH', '/notices/:id', ctx => {
      const auth = this.auth(ctx);
      const notice = this.db.findOrFail('avisos', ctx.params[0]);
      this.owner(notice, auth);
      return Object.assign(notice, this.v(ctx, { titulo: 'sometimes|required|string|max:255', aviso: 'sometimes|required|string|max:255' }));
    });

    this.on('DELETE', '/notices/:id', ctx => {
      const auth = this.auth(ctx);
      const [id] = ctx.params;
      this.owner(this.db.findOrFail('avisos', id), auth);
      this.db.remove('avisos', a => a['id'] === id);
      return { message: 'Aviso eliminado.' };
    });

    const unread = (userId: number) => this.db.t('app_notifications').filter(n => n['user_id'] === userId && !n['read_at']).length;

    this.on('GET', '/notifications', ctx => {
      const auth = this.auth(ctx);
      const rows = this.db.t('app_notifications').filter(n => n['user_id'] === auth['id']).sort(by('id', true));
      return { data: paginate(rows, 30, ctx.query), unread: unread(auth['id']) };
    });

    this.on('PATCH', '/notifications/read-all', ctx => {
      const auth = this.auth(ctx);
      this.db.t('app_notifications').filter(n => n['user_id'] === auth['id'] && !n['read_at']).forEach(n => (n['read_at'] = n['updated_at'] = nowStamp()));
      return { unread: 0 };
    });

    this.on('PATCH', '/notifications/:id/read', ctx => {
      const auth = this.auth(ctx);
      const item = this.db.t('app_notifications').find(n => n['id'] === ctx.params[0] && n['user_id'] === auth['id'] && !n['read_at']);
      if (item) item['read_at'] = item['updated_at'] = nowStamp();
      return { unread: unread(auth['id']) };
    });

    this.on('GET', '/reports', ctx => {
      const auth = this.auth(ctx);
      const rows = this.db.t('informes').filter(r => this.isAdmin(auth) || r['id_usuario'] === auth['id']).sort(by('id', true)).map(r => ({
        ...r, reportante: this.db.user(r['id_usuario'])?.['usuario'], usuario_referenciado: this.db.user(r['id_usuarioreferenciado'])?.['usuario']
      })).filter(r => r.reportante && r.usuario_referenciado);
      return paginate(rows, 30, ctx.query);
    });

    this.on('POST', '/reports', ctx => {
      const auth = this.auth(ctx);
      const data = this.v(ctx, { informe: 'required|string|max:255', id_usuarioreferenciado: 'required|integer|exists:usuarios,id' });
      if (data['id_usuarioreferenciado'] === auth['id']) fail(422, 'No puedes reportarte a ti misma/o.');
      const report = this.db.insert('informes', { id_usuario: auth['id'], informe: data['informe'], id_usuarioreferenciado: data['id_usuarioreferenciado'], estado: 'pendiente' });
      this.notify(this.db.t('usuarios').filter(u => u['id_tipo'] === ADMIN).map(u => u['id']), 'informe', 'Nuevo informe recibido', `@${auth['usuario']}: ${data['informe']}`, '/admin/informes');
      return new Created(report);
    });

    this.on('PATCH', '/reports/:id', ctx => {
      ensure(this.isAdmin(this.auth(ctx)), 403);
      const { estado } = this.v(ctx, { estado: 'required|in:pendiente,en revisión,resuelta,descartada' });
      const report = this.db.findOrFail('informes', ctx.params[0]);
      report['estado'] = estado;
      this.notify([report['id_usuario']], 'informe', 'Actualización de tu informe', `El estado de tu informe ahora es: ${estado}.`, '/informes');
      return report;
    });

    this.on('DELETE', '/reports/:id', ctx => {
      const auth = this.auth(ctx);
      const [id] = ctx.params;
      const report = this.db.t('informes').find(r => r['id'] === id && (this.isAdmin(auth) || (r['id_usuario'] === auth['id'] && r['estado'] === 'pendiente')));
      ensure(report, 404);
      this.db.remove('informes', r => r['id'] === id);
      if (this.isAdmin(auth)) this.notify([report!['id_usuario']], 'informe', 'Informe eliminado', 'El equipo de ArtistApp ha eliminado un informe.', '/informes');
      return { message: 'Informe eliminado.' };
    });
  }

  // ---------------------------------------------------------------- catálogos

  private catalogRoutes(): void {
    this.on('GET', '/categories', () => [...this.db.t('categoria')].sort(by('nombre')));
    this.on('GET', '/product-types', () => this.db.t('tipo_producto'));

    this.on('POST', '/categories', ctx => {
      ensure(this.isAdmin(this.auth(ctx)), 403);
      return new Created(this.db.insert('categoria', this.v(ctx, { nombre: 'required|string|max:255|unique:categoria,nombre' })));
    });

    this.on('PATCH', '/categories/:id', ctx => {
      ensure(this.isAdmin(this.auth(ctx)), 403);
      const [id] = ctx.params;
      const category = this.db.findOrFail('categoria', id);
      return Object.assign(category, this.v(ctx, { nombre: `required|string|max:255|unique:categoria,nombre,${id}` }));
    });

    this.on('DELETE', '/categories/:id', ctx => {
      ensure(this.isAdmin(this.auth(ctx)), 403);
      const [id] = ctx.params;
      if (this.db.t('publicaciones').some(p => p['id_categoria'] === id)) fail(422, 'Esta categoría está asignada a publicaciones.');
      ensure(this.db.remove('categoria', c => c['id'] === id) > 0, 404);
      return { message: 'Categoría eliminada.' };
    });
  }

  // ---------------------------------------------------------------- tienda y cesta

  private publicProduct(product: Row): Row {
    const artist = this.db.user(product['id_usuario']);
    return {
      ...this.pick(product, ['id', 'nombre', 'descripcion', 'precio', 'cantidad', 'imagen', 'id_tipo', 'id_usuario']),
      artist_name: artist?.['usuario'], artist_image: artist?.['imagen'], type_name: this.db.find('tipo_producto', product['id_tipo'])?.['nombre'] ?? null
    };
  }

  private cartId(userId: number): number {
    return (this.db.t('cesta').find(c => c['id_usuario'] === userId) ?? this.db.insert('cesta', { id_usuario: userId }))['id'];
  }

  private cartItems(cartId: number): Row[] {
    return this.db.t('cesta_producto').filter(c => c['id_cesta'] === cartId).sort(by('id', true))
      .map(c => ({ item: this.db.find('productos', c['id_producto']), cartItem: c['id'] })).filter(entry => entry.item)
      .map(({ item, cartItem }) => {
        const { imagen_original: _original, archivos: _files, ...product } = item!;
        return { ...product, cart_item_id: cartItem };
      });
  }

  private shopRoutes(): void {
    this.on('GET', '/products', ctx => {
      let rows = this.db.t('productos').map(p => this.publicProduct(p));
      const q = ctx.query['q'];
      if (q) rows = rows.filter(p => like(p['nombre'], q) || like(p['descripcion'], q) || like(p['artist_name'], q));
      if (ctx.query['tipo']) rows = rows.filter(p => p['id_tipo'] === Number(ctx.query['tipo']));
      const range = (ctx.query['precio'] ?? '').split('-');
      if (range.length === 2 && range[0] !== '' && !isNaN(Number(range[0]))) {
        if (range[1] === '?') rows = rows.filter(p => p['precio'] >= Number(range[0]));
        else if (range[1] !== '' && !isNaN(Number(range[1]))) rows = rows.filter(p => p['precio'] >= Number(range[0]) && p['precio'] <= Number(range[1]));
      }
      if (['1', 'true', 'on', 'yes'].includes(ctx.query['disponible'] ?? '')) rows = rows.filter(p => p['cantidad'] > 0);
      return paginate(rows.sort(by('id', true)), 24, ctx.query);
    });

    this.on('GET', '/products/:id', ctx => this.publicProduct(this.db.findOrFail('productos', ctx.params[0])));

    this.on('POST', '/products', async ctx => {
      const auth = this.auth(ctx);
      ensure([1, 3, 5].includes(auth['id_tipo']), 403, 'Solo artistas y organizadores pueden vender productos.');
      const data = this.v(ctx, {
        nombre: 'required|string|max:255', descripcion: 'required|string|max:255', precio: 'required|numeric|min:0.01', cantidad: 'required|integer|min:0',
        id_tipo: 'required|integer|in:1,2', imagen: 'required|image|mimes:jpg,jpeg,png,webp|max:8192', archivo_digital: 'nullable|file|max:51200'
      });
      if (data['id_tipo'] === 2 && !(data['archivo_digital'] instanceof File)) fail(422, 'Añade el archivo que recibirá el comprador.');
      const product = this.db.insert('productos', {
        nombre: data['nombre'], descripcion: data['descripcion'], precio: data['precio'], cantidad: data['cantidad'], id_tipo: data['id_tipo'], id_usuario: auth['id'],
        imagen: await imageDataUrl(data['imagen'], true),
        archivos: data['archivo_digital'] instanceof File ? await digitalFile(data['archivo_digital']) : NO_FILES
      });
      return new Created(this.publicProduct(product));
    });

    this.on('PATCH', '/products/:id', async ctx => {
      const auth = this.auth(ctx);
      const product = this.db.findOrFail('productos', ctx.params[0]);
      this.owner(product, auth);
      const data = this.v(ctx, {
        nombre: 'sometimes|required|string|max:255', descripcion: 'sometimes|required|string|max:255', precio: 'sometimes|required|numeric|min:0.01',
        cantidad: 'sometimes|required|integer|min:0', id_tipo: 'sometimes|integer|in:1,2', imagen: 'sometimes|nullable|image|mimes:jpg,jpeg,png,webp|max:8192',
        archivo_digital: 'sometimes|nullable|file|max:51200'
      });
      const image = data['imagen'];
      const digital = data['archivo_digital'];
      delete data['imagen'];
      delete data['archivo_digital'];
      if (data['id_tipo'] === null) delete data['id_tipo'];
      const nextType = data['id_tipo'] ?? product['id_tipo'];
      if (nextType === 2 && !(digital instanceof File) && (!product['archivos'] || product['archivos'] === NO_FILES)) fail(422, 'Añade el archivo que recibirá el comprador.');
      if (image instanceof File) data['imagen'] = await imageDataUrl(image, true);
      if (digital instanceof File) data['archivos'] = await digitalFile(digital);
      Object.assign(product, data);
      return this.publicProduct(product);
    });

    this.on('DELETE', '/products/:id', ctx => {
      const auth = this.auth(ctx);
      const [id] = ctx.params;
      this.owner(this.db.findOrFail('productos', id), auth);
      if (this.db.t('detalles_pedido').some(d => d['id_producto'] === id)) fail(422, 'Este producto ya aparece en pedidos y no se puede borrar.');
      this.db.remove('cesta_producto', c => c['id_producto'] === id);
      this.db.remove('productos', p => p['id'] === id);
      return { message: 'Producto eliminado.' };
    });

    const showCart = (user: Row) => {
      const items = this.cartItems(this.cartId(user['id']));
      const subtotal = items.reduce((sum, item) => sum + Number(item['precio']), 0);
      const envio = items.some(item => item['id_tipo'] === 1) ? SHIPPING : 0;
      return { items, subtotal, envio, total: subtotal + envio };
    };

    this.on('GET', '/cart', ctx => showCart(this.auth(ctx)));

    this.on('POST', '/cart/items/:id', ctx => {
      const auth = this.auth(ctx);
      const [productId] = ctx.params;
      const product = this.db.findOrFail('productos', productId);
      if (product['cantidad'] < 1) fail(422, 'Este producto está agotado.');
      const cartId = this.cartId(auth['id']);
      const exists = this.db.t('cesta_producto').some(c => c['id_cesta'] === cartId && c['id_producto'] === productId);
      if (exists) return { message: 'El producto ya estaba en la cesta.' };
      this.db.insert('cesta_producto', { id_cesta: cartId, id_producto: productId });
      return new Created({ message: 'Producto añadido.' });
    });

    this.on('DELETE', '/cart/items/:id', ctx => {
      const auth = this.auth(ctx);
      const cart = this.db.t('cesta').find(c => c['id_usuario'] === auth['id']);
      if (cart) this.db.remove('cesta_producto', c => c['id_cesta'] === cart['id'] && c['id_producto'] === ctx.params[0]);
      return showCart(auth);
    });

    this.on('DELETE', '/cart', ctx => {
      const auth = this.auth(ctx);
      const cart = this.db.t('cesta').find(c => c['id_usuario'] === auth['id']);
      if (cart) this.db.remove('cesta_producto', c => c['id_cesta'] === cart['id']);
      return { message: 'Cesta vaciada.' };
    });

    this.on('POST', '/checkout', ctx => {
      const auth = this.auth(ctx);
      const data = this.v(ctx, { nombre: 'required|string|max:255', direccion: 'required|string|max:255', telefono: 'required|string|max:32' });
      const phone = String(data['telefono']).replace(/\D+/g, '');
      if (!/^[0-9]{9}$/.test(phone)) fail(422, 'El teléfono debe tener 9 dígitos.');
      const cart = this.db.t('cesta').find(c => c['id_usuario'] === auth['id']);
      if (!cart) fail(422, 'La cesta está vacía.');
      const items = this.cartItems(cart['id']);
      if (!items.length) fail(422, 'La cesta está vacía.');
      if (items.some(item => item['cantidad'] < 1)) fail(422, 'Uno de los productos ya no está disponible.');
      const subtotal = items.reduce((sum, item) => sum + Number(item['precio']), 0);
      const shipping = items.some(item => item['id_tipo'] === 1) ? SHIPPING : 0;
      const order = this.db.insert('pedidos', { id_usuario: auth['id'], nombre: data['nombre'], estado: 'preparando', direccion: data['direccion'], telefono: phone, pago: subtotal + shipping });
      for (const item of items) {
        this.db.insert('detalles_pedido', { id_pedido: order['id'], id_producto: item['id'], estado_envio: 'preparando', recibido_confirmado_at: null });
        const product = this.db.find('productos', item['id']);
        if (product && product['cantidad'] > 0) product['cantidad']--;
      }
      this.db.remove('cesta_producto', c => c['id_cesta'] === cart['id']);
      return new Created({ order, message: 'Pedido creado.' });
    });
  }

  // ---------------------------------------------------------------- pedidos

  private details(orderId: number, sellerId?: number): Row[] {
    return this.db.t('detalles_pedido').filter(d => d['id_pedido'] === orderId).map(d => ({ d, p: this.db.find('productos', d['id_producto']) }))
      .filter(({ p }) => p && (sellerId === undefined || p['id_usuario'] === sellerId))
      .map(({ d, p }) => ({
        detalle_id: d['id'], id_pedido: d['id_pedido'], estado_envio: d['estado_envio'] ?? 'preparando', recibido_confirmado_at: d['recibido_confirmado_at'] ?? null,
        id: p!['id'], nombre: p!['nombre'], imagen: p!['imagen'], precio: p!['precio'], id_tipo: p!['id_tipo'], seller_id: p!['id_usuario']
      }));
  }

  private overallStatus(products: Row[], fallback: string): string {
    if (fallback === 'cancelado') return 'cancelado';
    if (!products.length) return fallback;
    const state = (p: Row) => p['estado_envio'] ?? 'preparando';
    if (products.every(p => state(p) === 'entregado' && p['recibido_confirmado_at'])) return 'entregado';
    if (products.every(p => state(p) === 'entregado')) return 'pendiente_confirmacion';
    if (products.some(p => state(p) === 'entregado')) return 'entrega_parcial';
    if (products.some(p => state(p) === 'enviado')) return 'enviado';
    return 'preparando';
  }

  private syncOrderStatus(order: Row): void {
    if (order['estado'] === 'cancelado') return;
    order['estado'] = this.overallStatus(this.db.t('detalles_pedido').filter(d => d['id_pedido'] === order['id']), order['estado']);
  }

  private restock(orderId: number): void {
    for (const detail of this.db.t('detalles_pedido').filter(d => d['id_pedido'] === orderId)) {
      const product = this.db.find('productos', detail['id_producto']);
      if (product) product['cantidad']++;
    }
  }

  private orderRoutes(): void {
    this.on('GET', '/orders', ctx => {
      const auth = this.auth(ctx);
      let rows = this.db.t('pedidos').filter(o => this.isAdmin(auth) || o['id_usuario'] === auth['id']);
      if (ctx.query['estado']) rows = rows.filter(o => o['estado'] === ctx.query['estado']);
      const page = paginate([...rows].sort(by('id', true)), 30, ctx.query);
      page['data'] = page['data'].map((o: Row) => {
        const productos = this.details(o['id']);
        return { ...o, buyer_name: this.db.user(o['id_usuario'])?.['usuario'], productos, estado: this.overallStatus(productos, o['estado']) };
      });
      return page;
    });

    this.on('GET', '/orders/received', ctx => {
      const auth = this.auth(ctx);
      ensure([1, 3, 5].includes(auth['id_tipo']), 403, 'Tu cuenta no puede recibir pedidos.');
      const rows = this.db.t('pedidos').filter(o => this.details(o['id'], auth['id']).length).sort(by('id', true));
      const page = paginate(rows, 30, ctx.query);
      page['data'] = page['data'].map((o: Row) => {
        const productos = this.details(o['id'], auth['id']);
        return {
          ...this.pick(o, ['id', 'nombre', 'estado', 'direccion', 'telefono', 'pago']), buyer_name: this.db.user(o['id_usuario'])?.['usuario'], productos,
          total_vendedor: productos.reduce((sum, p) => sum + Number(p['precio']), 0), estado: this.overallStatus(productos, o['estado'])
        };
      });
      return page;
    });

    this.on('PATCH', '/orders/:id/status', ctx => {
      const auth = this.auth(ctx);
      const admin = this.isAdmin(auth);
      ensure(admin || [3, 5].includes(auth['id_tipo']), 403, 'No tienes permiso para cambiar el estado.');
      const { estado } = this.v(ctx, { estado: 'required|in:preparando,enviado,entregado' + (admin ? ',cancelado' : '') });
      const order = this.db.findOrFail('pedidos', ctx.params[0]);
      const detailIds = new Set(this.details(order['id'], admin ? undefined : auth['id']).map(d => d['detalle_id']));
      ensure(admin || detailIds.size, 403, 'Este pedido no contiene productos tuyos.');
      if (order['estado'] === 'cancelado') fail(422, 'El pedido está cancelado.');
      const mine = this.db.t('detalles_pedido').filter(d => detailIds.has(d['id']));
      if (estado !== 'entregado' && mine.some(d => d['recibido_confirmado_at'])) fail(422, 'El comprador ya confirmó la recepción; no se puede retroceder el estado.');
      if (order['estado'] === 'entregado' && estado === 'cancelado') fail(422, 'No se puede cancelar un pedido entregado.');
      if (admin && estado === 'cancelado') {
        this.restock(order['id']);
        order['estado'] = 'cancelado';
        return order;
      }
      for (const detail of mine) {
        detail['estado_envio'] = estado;
        if (estado !== 'entregado') detail['recibido_confirmado_at'] = null;
      }
      this.syncOrderStatus(order);
      return order;
    });

    this.on('PATCH', '/orders/:id/items/:detail/confirm-received', ctx => {
      const auth = this.auth(ctx);
      const [id, detailId] = ctx.params;
      const order = this.db.findOrFail('pedidos', id);
      ensure(order['id_usuario'] === auth['id'] || this.isAdmin(auth), 403, 'Solo el comprador puede confirmar la recepción.');
      if (order['estado'] === 'cancelado') fail(422, 'El pedido está cancelado.');
      const item = this.db.t('detalles_pedido').find(d => d['id'] === detailId && d['id_pedido'] === id);
      ensure(item, 404, 'El artículo no pertenece a este pedido.');
      ensure(item!['estado_envio'] === 'entregado', 422, 'El vendedor todavía no ha marcado este artículo como entregado.');
      if (item!['recibido_confirmado_at']) fail(422, 'La recepción de este artículo ya está confirmada.');
      item!['recibido_confirmado_at'] = nowStamp();
      this.syncOrderStatus(order);
      return order;
    });

    this.on('PATCH', '/orders/:id', ctx => {
      ensure(this.isAdmin(this.auth(ctx)), 403);
      const data = this.v(ctx, { nombre: 'sometimes|required|string|max:255', direccion: 'sometimes|required|string|max:255', telefono: 'sometimes|required|string|max:32' });
      return Object.assign(this.db.findOrFail('pedidos', ctx.params[0]), data);
    });

    this.on('DELETE', '/orders/:id', ctx => {
      ensure(this.isAdmin(this.auth(ctx)), 403);
      const [id] = ctx.params;
      const order = this.db.findOrFail('pedidos', id);
      if (order['estado'] !== 'cancelado') this.restock(id);
      this.db.remove('detalles_pedido', d => d['id_pedido'] === id);
      this.db.remove('pedidos', o => o['id'] === id);
      return { message: 'Pedido eliminado.' };
    });

    this.on('POST', '/orders/:id/cancel', ctx => {
      const auth = this.auth(ctx);
      const order = this.db.findOrFail('pedidos', ctx.params[0]);
      ensure(order['id_usuario'] === auth['id'] || this.isAdmin(auth), 403);
      if (order['estado'] === 'entregado') fail(422, 'No se puede cancelar un pedido entregado.');
      if (order['estado'] === 'cancelado') fail(422, 'Este pedido ya está cancelado.');
      this.restock(order['id']);
      order['estado'] = 'cancelado';
      return { message: 'Pedido cancelado y artículos devueltos al inventario.' };
    });

    this.on('GET', '/orders/:id/products/:product/download', async ctx => {
      const auth = this.auth(ctx);
      const [id, productId] = ctx.params;
      const order = this.db.findOrFail('pedidos', id);
      ensure(order['id_usuario'] === auth['id'] || this.isAdmin(auth), 403);
      if (order['estado'] === 'cancelado') fail(403, 'El pedido está cancelado.');
      const product = this.db.find('productos', productId);
      ensure(product && product['id_tipo'] === 2 && this.db.t('detalles_pedido').some(d => d['id_pedido'] === id && d['id_producto'] === productId), 404);
      if (!product!['archivos'] || product!['archivos'] === NO_FILES) fail(404, 'El archivo digital no está disponible.');
      return downloadBlob(product!['archivos']);
    });
  }

  // ---------------------------------------------------------------- administración

  private adminRoutes(): void {
    const admin = (ctx: Ctx) => ensure(this.isAdmin(this.auth(ctx)), 403);

    this.on('GET', '/admin/summary', ctx => {
      admin(ctx);
      const orders = this.db.t('pedidos');
      return {
        usuarios: this.db.t('usuarios').length, publicaciones: this.db.t('publicaciones').length, productos: this.db.t('productos').length, eventos: this.db.t('eventos').length,
        pedidos_pendientes: orders.filter(o => !['entregado', 'cancelado'].includes(o['estado'])).length,
        informes_pendientes: this.db.t('informes').filter(r => !['resuelta', 'descartada'].includes(r['estado'])).length,
        ventas: orders.filter(o => o['estado'] !== 'cancelado').reduce((sum, o) => sum + Number(o['pago']), 0)
      };
    });

    this.on('GET', '/admin/users', ctx => {
      admin(ctx);
      return paginate([...this.db.t('usuarios')].sort(by('id', true)).map(u => this.publicUser(u)), 40, ctx.query);
    });

    this.on('POST', '/admin/users', async ctx => {
      admin(ctx);
      const data = this.v(ctx, {
        nombre: 'required|string|max:100', apellidos: 'required|string|max:140', usuario: 'required|string|max:100|unique:usuarios,usuario',
        correo: 'required|email|max:240|unique:usuarios,correo', id_tipo: 'required|integer|exists:tipo_usuario,id',
        password: 'required|string|min:8|confirmed|strong', imagen: 'nullable|image|max:8192', biografia: 'nullable|string|max:255'
      });
      const user = this.db.insert('usuarios', {
        nombre: data['nombre'], apellidos: data['apellidos'], usuario: data['usuario'], correo: data['correo'], id_tipo: data['id_tipo'], contrasena: data['password'],
        imagen: data['imagen'] instanceof File ? await imageDataUrl(data['imagen']) : 'media/no-user.png', biografia: data['biografia'] ?? ''
      });
      return new Created(this.publicUser(user));
    });

    this.on('PATCH', '/admin/users/:id', async ctx => {
      admin(ctx);
      const [id] = ctx.params;
      const user = this.db.findOrFail('usuarios', id);
      const data = this.v(ctx, {
        nombre: 'sometimes|required|string|max:255', apellidos: 'sometimes|required|string|max:255', usuario: `sometimes|required|string|max:255|unique:usuarios,usuario,${id}`,
        correo: `sometimes|required|email|max:255|unique:usuarios,correo,${id}`, id_tipo: 'sometimes|integer|exists:tipo_usuario,id',
        biografia: 'sometimes|nullable|string|max:255', imagen: 'sometimes|nullable|image|max:8192', password: 'sometimes|nullable|string|min:8|confirmed|strong'
      });
      if (data['password']) user['contrasena'] = data['password'];
      delete data['password'];
      if (data['imagen'] instanceof File) data['imagen'] = await imageDataUrl(data['imagen']);
      else delete data['imagen'];
      if (data['id_tipo'] === null) delete data['id_tipo'];
      if ('biografia' in data && data['biografia'] === null) data['biografia'] = '';
      Object.assign(user, data);
      return this.publicUser(user);
    });

    this.on('DELETE', '/admin/users/:id', ctx => {
      admin(ctx);
      const [id] = ctx.params;
      if (id === ctx.viewer!['id']) fail(422, 'No puedes eliminar tu propia cuenta de administración.');
      this.db.findOrFail('usuarios', id);
      const ids = (table: string) => new Set(this.db.t(table).filter(r => r['id_usuario'] === id).map(r => r['id']));
      const events = ids('eventos');
      const products = ids('productos');
      const orders = ids('pedidos');
      const posts = ids('publicaciones');
      const carts = ids('cesta');
      this.db.remove('tokens', t => t['user_id'] === id);
      this.db.remove('favoritos', f => f['id_usuario'] === id || f['id_usuariopin'] === id);
      this.db.remove('megusta', m => m['id_usuario'] === id || posts.has(m['id_publicacion']));
      this.db.remove('listado_evento', l => l['id_usuario'] === id || events.has(l['id_evento']));
      this.db.remove('informes', r => r['id_usuario'] === id || r['id_usuarioreferenciado'] === id);
      this.db.remove('cesta_producto', c => products.has(c['id_producto']) || carts.has(c['id_cesta']));
      this.db.remove('cesta', c => c['id_usuario'] === id);
      this.db.remove('detalles_pedido', d => orders.has(d['id_pedido']) || products.has(d['id_producto']));
      for (const table of ['pedidos', 'avisos', 'publicaciones', 'eventos', 'productos']) this.db.remove(table, r => r['id_usuario'] === id);
      this.db.remove('usuarios', u => u['id'] === id);
      return { message: 'Cuenta eliminada.' };
    });
  }
}

/** Marca una respuesta 201 Created. */
class Created {
  constructor(readonly body: unknown) {}
}
