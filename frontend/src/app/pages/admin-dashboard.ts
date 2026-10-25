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
  template: `<section class="admin">
    <span class="kicker">EL PULSO DE ARTISTAPP</span>
    <h1>Panel de control.</h1>
    <p>Una mirada rápida a lo que está pasando en la comunidad.</p>
    @if (message()) {
      <div class="message">{{ message() }}</div>
    }
    <div class="metrics">
      <article>
        <span>COMUNIDAD</span><strong>{{ stats().usuarios }}</strong
        ><small>perfiles creativos</small><b>✳</b>
      </article>
      <article>
        <span>OBRA PUBLICADA</span><strong>{{ stats().publicaciones }}</strong
        ><small>publicaciones</small><b>◒</b>
      </article>
      <article>
        <span>VENTA CREATIVA</span><strong>{{ stats().productos }}</strong
        ><small>piezas en tienda</small><b>↗</b>
      </article>
      <article>
        <span>VENTAS TOTALES</span><strong>{{ stats().ventas | currency: 'EUR' }}</strong
        ><small>{{ stats().pedidos_pendientes }} pedidos activos</small><b>€</b>
      </article>
    </div>
    <h2>Gestionar espacios</h2>
    <div class="resources">
      @for (item of resources; track item.path) {
        <a [routerLink]="['/admin', item.path]"
          ><span>{{ item.icon }}</span>
          <div>
            <strong>{{ item.name }}</strong
            ><small>{{ item.description }}</small>
          </div>
          <b>↗</b></a
        >
      }
    </div>
    <div class="alert-row">
      <div>
        <span class="kicker">A TENER EN CUENTA</span
        ><strong>{{ stats().informes_pendientes }} informes por revisar</strong>
      </div>
      <a routerLink="/admin/informes">Revisar cola →</a>
    </div>
  </section>`,
  styles: [
    `
      :host {
        display: block;
        color: #272432;
      }
      .admin {
        max-width: 1150px;
        margin: auto;
        padding: 55px 25px 90px;
      }
      .kicker {
        color: #7045d4;
        font-size: 9px;
        font-weight: 850;
        letter-spacing: 0.15em;
      }
      .admin h1 {
        font-size: clamp(42px, 6vw, 64px);
        letter-spacing: -0.075em;
        margin: 12px 0;
      }
      .admin > p {
        font-size: 13px;
        color: #77727e;
        margin: 0 0 27px;
      }
      .metrics {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
      }
      .metrics article {
        padding: 18px;
        min-height: 145px;
        background: #fffdf9;
        border: 1px solid #ece5de;
        border-radius: 16px;
        position: relative;
        overflow: hidden;
      }
      .metrics article:nth-child(2) {
        background: #eee9fb;
      }
      .metrics article:nth-child(3) {
        background: #f7e5d7;
      }
      .metrics article:nth-child(4) {
        background: #eaf2d5;
      }
      .metrics article > span,
      .metrics small {
        display: block;
        color: #77727e;
        font-size: 8px;
        font-weight: 800;
        letter-spacing: 0.1em;
      }
      .metrics strong {
        display: block;
        font-size: 27px;
        letter-spacing: -0.06em;
        margin: 12px 0 3px;
      }
      .metrics small {
        font-weight: 500;
        letter-spacing: 0;
      }
      .metrics b {
        position: absolute;
        right: 14px;
        top: 18px;
        color: #7045d4;
        font-size: 22px;
      }
      .admin > h2 {
        font-size: 21px;
        margin: 35px 0 14px;
      }
      .resources {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 9px;
      }
      .resources a {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 15px;
        background: #fffdf9;
        border: 1px solid #ece5de;
        border-radius: 13px;
        text-decoration: none;
        color: #272432;
        transition:
          transform 0.2s,
          box-shadow 0.2s;
      }
      .resources a:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px #27243212;
      }
      .resources a > span {
        width: 38px;
        height: 38px;
        border-radius: 12px;
        display: grid;
        place-items: center;
        background: #eee9fb;
        color: #7045d4;
        font-size: 19px;
      }
      .resources a div {
        flex: 1;
      }
      .resources strong,
      .resources small {
        display: block;
      }
      .resources strong {
        font-size: 12px;
      }
      .resources small {
        font-size: 10px;
        color: #77727e;
        margin-top: 4px;
      }
      .resources a > b {
        color: #7045d4;
      }
      .alert-row {
        margin-top: 20px;
        border-radius: 14px;
        padding: 17px 19px;
        background: #29253a;
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .alert-row .kicker {
        display: block;
        color: #d9fa72;
        margin-bottom: 6px;
      }
      .alert-row strong {
        font-size: 13px;
      }
      .alert-row a {
        font-size: 10px;
        color: #d9fa72;
        font-weight: 750;
        text-decoration: none;
      }
      .message {
        background: #fbe5e2;
        color: #85392f;
        padding: 12px;
        border-radius: 10px;
        font-size: 11px;
      }
      @media (max-width: 750px) {
        .metrics {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      @media (max-width: 540px) {
        .admin {
          padding: 38px 18px 60px;
        }
        .resources {
          grid-template-columns: 1fr;
        }
        .metrics article {
          min-height: 125px;
        }
        .alert-row {
          align-items: flex-start;
          gap: 10px;
          flex-direction: column;
        }
      }
    `,
  ],
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
