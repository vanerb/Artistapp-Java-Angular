import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';

 type DashboardLink = { title: string; description: string; icon: string; route: string; tone: string; queryParams?: Record<string, string> };

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="dashboard">
      <span class="kicker">TU ESPACIO EN ARTISTAPP</span>
      <h1>Hola, {{ auth.user()?.nombre || auth.user()?.usuario || 'bienvenida/o' }}.</h1>
      <p class="intro">{{ subtitle() }}</p>

      <div class="welcome">
        <div>
          <span class="eyebrow">TU CUENTA</span>
          <h2>{{ roleName() }}</h2>
          <p>{{ welcomeText() }}</p>
        </div>
        <a routerLink="/perfil" class="primary">Mi perfil <span>↗</span></a>
      </div>

      <h2 class="section-title">¿Qué quieres hacer hoy?</h2>
      <div class="cards">
        @for (item of links(); track item.title) {
          <a class="action-card" [routerLink]="item.route" [queryParams]="item.queryParams">
            <span class="icon" [class]="'icon ' + item.tone">{{ item.icon }}</span>
            <span class="card-copy"><strong>{{ item.title }}</strong><small>{{ item.description }}</small></span>
            <b class="arrow">↗</b>
          </a>
        }
      </div>

      <div class="bottom-note">
        <span class="note-mark">✳</span>
        <div><strong>Un espacio para el arte independiente</strong><p>Descubre nuevas obras, conecta con la comunidad y encuentra inspiración.</p></div>
        <a routerLink="/descubrir">Explorar comunidad →</a>
      </div>
    </section>
  `,
  styles: [`
    :host{display:block;color:#272432}.dashboard{max-width:1150px;margin:auto;padding:55px 25px 90px}.kicker{color:#7045d4;font-size:9px;font-weight:850;letter-spacing:.15em}.dashboard h1{font-size:clamp(42px,6vw,64px);letter-spacing:-.075em;margin:12px 0}.intro{font-size:13px;color:#77727e;margin:0 0 28px}.welcome{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:25px 27px;background:#29253a;color:white;border-radius:18px}.eyebrow{font-size:9px;font-weight:800;letter-spacing:.15em;color:#d9fa72}.welcome h2{font-size:25px;letter-spacing:-.04em;margin:8px 0}.welcome p{font-size:12px;color:#e2deeb;margin:0;max-width:620px;line-height:1.6}.primary{flex-shrink:0;padding:12px 17px;border-radius:999px;background:#d9fa72;color:#29253a;text-decoration:none;font-size:11px;font-weight:800}.primary span{margin-left:8px}.section-title{font-size:21px;letter-spacing:-.04em;margin:34px 0 14px}.cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.action-card{display:flex;align-items:center;gap:14px;padding:17px;background:#fffdf9;border:1px solid #ece5de;border-radius:15px;text-decoration:none;color:#272432;transition:transform .2s,box-shadow .2s}.action-card:hover{transform:translateY(-2px);box-shadow:0 10px 25px #27243212}.icon{display:grid;place-items:center;flex:0 0 43px;height:43px;border-radius:13px;font-size:21px}.purple{background:#eee9fb;color:#7045d4}.peach{background:#f7e5d7;color:#a75a32}.green{background:#eaf2d5;color:#526b25}.cream{background:#f2eee7;color:#6d6257}.card-copy{flex:1;min-width:0}.card-copy strong,.card-copy small{display:block}.card-copy strong{font-size:12px}.card-copy small{font-size:10px;color:#77727e;margin-top:5px;line-height:1.5}.arrow{color:#7045d4}.bottom-note{display:flex;align-items:center;gap:14px;margin-top:20px;padding:18px 20px;border:1px solid #ece5de;border-radius:15px;background:#f7f3ec}.note-mark{font-size:25px;color:#7045d4}.bottom-note div{flex:1}.bottom-note strong{font-size:12px}.bottom-note p{font-size:10px;color:#77727e;margin:5px 0 0}.bottom-note a{font-size:10px;font-weight:800;color:#7045d4;text-decoration:none;white-space:nowrap}@media(max-width:700px){.dashboard{padding:38px 17px 60px}.welcome{align-items:flex-start;flex-direction:column}.cards{grid-template-columns:1fr}.bottom-note{align-items:flex-start;flex-wrap:wrap}.bottom-note a{margin-left:39px}}
  `]
})
export class UserDashboard {
  readonly auth = inject(AuthService);
  readonly role = computed(() => Number(this.auth.user()?.id_tipo));
  readonly roleName = computed(() => ({ 3: 'Organizador de eventos', 5: 'Artista', 7: 'Admirador' } as Record<number,string>)[this.role()] ?? 'Mi cuenta');
  readonly subtitle = computed(() => this.role() === 5 ? 'Gestiona tus obras, comparte tu creatividad y sigue tus ventas.' : this.role() === 3 ? 'Organiza encuentros, comparte tus obras y gestiona tus productos.' : 'Descubre arte independiente, guarda tus favoritos y consulta tus compras.');
  readonly welcomeText = computed(() => this.role() === 5 ? 'Tu espacio para publicar obras, mantener tu catálogo y consultar los pedidos de tus compradores.' : this.role() === 3 ? 'Todo lo que necesitas para compartir publicaciones, organizar eventos y vender productos.' : 'Explora la comunidad artística, encuentra piezas originales y mantén tus compras bajo control.');
  readonly links = computed<DashboardLink[]>(() => {
    const common: DashboardLink[] = [
      { title: 'Descubrir arte', description: 'Explora publicaciones, artistas y eventos de la comunidad.', icon: '✳', route: '/descubrir', tone: 'peach' },
      { title: 'Tienda', description: 'Encuentra obras y productos originales.', icon: '◇', route: '/tienda', tone: 'green' },
      { title: 'Mis compras', description: 'Consulta el estado de tus pedidos y confirma las entregas.', icon: '↗', route: '/pedidos', tone: 'cream' },
      { title: 'Mensajes', description: 'Continúa tus conversaciones.', icon: '✉', route: '/mensajes', tone: 'purple' },
      { title: 'Avisos', description: 'Revisa las notificaciones de tu cuenta.', icon: '♧', route: '/avisos', tone: 'peach' },
      { title: 'Mi perfil', description: 'Edita tus datos personales y contraseña.', icon: '◉', route: '/perfil', tone: 'purple' },
    ];
    if (this.role() === 5) return [
      { title: 'Mis obras', description: 'Publica una obra o administra tus publicaciones.', icon: '▧', route: '/perfil', tone: 'purple' },
      { title: 'Mi tienda', description: 'Añade productos y gestiona tu catálogo.', icon: '◇', route: '/perfil', queryParams: { section: 'tienda' }, tone: 'green' },
      { title: 'Pedidos recibidos', description: 'Actualiza el estado de los pedidos de tus compradores.', icon: '↙', route: '/pedidos-recibidos', tone: 'cream' },
      common[0], common[1], common[2], common[3], common[4], common[5],
    ];
    if (this.role() === 3) return [
      { title: 'Mis publicaciones', description: 'Comparte novedades y administra tus obras.', icon: '▧', route: '/perfil', queryParams: { section: 'obras' }, tone: 'purple' },
      { title: 'Gestionar eventos', description: 'Consulta tus eventos y la participación.', icon: '⌁', route: '/perfil', queryParams: { section: 'eventos' }, tone: 'peach' },
      { title: 'Mi tienda', description: 'Añade productos y administra tu catálogo.', icon: '◇', route: '/perfil', queryParams: { section: 'tienda' }, tone: 'green' },
      { title: 'Pedidos recibidos', description: 'Gestiona los pedidos de tus productos.', icon: '↙', route: '/pedidos-recibidos', tone: 'cream' },
      common[0], common[1], common[2], common[3], common[4], common[5],
    ];
    return [common[0], common[1], common[2], common[3], common[4], common[5],
      { title: 'Mis favoritos', description: 'Vuelve a las obras que has guardado.', icon: '♡', route: '/perfil', queryParams: { section: 'favoritos' }, tone: 'peach' }];
  });
}
