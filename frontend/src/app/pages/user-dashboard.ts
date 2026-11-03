import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';

type DashboardLink = {
  title: string;
  description: string;
  icon: string;
  route: string;
  tone: string;
  queryParams?: Record<string, string>;
};

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.css',
})
export class UserDashboard {
  readonly auth = inject(AuthService);
  readonly role = computed(() => Number(this.auth.user()?.id_tipo));
  readonly roleName = computed(
    () =>
      (({ 3: 'Organizador de eventos', 5: 'Artista', 7: 'Admirador' }) as Record<number, string>)[
        this.role()
      ] ?? 'Mi cuenta',
  );
  readonly subtitle = computed(() =>
    this.role() === 5
      ? 'Gestiona tus obras, comparte tu creatividad y sigue tus ventas.'
      : this.role() === 3
        ? 'Organiza encuentros, comparte tus obras y gestiona tus productos.'
        : 'Descubre arte independiente, guarda tus favoritos y consulta tus compras.',
  );
  readonly welcomeText = computed(() =>
    this.role() === 5
      ? 'Tu espacio para publicar obras, mantener tu catálogo y consultar los pedidos de tus compradores.'
      : this.role() === 3
        ? 'Todo lo que necesitas para compartir publicaciones, organizar eventos y vender productos.'
        : 'Explora la comunidad artística, encuentra piezas originales y mantén tus compras bajo control.',
  );
  readonly links = computed<DashboardLink[]>(() => {
    const common: DashboardLink[] = [
      {
        title: 'Descubrir arte',
        description: 'Explora publicaciones, artistas y eventos de la comunidad.',
        icon: '✳',
        route: '/descubrir',
        tone: 'peach',
      },
      {
        title: 'Tienda',
        description: 'Encuentra obras y productos originales.',
        icon: '◇',
        route: '/tienda',
        tone: 'green',
      },
      {
        title: 'Mis compras',
        description: 'Consulta el estado de tus pedidos y confirma las entregas.',
        icon: '↗',
        route: '/pedidos',
        tone: 'cream',
      },
      {
        title: 'Mensajes',
        description: 'Continúa tus conversaciones.',
        icon: '✉',
        route: '/mensajes',
        tone: 'purple',
      },
      {
        title: 'Avisos',
        description: 'Revisa las notificaciones de tu cuenta.',
        icon: '♧',
        route: '/avisos',
        tone: 'peach',
      },
      {
        title: 'Mi perfil',
        description: 'Edita tus datos personales y contraseña.',
        icon: '◉',
        route: '/perfil',
        tone: 'purple',
      },
    ];
    if (this.role() === 5)
      return [
        {
          title: 'Mis obras',
          description: 'Publica una obra o administra tus publicaciones.',
          icon: '▧',
          route: '/perfil',
          tone: 'purple',
        },
        {
          title: 'Mi tienda',
          description: 'Añade productos y gestiona tu catálogo.',
          icon: '◇',
          route: '/perfil',
          queryParams: { section: 'tienda' },
          tone: 'green',
        },
        {
          title: 'Pedidos recibidos',
          description: 'Actualiza el estado de los pedidos de tus compradores.',
          icon: '↙',
          route: '/pedidos-recibidos',
          tone: 'cream',
        },
        common[0],
        common[1],
        common[2],
        common[3],
        common[4],
        common[5],
      ];
    if (this.role() === 3)
      return [
        {
          title: 'Mis publicaciones',
          description: 'Comparte novedades y administra tus obras.',
          icon: '▧',
          route: '/perfil',
          queryParams: { section: 'obras' },
          tone: 'purple',
        },
        {
          title: 'Gestionar eventos',
          description: 'Consulta tus eventos y la participación.',
          icon: '⌁',
          route: '/perfil',
          queryParams: { section: 'eventos' },
          tone: 'peach',
        },
        {
          title: 'Mi tienda',
          description: 'Añade productos y administra tu catálogo.',
          icon: '◇',
          route: '/perfil',
          queryParams: { section: 'tienda' },
          tone: 'green',
        },
        {
          title: 'Pedidos recibidos',
          description: 'Gestiona los pedidos de tus productos.',
          icon: '↙',
          route: '/pedidos-recibidos',
          tone: 'cream',
        },
        common[0],
        common[1],
        common[2],
        common[3],
        common[4],
        common[5],
      ];
    return [
      common[0],
      common[1],
      common[2],
      common[3],
      common[4],
      common[5],
      {
        title: 'Mis favoritos',
        description: 'Vuelve a las obras que has guardado.',
        icon: '♡',
        route: '/perfil',
        queryParams: { section: 'favoritos' },
        tone: 'peach',
      },
    ];
  });
}
