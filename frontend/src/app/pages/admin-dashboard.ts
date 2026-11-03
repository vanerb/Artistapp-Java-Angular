import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Api } from '../core/api';
type Summary = {
  usuarios: number;
  publicaciones: number;
  productos: number;
  eventos: number;
  pedidos_pendientes: number;
  informes_pendientes: number;
  ventas: number;
};
@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard {
  private readonly api = inject(Api);
  readonly stats = signal<Summary>({
    usuarios: 0,
    publicaciones: 0,
    productos: 0,
    eventos: 0,
    pedidos_pendientes: 0,
    informes_pendientes: 0,
    ventas: 0,
  });
  readonly message = signal('');
  readonly resources = [
    { path: 'usuarios', name: 'Usuarios', description: 'Perfiles y permisos', icon: '♙' },
    {
      path: 'publicaciones',
      name: 'Publicaciones',
      description: 'Obras de la comunidad',
      icon: '▧',
    },
    { path: 'productos', name: 'Productos', description: 'Catálogo y stock', icon: '◇' },
    { path: 'eventos', name: 'Eventos', description: 'Encuentros y participantes', icon: '⌁' },
    { path: 'avisos', name: 'Avisos', description: 'Comunicados y novedades', icon: '✳' },
    { path: 'categorias', name: 'Categorías', description: 'Organizar la obra', icon: '◫' },
    { path: 'pedidos', name: 'Pedidos', description: 'Ventas y envíos', icon: '↗' },
    { path: 'informes', name: 'Informes', description: 'Revisar incidencias', icon: '⚑' },
  ];
  constructor() {
    this.api
      .get<Summary>('/admin/summary')
      .subscribe({
        next: (r) => this.stats.set(r),
        error: (e) => this.message.set(e.error?.message ?? 'No se pudo cargar el panel.'),
      });
  }
}
