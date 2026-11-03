import { Component, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { CartState } from '../core/cart-state';
import { NotificationState } from '../core/notification-state';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
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
