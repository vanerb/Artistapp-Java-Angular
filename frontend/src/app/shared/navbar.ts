import { Component, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { CartState } from '../core/cart-state';
import { NotificationState } from '../core/notification-state';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="topbar">
      <div class="bar-inner">
        <a class="brand" routerLink="/" aria-label="ArtistApp, ir al inicio" (click)="closeMenu()">
          <span class="brand-mark" aria-hidden="true">a</span>
          <span class="brand-name">artist<span>app</span><b aria-hidden="true">✳</b></span>
        </a>

        <button
          class="menu-toggle"
          type="button"
          (click)="toggleMenu()"
          [attr.aria-expanded]="menuOpen()"
          aria-controls="primary-navigation"
          [attr.aria-label]="menuOpen() ? 'Cerrar navegación' : 'Abrir navegación'"
        >
          <span aria-hidden="true">{{ menuOpen() ? '×' : '☰' }}</span>
        </button>

        <nav id="primary-navigation" [class.open]="menuOpen()" aria-label="Navegación principal">
          <div class="nav-links">
            <a
              routerLink="/"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: true }"
              (click)="closeMenu()"
              >Inicio</a
            >
            <a routerLink="/descubrir" routerLinkActive="active" (click)="closeMenu()">Descubrir</a>
            <a routerLink="/tienda" routerLinkActive="active" (click)="closeMenu()">Tienda</a>
          </div>

          <div class="nav-actions">
            @if (auth.isAuthenticated()) {
              <a
                class="utility-link"
                routerLink="/mensajes"
                routerLinkActive="active"
                (click)="closeMenu()"
                aria-label="Mensajes"
                title="Mensajes"
                ><svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5 8 8 0 0 1-3.2-.7L4 20l1.7-4.3A7.4 7.4 0 0 1 5 12a7.5 7.5 0 1 1 15 0Z"
                  />
                  <path d="M8.5 12h7M8.5 9h5" /></svg
              ></a>
              <a
                class="utility-link"
                routerLink="/cesta"
                routerLinkActive="active"
                (click)="closeMenu()"
                aria-label="Cesta"
                title="Cesta"
                ><svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M3 4h2l2.2 10.1a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 1.9-1.4L22 8H6M10 20h.01M18 20h.01"
                  />
                </svg>
                @if (cart.count()) {
                  <span class="utility-badge">{{ cart.count() }}</span>
                }
              </a>
              <a
                class="utility-link"
                routerLink="/avisos"
                routerLinkActive="active"
                (click)="closeMenu()"
                aria-label="Avisos"
                title="Avisos"
                ><svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
                </svg>
                @if (notifications.unread()) {
                  <span class="utility-badge">{{ notifications.unread() }}</span>
                }
              </a>
              <div class="account-menu" [class.expanded]="accountOpen()">
                <button
                  class="account-trigger"
                  type="button"
                  (click)="toggleAccount()"
                  [attr.aria-expanded]="accountOpen()"
                  aria-haspopup="true"
                >
                  <span class="avatar">{{ auth.user()?.nombre?.charAt(0) || 'A' }}</span>
                  <span class="account-label"
                    ><small>MI CUENTA</small
                    ><strong>{{ auth.user()?.nombre || 'Perfil' }}</strong></span
                  >
                  <span class="chevron" aria-hidden="true">⌄</span>
                </button>
                @if (accountOpen()) {
                  <div class="account-dropdown" role="menu">
                    <a
                      role="menuitem"
                      routerLink="/perfil"
                      routerLinkActive="active"
                      (click)="closeAll()"
                      ><span>◉</span> Mi espacio</a
                    >
                    <a
                      role="menuitem"
                      routerLink="/mensajes"
                      routerLinkActive="active"
                      (click)="closeAll()"
                      ><span>✉</span> Mensajes</a
                    >
                    <a
                      role="menuitem"
                      routerLink="/pedidos"
                      routerLinkActive="active"
                      (click)="closeAll()"
                      ><span>↗</span> Mis pedidos</a
                    >
                    <a
                      role="menuitem"
                      routerLink="/cesta"
                      routerLinkActive="active"
                      (click)="closeAll()"
                      ><span>◇</span> Mi cesta</a
                    >
                    <a
                      role="menuitem"
                      routerLink="/informes"
                      routerLinkActive="active"
                      (click)="closeAll()"
                      ><span>⚑</span> Informes</a
                    >
                    @if (!auth.isAdmin()) {
                      <a
                        class="admin-link"
                        role="menuitem"
                        routerLink="/panel"
                        routerLinkActive="active"
                        (click)="closeAll()"
                        ><span>✳</span> Mi panel</a
                      >
                    }

                    @if (auth.isAdmin()) {
                      <a
                        class="admin-link"
                        role="menuitem"
                        routerLink="/admin"
                        routerLinkActive="active"
                        (click)="closeAll()"
                        ><span>✳</span> Administración</a
                      >
                    }
                    <button role="menuitem" type="button" class="logout-button" (click)="logout()">
                      <span>↪</span> Cerrar sesión
                    </button>
                  </div>
                }
              </div>
            } @else {
              <a
                class="login-link"
                routerLink="/login"
                routerLinkActive="active"
                (click)="closeMenu()"
                >Entrar</a
              >
              <a class="join-link" routerLink="/registro" (click)="closeMenu()"
                >Crear cuenta <span aria-hidden="true">↗</span></a
              >
            }
          </div>
        </nav>
      </div>
    </header>
  `,
  styles: [
    `
      :host {
        display: block;
        position: relative;
        z-index: 30;
      }
      .topbar {
        position: sticky;
        top: 0;
        z-index: 30;
        background: rgba(250, 247, 241, 0.94);
        border-bottom: 1px solid #e9e2da;
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
      }
      .bar-inner {
        max-width: 1480px;
        min-height: 78px;
        margin: 0 auto;
        padding: 0 clamp(20px, 4.5vw, 68px);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 34px;
      }
      .brand {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        gap: 10px;
        text-decoration: none;
        color: #272432;
      }
      .brand-mark {
        display: grid;
        place-items: center;
        width: 38px;
        height: 38px;
        border-radius: 14px 14px 14px 5px;
        background: #d9fa72;
        color: #272432;
        font:
          900 25px Georgia,
          serif;
      }
      .brand-name {
        position: relative;
        font-size: 21px;
        font-weight: 900;
        letter-spacing: -1.4px;
      }
      .brand-name > span {
        color: #7045d4;
      }
      .brand-name b {
        position: absolute;
        top: -3px;
        right: -12px;
        color: #f17867;
        font-size: 10px;
      }
      nav {
        min-width: 0;
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 22px;
      }
      .nav-links,
      .nav-actions {
        display: flex;
        align-items: center;
        gap: clamp(12px, 1.6vw, 24px);
      }
      .nav-links a,
      .login-link {
        position: relative;
        padding: 12px 0;
        color: #5d5865;
        text-decoration: none;
        white-space: nowrap;
        font-size: 12px;
        font-weight: 700;
        transition: color 0.18s ease;
      }
      .nav-links a:hover,
      .login-link:hover,
      .nav-links a.active,
      .login-link.active {
        color: #7045d4;
      }
      .cart-count {
        display: inline-grid;
        place-items: center;
        min-width: 19px;
        height: 19px;
        margin-left: 4px;
        padding: 0 5px;
        border-radius: 99px;
        background: #d9fa72;
        color: #272432;
        font-size: 10px;
        font-weight: 850;
      }
      .nav-links a.active:after,
      .login-link.active:after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: 4px;
        height: 2px;
        border-radius: 2px;
        background: #d9fa72;
      }
      .nav-actions {
        flex: 0 0 auto;
        gap: 17px;
      }
      .utility-link {
        position: relative;
        display: grid;
        place-items: center;
        width: 41px;
        height: 41px;
        border: 1px solid #e9e2da;
        border-radius: 50%;
        background: #fffdf9;
        color: #5d5865;
        transition:
          color 0.18s,
          border-color 0.18s,
          transform 0.18s;
      }
      .utility-link:hover,
      .utility-link.active {
        color: #7045d4;
        border-color: #d3c4f2;
        transform: translateY(-1px);
      }
      .utility-link svg {
        width: 19px;
        height: 19px;
        fill: none;
        stroke: currentColor;
        stroke-width: 1.8;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      .utility-badge {
        position: absolute;
        top: -5px;
        right: -5px;
        display: grid;
        place-items: center;
        min-width: 18px;
        height: 18px;
        padding: 0 4px;
        border: 2px solid #faf7f1;
        border-radius: 99px;
        background: #d9fa72;
        color: #272432;
        font-size: 9px;
        font-weight: 850;
      }
      .account-menu {
        position: relative;
      }
      .account-trigger {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 5px 10px 5px 5px;
        border: 1px solid #e9e2da;
        border-radius: 999px;
        background: #fffdf9;
        color: #272432;
        text-align: left;
        cursor: pointer;
        transition:
          border-color 0.18s,
          box-shadow 0.18s;
      }
      .account-trigger:hover,
      .account-menu.expanded .account-trigger {
        border-color: #d3c4f2;
        box-shadow: 0 5px 18px #2724320d;
      }
      .avatar {
        display: grid;
        place-items: center;
        width: 37px;
        height: 37px;
        border-radius: 50%;
        background: #d9fa72;
        color: #302744;
        font-size: 15px;
        font-weight: 850;
      }
      .account-label {
        display: grid;
        gap: 2px;
        min-width: 84px;
      }
      .account-label small {
        color: #928b98;
        font-size: 8px;
        font-weight: 800;
        letter-spacing: 0.12em;
      }
      .account-label strong {
        max-width: 130px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 11px;
      }
      .chevron {
        color: #77727e;
        font-size: 16px;
        transition: transform 0.18s;
      }
      .expanded .chevron {
        transform: rotate(180deg);
      }
      .account-dropdown {
        position: absolute;
        top: calc(100% + 11px);
        right: 0;
        z-index: 50;
        width: 225px;
        padding: 8px;
        border: 1px solid #ece5de;
        border-radius: 16px;
        background: #fffdf9;
        box-shadow: 0 18px 45px #2724321a;
        animation: menu-in 0.16s ease-out;
      }
      .account-dropdown a,
      .account-dropdown button {
        display: flex;
        align-items: center;
        gap: 11px;
        width: 100%;
        padding: 12px;
        border: 0;
        border-radius: 10px;
        background: transparent;
        color: #4f4a57;
        text-align: left;
        text-decoration: none;
        font:
          650 12px system-ui,
          sans-serif;
        cursor: pointer;
      }
      .account-dropdown a:hover,
      .account-dropdown button:hover,
      .account-dropdown a.active {
        background: #f5f1eb;
        color: #7045d4;
      }
      .account-dropdown a > span,
      .account-dropdown button > span {
        width: 18px;
        color: #7958c4;
        text-align: center;
      }
      .account-dropdown .admin-link {
        margin-top: 5px;
        border-top: 1px solid #eee8e1;
        border-radius: 0 0 10px 10px;
        color: #4b3d9a;
        font-weight: 800;
      }
      .account-dropdown .logout-button {
        margin-top: 5px;
        border-top: 1px solid #eee8e1;
        border-radius: 0 0 10px 10px;
        color: #a94c47;
      }
      .account-dropdown .logout-button span {
        color: #a94c47;
      }
      .join-link {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 9px;
        min-height: 42px;
        padding: 0 17px;
        border: 0;
        border-radius: 999px;
        background: #7045d4;
        color: white;
        text-decoration: none;
        white-space: nowrap;
        font:
          750 12px system-ui,
          sans-serif;
        cursor: pointer;
        transition:
          background 0.18s ease,
          transform 0.18s ease;
      }
      .join-link:hover {
        background: #5834b4;
        transform: translateY(-1px);
      }
      .join-link span {
        color: #d9fa72;
      }
      .menu-toggle {
        display: none;
      }
      @keyframes menu-in {
        from {
          opacity: 0;
          transform: translateY(-5px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @media (max-width: 1080px) {
        .bar-inner {
          gap: 20px;
          padding-inline: 24px;
        }
        .nav-links,
        .nav-actions {
          gap: 13px;
        }
        .nav-links a,
        .login-link {
          font-size: 11px;
        }
        .user-label {
          display: none;
        }
      }
      @media (max-width: 820px) {
        .bar-inner {
          min-height: 70px;
          padding-inline: 20px;
        }
        .menu-toggle {
          display: grid;
          place-items: center;
          flex: 0 0 42px;
          width: 42px;
          height: 42px;
          margin-left: auto;
          border: 1px solid #e9e2da;
          border-radius: 13px;
          background: #fffdf9;
          color: #272432;
          font-size: 21px;
          cursor: pointer;
        }
        nav {
          display: none;
          position: absolute;
          top: calc(100% + 1px);
          left: 0;
          right: 0;
          max-height: calc(100dvh - 72px);
          overflow: auto;
          padding: 18px 20px 22px;
          background: #fffdf9;
          border-bottom: 1px solid #e9e2da;
          box-shadow: 0 18px 35px #27243218;
          flex-direction: column;
          align-items: stretch;
          gap: 16px;
        }
        nav.open {
          display: flex;
        }
        .nav-links,
        .nav-actions {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 7px;
        }
        .nav-links a,
        .login-link {
          padding: 13px 12px;
          border-radius: 11px;
          background: #f8f5ef;
          font-size: 13px;
        }
        .nav-links a.active:after,
        .login-link.active:after {
          left: 12px;
          right: auto;
          bottom: 7px;
          width: 22px;
        }
        .nav-actions {
          padding-top: 14px;
          border-top: 1px solid #eee8e1;
        }
        .account-menu {
          grid-column: 1/-1;
        }
        .account-trigger {
          width: 100%;
          border-radius: 13px;
          padding: 8px;
        }
        .account-label {
          flex: 1;
        }
        .account-dropdown {
          position: static;
          width: 100%;
          margin-top: 8px;
          box-shadow: none;
          animation: none;
        }
        .utility-link {
          justify-self: start;
        }
        .join-link {
          min-height: 46px;
        }
        .login-link {
          text-align: center;
        }
      }
      @media (max-width: 420px) {
        .bar-inner {
          padding-inline: 16px;
        }
        .nav-links,
        .nav-actions {
          grid-template-columns: 1fr;
        }
        .nav-links a {
          padding: 12px;
        }
        .nav-actions {
          gap: 9px;
        }
        .user-label {
          grid-column: auto;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        *,
        *:before,
        *:after {
          scroll-behavior: auto !important;
          transition: none !important;
        }
      }
    `,
  ],
})
export class Navbar {
  readonly auth = inject(AuthService);
  readonly cart = inject(CartState);
  readonly notifications = inject(NotificationState);
  readonly menuOpen = signal(false);
  readonly accountOpen = signal(false);

  constructor() {
    effect(() => {
      if (this.auth.isAuthenticated()) {
        this.cart.refresh();
        this.notifications.refresh();
      } else {
        this.cart.count.set(0);
        this.notifications.unread.set(0);
      }
    });
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }
  toggleAccount(): void {
    this.accountOpen.update((open) => !open);
  }
  closeMenu(): void {
    this.menuOpen.set(false);
  }
  closeAll(): void {
    this.closeMenu();
    this.accountOpen.set(false);
  }
  logout(): void {
    this.closeAll();
    this.auth.logout();
  }
}
