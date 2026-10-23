import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/landing').then(m => m.LandingPage), title: 'ArtistApp — arte independiente' },
  { path: 'login', loadComponent: () => import('./pages/auth-page').then(m => m.AuthPage), data: { mode: 'login' }, title: 'Entrar · ArtistApp' },
  { path: 'registro', loadComponent: () => import('./pages/auth-page').then(m => m.AuthPage), data: { mode: 'register' }, title: 'Crear cuenta · ArtistApp' },
  { path: 'recuperar', loadComponent: () => import('./pages/auth-page').then(m => m.AuthPage), data: { mode: 'recover' }, title: 'Recuperar acceso · ArtistApp' },
  { path: 'restablecer', loadComponent: () => import('./pages/auth-page').then(m => m.AuthPage), data: { mode: 'reset' }, title: 'Nueva contraseña · ArtistApp' },
  { path: 'descubrir', loadComponent: () => import('./pages/discover-page').then(m => m.DiscoverPage), title: 'Descubrir · ArtistApp' },
  { path: 'tienda', loadComponent: () => import('./pages/shop-page').then(m => m.ShopPage), title: 'Tienda · ArtistApp' },
  { path: 'cesta', canActivate: [authGuard], loadComponent: () => import('./pages/cart-page').then(m => m.CartPage), title: 'Tu cesta · ArtistApp' },
  { path: 'checkout', canActivate: [authGuard], loadComponent: () => import('./pages/checkout-page').then(m => m.CheckoutPage), title: 'Finalizar compra · ArtistApp' },
  { path: 'perfil', canActivate: [authGuard], loadComponent: () => import('./pages/profile-page').then(m => m.ProfilePage), title: 'Mi espacio · ArtistApp' },
  { path: 'pedidos', canActivate: [authGuard], loadComponent: () => import('./pages/orders-page').then(m => m.OrdersPage), title: 'Pedidos · ArtistApp' },
  { path: 'avisos', canActivate: [authGuard], loadComponent: () => import('./pages/notifications-page').then(m => m.NotificationsPage), title: 'Avisos · ArtistApp' },
  { path: 'mensajes', canActivate: [authGuard], loadComponent: () => import('./pages/messages-page').then(m => m.MessagesPage), title: 'Mensajes · ArtistApp' },
  { path: 'mensajes/artista/:id', canActivate: [authGuard], loadComponent: () => import('./pages/chat-page').then(m => m.ChatPage), data: { mode: 'direct' }, title: 'Chat con artista · ArtistApp' },
  { path: 'mensajes/evento/:id', canActivate: [authGuard], loadComponent: () => import('./pages/chat-page').then(m => m.ChatPage), data: { mode: 'event' }, title: 'Chat de evento · ArtistApp' },
  { path: 'informes', canActivate: [authGuard], loadComponent: () => import('./pages/reports-page').then(m => m.ReportsPage), title: 'Informes · ArtistApp' },
  { path: 'artistas/:id', loadComponent: () => import('./pages/artist-page').then(m => m.ArtistPage), title: 'Artista · ArtistApp' },
  { path: 'admin', canActivate: [adminGuard], loadComponent: () => import('./pages/admin-dashboard').then(m => m.AdminDashboard), title: 'Administración · ArtistApp' },
  { path: 'admin/:resource', canActivate: [adminGuard], loadComponent: () => import('./pages/admin-resource').then(m => m.AdminResource), title: 'Gestionar · ArtistApp' },
  { path: '**', redirectTo: '' }
];
