import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Api } from '../core/api';
import { assetUrl } from '../core/asset-url';
import { ConfirmModal } from '../shared/confirm-modal';

type Field = { key: string; label: string; type?: string; required?: boolean };

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ConfirmModal],
  templateUrl: './admin-resource.html',
  styleUrl: './admin-resource.css',
})
export class AdminResource {
  private readonly api = inject(Api);
  private readonly route = inject(ActivatedRoute);
  resource = '';
  readonly rows = signal<any[]>([]);
  readonly busy = signal(false);
  readonly message = signal('');
  readonly confirmation = signal<{ message: string } | null>(null);
  private pendingAction: (() => void) | null = null;
  readonly formOpen = signal(false);
  readonly editingRow = signal<any | null>(null);
  readonly draft = signal<Record<string, any>>({});
  readonly formError = signal('');
  readonly categories = signal<{ id: number; nombre: string }[]>([]);
  readonly filePreview = signal<string | null>(null);
  readonly selectedEvent = signal<any | null>(null);
  readonly participants = signal<any[]>([]);
  readonly hasMore = signal(false);
  private page = 1;
  file: File | null = null;
  digitalFile: File | null = null;
  config: any = {};
  readonly labels: Record<string, string> = {
    id: 'ID',
    usuario: 'Usuario',
    nombre: 'Nombre',
    correo: 'Correo',
    id_tipo: 'Tipo',
    imagen: 'Imagen',
    biografia: 'Biografía',
    titulo: 'Título',
    descripcion: 'Descripción',
    megusta: 'Me gusta',
    artist_name: 'Artista',
    ubicacion: 'Ubicación',
    fecha_inicio: 'Inicio',
    fecha_fin: 'Fin',
    precio: 'Precio',
    cantidad: 'Stock',
    estado: 'Estado',
    pago: 'Importe',
    buyer_name: 'Comprador',
    telefono: 'Teléfono',
    direccion: 'Dirección',
    aviso: 'Aviso',
    informe: 'Informe',
    usuario_referenciado: 'Perfil reportado',
  };
  private readonly configs: Record<string, any> = {
    usuarios: {
      title: 'Personas',
      singular: 'perfil',
      subtitle: 'Perfiles y permisos de la comunidad.',
      endpoint: '/admin/users',
      columns: ['id', 'usuario', 'correo', 'id_tipo', 'imagen'],
      fields: [
        { key: 'nombre', label: 'Nombre', required: true },
        { key: 'apellidos', label: 'Apellidos', required: true },
        { key: 'usuario', label: 'Usuario', required: true },
        { key: 'correo', label: 'Correo', type: 'email', required: true },
        { key: 'id_tipo', label: 'Tipo de cuenta', required: true },
        { key: 'biografia', label: 'Biografía' },
        { key: 'password', label: 'Nueva contraseña', type: 'password', required: true },
        {
          key: 'password_confirmation',
          label: 'Confirmar contraseña',
          type: 'password',
          required: true,
        },
      ],
      upload: true,
    },
    publicaciones: {
      title: 'Publicaciones',
      singular: 'obra',
      subtitle: 'Obras compartidas en la comunidad.',
      endpoint: '/publications',
      columns: ['id', 'titulo', 'artist_name', 'megusta', 'imagen'],
      fields: [
        { key: 'titulo', label: 'Título', required: true },
        { key: 'descripcion', label: 'Descripción', required: true },
        { key: 'id_categoria', label: 'Categoría', required: true },
      ],
      upload: true,
    },
    productos: {
      title: 'Tienda',
      singular: 'producto',
      subtitle: 'Piezas originales, stock y catálogo.',
      endpoint: '/products',
      columns: ['id', 'nombre', 'artist_name', 'precio', 'cantidad', 'imagen'],
      fields: [
        { key: 'nombre', label: 'Nombre', required: true },
        { key: 'descripcion', label: 'Descripción', required: true },
        { key: 'precio', label: 'Precio', type: 'number', required: true },
        { key: 'cantidad', label: 'Stock', type: 'number', required: true },
        { key: 'id_tipo', label: 'Formato', required: true },
      ],
      upload: true,
    },
    eventos: {
      title: 'Eventos',
      singular: 'evento',
      subtitle: 'Ferias, encuentros y participantes.',
      endpoint: '/events',
      columns: ['id', 'nombre', 'ubicacion', 'fecha_inicio', 'fecha_fin', 'imagen'],
      fields: [
        { key: 'nombre', label: 'Nombre', required: true },
        { key: 'ubicacion', label: 'Ubicación', required: true },
        { key: 'link', label: 'Enlace', type: 'url' },
        { key: 'fecha_inicio', label: 'Fecha de inicio', type: 'date', required: true },
        { key: 'fecha_fin', label: 'Fecha de fin', type: 'date', required: true },
      ],
      upload: true,
    },
    avisos: {
      title: 'Avisos',
      singular: 'aviso',
      subtitle: 'Novedades compartidas por la comunidad.',
      endpoint: '/notices',
      columns: ['id', 'titulo', 'artist_name', 'aviso'],
      fields: [
        { key: 'titulo', label: 'Título', required: true },
        { key: 'aviso', label: 'Mensaje', required: true },
      ],
    },
    categorias: {
      title: 'Categorías',
      singular: 'categoría',
      subtitle: 'Etiquetas para encontrar las obras.',
      endpoint: '/categories',
      columns: ['id', 'nombre'],
      fields: [{ key: 'nombre', label: 'Nombre', required: true }],
    },
    pedidos: {
      title: 'Pedidos',
      singular: 'pedido',
      subtitle: 'Ventas y estado de entrega.',
      endpoint: '/orders',
      columns: ['id', 'buyer_name', 'nombre', 'estado', 'pago', 'direccion', 'telefono'],
      fields: [
        { key: 'nombre', label: 'Nombre de envío', required: true },
        { key: 'direccion', label: 'Dirección', required: true },
        { key: 'telefono', label: 'Teléfono', required: true },
      ],
    },
    informes: {
      title: 'Informes',
      singular: 'informe',
      subtitle: 'Incidencias que necesitan revisión.',
      endpoint: '/reports',
      columns: ['id', 'reportante', 'usuario_referenciado', 'informe', 'estado'],
      fields: [],
    },
  };
  constructor() {
    this.route.paramMap.subscribe((params) => {
      this.resource = params.get('resource') ?? '';
      this.config = this.configs[this.resource] ?? this.configs['usuarios'];
      this.closeForm();
      this.load();
      this.loadCategories();
    });
  }
  modalFields(): Field[] {
    const fields: Field[] = this.config.fields ?? [];
    if (this.editingRow() && this.resource === 'usuarios')
      return fields.map((field) =>
        field.key === 'password' || field.key === 'password_confirmation'
          ? { ...field, required: false }
          : field,
      );
    return fields;
  }
  private loadCategories() {
    this.api
      .get<{ id: number; nombre: string }[]>('/categories')
      .subscribe({ next: (items) => this.categories.set(items) });
  }
  load() {
    this.page = 1;
    this.fetchPage(true);
  }
  loadMore() {
    if (!this.busy() && this.hasMore()) {
      this.page++;
      this.fetchPage(false);
    }
  }
  private fetchPage(reset: boolean) {
    this.busy.set(true);
    this.message.set('');
    this.api.get<any>(this.config.endpoint, { page: this.page }).subscribe({
      next: (r) => {
        const incoming = Array.isArray(r) ? r : (r.data ?? []);
        this.rows.update((current) => (reset ? incoming : [...current, ...incoming]));
        this.hasMore.set(
          !Array.isArray(r) && (r.current_page ?? this.page) < (r.last_page ?? this.page),
        );
        this.busy.set(false);
      },
      error: (e) => {
        this.busy.set(false);
        this.message.set(e.error?.message ?? 'No se pudo cargar esta sección.');
      },
    });
  }
  image(path?: string) {
    return assetUrl(path, 'media/no-item.png');
  }
  imageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (!img.src.endsWith('media/no-item.png')) img.src = 'media/no-item.png';
  }
  imagePreview() {
    return (
      this.filePreview() ??
      (this.editingRow()?.imagen ? this.image(this.editingRow().imagen) : null)
    );
  }
  chooseFile(event: Event) {
    const old = this.filePreview();
    if (old?.startsWith('blob:')) URL.revokeObjectURL(old);
    this.file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.filePreview.set(this.file ? URL.createObjectURL(this.file) : null);
  }
  chooseDigitalFile(event: Event) {
    this.digitalFile = (event.target as HTMLInputElement).files?.[0] ?? null;
  }
  openCreate() {
    this.editingRow.set(null);
    this.formError.set('');
    this.draft.set({});
    this.file = null;
    this.digitalFile = null;
    this.filePreview.set(null);
    this.formOpen.set(true);
  }
  closeForm() {
    this.formOpen.set(false);
    this.editingRow.set(null);
    this.formError.set('');
    this.file = null;
    this.digitalFile = null;
    const old = this.filePreview();
    if (old?.startsWith('blob:')) URL.revokeObjectURL(old);
    this.filePreview.set(null);
  }
  setDraft(key: string, value: any) {
    this.draft.update((current) => ({ ...current, [key]: value }));
  }
  saveForm() {
    if (this.editingRow()) this.saveEdit();
    else this.create();
  }
  create() {
    this.busy.set(true);
    this.formError.set('');
    let body: any = this.draft();
    if (this.file || this.digitalFile) {
      const form = new FormData();
      Object.entries(this.draft()).forEach(([key, value]) => form.append(key, String(value)));
      if (this.file) form.append('imagen', this.file);
      if (this.digitalFile) form.append('archivo_digital', this.digitalFile);
      body = form;
    }
    this.api.post(this.config.endpoint, body).subscribe({
      next: () => {
        this.busy.set(false);
        this.message.set('Registro creado.');
        this.closeForm();
        this.load();
      },
      error: (e) => {
        this.busy.set(false);
        this.formError.set(e.error?.message ?? 'No se pudo guardar el registro.');
      },
    });
  }
  edit(row: any) {
    const keys =
      this.resource === 'categorias'
        ? ['nombre']
        : this.resource === 'avisos'
          ? ['titulo', 'aviso']
          : this.config.fields.map((f: Field) => f.key);
    const fields = Object.fromEntries(
      keys.map((key: string) => [
        key,
        key === 'password' || key === 'password_confirmation' ? '' : (row[key] ?? ''),
      ]),
    );
    if (this.resource === 'productos') fields['id_tipo'] = Number(fields['id_tipo']);
    if (this.resource === 'publicaciones') fields['id_categoria'] = Number(fields['id_categoria']);
    this.editingRow.set(row);
    this.draft.set(fields);
    this.file = null;
    this.filePreview.set(null);
    this.formError.set('');
    this.formOpen.set(true);
  }
  saveEdit() {
    const row = this.editingRow();
    if (!row) return;
    this.busy.set(true);
    this.formError.set('');
    const path =
      this.resource === 'usuarios' ? `/admin/users/${row.id}` : `${this.config.endpoint}/${row.id}`;
    let body: any = this.draft();
    if (this.file || this.digitalFile) {
      const form = new FormData();
      Object.entries(this.draft()).forEach(([key, value]) => form.append(key, String(value)));
      if (this.file) form.append('imagen', this.file);
      if (this.digitalFile) form.append('archivo_digital', this.digitalFile);
      form.append('_method', 'PATCH');
      body = form;
    }
    const req = body instanceof FormData ? this.api.post(path, body) : this.api.patch(path, body);
    req.subscribe({
      next: () => {
        this.busy.set(false);
        this.closeForm();
        this.message.set('Cambios guardados.');
        this.load();
      },
      error: (e) => {
        this.busy.set(false);
        this.formError.set(e.error?.message ?? 'No se pudo actualizar.');
      },
    });
  }
  remove(row: any) {
    this.pendingAction = () => {
      const path =
        this.resource === 'usuarios'
          ? `/admin/users/${row.id}`
          : `${this.config.endpoint}/${row.id}`;
      this.api.delete(path).subscribe({
        next: () => {
          this.rows.update((list) => list.filter((item) => item.id !== row.id));
          this.message.set('Registro eliminado.');
        },
        error: (e) => this.message.set(e.error?.message ?? 'No se pudo eliminar.'),
      });
    };
    this.confirmation.set({
      message: `¿Quieres eliminar «${row.nombre ?? row.usuario ?? row.titulo ?? 'este registro'}»?`,
    });
  }
  dismissConfirmation() {
    this.confirmation.set(null);
    this.pendingAction = null;
  }
  confirmRemoval() {
    const action = this.pendingAction;
    this.dismissConfirmation();
    action?.();
  }
  visibility(row: any) {
    this.api
      .patch<{ tipo: string }>(`/publications/${row.id}/visibility`, {})
      .subscribe({
        next: (r) =>
          this.rows.update((list) =>
            list.map((item) => (item.id === row.id ? { ...item, tipo: r.tipo } : item)),
          ),
        error: (e) => this.message.set(e.error?.message ?? 'No se pudo cambiar la visibilidad.'),
      });
  }
  status(row: any, select: HTMLSelectElement) {
    const path = this.resource === 'pedidos' ? `/orders/${row.id}/status` : `/reports/${row.id}`;
    this.api
      .patch<{ estado: string }>(path, { estado: select.value })
      .subscribe({
        // El servidor decide el estado final: en pedidos puede ser "pendiente de confirmar".
        next: (r) =>
          this.rows.update((list) =>
            list.map((item) => (item.id === row.id ? { ...item, estado: r.estado } : item)),
          ),
        error: (e) => {
          select.value = row.estado;
          this.message.set(e.error?.message ?? 'No se pudo cambiar el estado.');
        },
      });
  }
  loadParticipants(event: any) {
    this.selectedEvent.set(event);
    this.api
      .get<any[]>(`/events/${event.id}/participants`)
      .subscribe({
        next: (list) => this.participants.set(list),
        error: (e) =>
          this.message.set(e.error?.message ?? 'No se pudieron cargar los participantes.'),
      });
  }
  decideParticipant(person: any, state: 'aceptado' | 'rechazado') {
    const event = this.selectedEvent();
    if (!event) return;
    this.api
      .patch(`/events/${event.id}/participants/${person.id}`, { estado: state })
      .subscribe({
        next: () =>
          this.participants.update((list) =>
            list.map((item) => (item.id === person.id ? { ...item, estado: state } : item)),
          ),
        error: (e) => this.message.set(e.error?.message ?? 'No se pudo actualizar la solicitud.'),
      });
  }
  format(value: any) {
    return value === null || value === undefined ? '—' : String(value);
  }
}
