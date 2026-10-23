import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Api } from '../core/api';
import { Observable } from 'rxjs';

type AuthMode = 'login' | 'register' | 'recover' | 'reset';
type AuthForm = { user:string; password:string; password_confirmation:string; nombre:string; apellidos:string; usuario:string; correo:string; id_tipo:number; token:string };

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="auth-layout">
      <aside class="auth-art"><a class="mini-brand" routerLink="/">artistapp<span>✳</span></a><div><span class="kicker">UN LUGAR PROPIO PARA CREAR</span><h1>El arte nos<br>encuentra.</h1><p>Una comunidad abierta para compartir lo que haces y descubrir todo lo que te inspira.</p></div><img src="/carrousel/img3carrousel.jpg" alt="Arte de la comunidad ArtistApp"></aside>
      <div class="auth-panel">
        <a routerLink="/" class="back-link">← Volver a ArtistApp</a>
        @if (mode === 'login') {
          <span class="kicker">QUÉ BUENO VERTE</span><h2>Entra a tu espacio.</h2><p class="intro">Vuelve a tus artistas, tus ideas y tu comunidad.</p>
          <form (ngSubmit)="submit()"><label for="login-user">Usuario o correo</label><input id="login-user" name="user" [(ngModel)]="form.user" autocomplete="username" required placeholder="vanerb o correo@ejemplo.com"><label for="login-password">Contraseña</label><input id="login-password" name="password" [(ngModel)]="form.password" type="password" autocomplete="current-password" required placeholder="Tu contraseña"><button class="submit" [disabled]="busy">{{ busy ? 'Entrando…' : 'Entrar en ArtistApp' }}</button></form>
          <p class="footnote">¿Has olvidado la contraseña? <a routerLink="/recuperar">Recupérala aquí</a></p><p class="footnote">¿Todavía no tienes cuenta? <a routerLink="/registro">Crea tu espacio</a></p>
        } @else if (mode === 'register') {
          <span class="kicker">ENCUENTRA TU GENTE</span><h2>Crea tu espacio.</h2><p class="intro">Cuéntanos cómo quieres formar parte.</p>
          <form (ngSubmit)="submit()"><div class="two-col"><div><label for="first-name">Nombre</label><input id="first-name" name="nombre" [(ngModel)]="form.nombre" required autocomplete="given-name" placeholder="Tu nombre"></div><div><label for="last-name">Apellidos</label><input id="last-name" name="apellidos" [(ngModel)]="form.apellidos" required autocomplete="family-name" placeholder="Tus apellidos"></div></div><label for="new-user">Nombre de usuario</label><input id="new-user" name="usuario" [(ngModel)]="form.usuario" required autocomplete="username" placeholder="Tu alias creativo"><label for="email">Correo electrónico</label><input id="email" name="correo" [(ngModel)]="form.correo" type="email" required autocomplete="email" placeholder="tu@correo.com"><label for="account-type">Quiero participar como</label><select id="account-type" name="id_tipo" [(ngModel)]="form.id_tipo"><option [ngValue]="5">Artista</option><option [ngValue]="7">Amante del arte</option><option [ngValue]="3">Organizador de eventos</option></select><div class="two-col"><div><label for="new-password">Contraseña</label><input id="new-password" name="password" [(ngModel)]="form.password" type="password" autocomplete="new-password" required minlength="8" maxlength="240" placeholder="Mínimo 8 caracteres"></div><div><label for="confirm-password">Repite la contraseña</label><input id="confirm-password" name="password_confirmation" [(ngModel)]="form.password_confirmation" type="password" autocomplete="new-password" required placeholder="Repítela"></div></div><section class="password-requirements" aria-label="Requisitos de contraseña"><p>Tu contraseña debe incluir:</p><ul><li [class.met]="passwordHasMinLength()"><span>{{passwordHasMinLength()?'✓':'○'}}</span> Al menos 8 caracteres</li><li [class.met]="passwordHasLowercase()"><span>{{passwordHasLowercase()?'✓':'○'}}</span> Una letra minúscula</li><li [class.met]="passwordHasUppercase()"><span>{{passwordHasUppercase()?'✓':'○'}}</span> Una letra mayúscula</li><li [class.met]="passwordHasNumber()"><span>{{passwordHasNumber()?'✓':'○'}}</span> Un número</li><li [class.met]="passwordsMatch()"><span>{{passwordsMatch()?'✓':'○'}}</span> Las contraseñas coinciden</li></ul></section><button class="submit" [disabled]="busy||!registrationPasswordValid()">{{ busy ? 'Creando tu espacio…' : 'Crear cuenta' }}</button></form>
          <p class="footnote">¿Ya tienes una cuenta? <a routerLink="/login">Inicia sesión</a></p>
        } @else if (mode === 'recover') {
          <span class="kicker">RECUPERAR ACCESO</span><h2>Volvemos a encontrarnos.</h2><p class="intro">Escribe el correo de tu cuenta y te ayudaremos a recuperar el acceso.</p><form (ngSubmit)="submit()"><label for="recover-email">Correo electrónico</label><input id="recover-email" name="correo" [(ngModel)]="form.correo" type="email" autocomplete="email" required placeholder="tu@correo.com"><button class="submit" [disabled]="busy">{{ busy ? 'Enviando…' : 'Solicitar recuperación' }}</button></form><p class="footnote"><a routerLink="/login">← Volver al inicio de sesión</a></p>
        } @else {
          <span class="kicker">UN NUEVO COMIENZO</span><h2>Elige contraseña.</h2><p class="intro">Crea una contraseña nueva para volver a tu espacio creativo.</p><form (ngSubmit)="submit()"><label for="reset-password">Nueva contraseña</label><input id="reset-password" name="password" [(ngModel)]="form.password" type="password" autocomplete="new-password" required minlength="8"><label for="reset-confirm">Repite la contraseña</label><input id="reset-confirm" name="password_confirmation" [(ngModel)]="form.password_confirmation" type="password" autocomplete="new-password" required><button class="submit" [disabled]="busy">{{ busy ? 'Actualizando…' : 'Guardar contraseña' }}</button></form><p class="footnote"><a routerLink="/login">← Volver al inicio de sesión</a></p>
        }
        @if (message) { <div class="notice" [class.error]="isError" role="status">{{ message }}</div> }
      </div>
    </section>
  `,
  styles: [`
    :host{display:block;max-width:1200px;margin:38px auto 76px;padding:0 25px}.auth-layout{min-height:680px;display:grid;grid-template-columns:.85fr 1.15fr;border:1px solid #ebe4dd;border-radius:24px;overflow:hidden;background:#fffdf9;box-shadow:0 24px 70px #2a263412}.auth-art{padding:34px;display:flex;flex-direction:column;justify-content:space-between;background:#4b3d9a;color:white;position:relative;overflow:hidden}.auth-art:before,.auth-art:after{content:"";position:absolute;border-radius:50%;pointer-events:none}.auth-art:before{width:310px;height:310px;right:-150px;top:30px;background:#d9fa72;opacity:.2}.auth-art:after{width:250px;height:250px;left:-100px;bottom:60px;background:#f17867;opacity:.22}.mini-brand{position:relative;z-index:1;color:white;text-decoration:none;font-size:20px;font-weight:850;letter-spacing:-1px}.mini-brand span{color:#d9fa72;margin-left:5px;font-size:12px}.auth-art>div{position:relative;z-index:1}.auth-art .kicker{color:#d9fa72}.auth-art h1{font-size:clamp(48px,6vw,74px);line-height:.98;letter-spacing:-.075em;margin:16px 0}.auth-art p{max-width:340px;line-height:1.75;color:#e7e2f7;font-size:14px}.auth-art img{position:absolute;width:45%;height:235px;object-fit:cover;right:26px;bottom:28px;border-radius:100px 18px 18px 18px;transform:rotate(5deg);opacity:.4;mix-blend-mode:screen}.auth-panel{align-self:center;max-width:580px;width:100%;margin:0 auto;padding:clamp(28px,6vw,70px)}.back-link{display:inline-block;color:#756f7c;text-decoration:none;font-size:12px;font-weight:700;margin-bottom:42px}.kicker{display:block;font-size:9px;font-weight:850;letter-spacing:.16em;color:#7045d4;margin-bottom:13px}.auth-panel h2{font-size:clamp(34px,4vw,46px);letter-spacing:-.07em;line-height:1.04;margin:0 0 10px}.intro{color:#77727e;font-size:13px;line-height:1.7;margin:0 0 26px}.auth-panel form{display:flex;flex-direction:column;gap:0}.auth-panel label{font-size:11px;font-weight:750;margin:0 0 7px}.auth-panel input,.auth-panel select{height:47px;width:100%;border:1px solid #e5dfd7;border-radius:10px;background:white;padding:0 13px;font:14px system-ui;color:#272432;margin:0 0 16px;outline:none}.auth-panel input:focus,.auth-panel select:focus{border-color:#7045d4;box-shadow:0 0 0 3px #7045d41c}.two-col{display:grid;grid-template-columns:1fr 1fr;gap:13px}.two-col>div{min-width:0}.password-requirements{margin:-5px 0 10px;padding:11px 13px;border:1px solid #eee8e1;border-radius:12px;background:#faf8f3}.password-requirements p{margin:0 0 8px;color:#514c59;font-size:10px;font-weight:750}.password-requirements ul{display:grid;grid-template-columns:1fr 1fr;gap:6px 12px;list-style:none;padding:0;margin:0}.password-requirements li{display:flex;align-items:center;gap:7px;color:#8b8491;font-size:10px;transition:color .16s}.password-requirements li span{display:grid;place-items:center;width:16px;height:16px;border:1px solid #d9d2df;border-radius:50%;color:#9992a0;font-size:9px;font-weight:850}.password-requirements li.met{color:#4d672c}.password-requirements li.met span{border-color:#d9fa72;background:#d9fa72;color:#39491c}.submit{width:100%;border:0;border-radius:999px;background:#7045d4;color:white;font-size:13px;font-weight:800;padding:14px 18px;margin:7px 0 7px;cursor:pointer}.submit:hover{background:#5834b4}.submit:disabled{opacity:.6;cursor:wait}.footnote{font-size:12px;color:#77727e;margin:17px 0 0}.footnote a{color:#7045d4;font-weight:750;text-decoration:none}.notice{margin-top:18px;padding:13px 15px;border-radius:11px;background:#edf7d7;color:#39491c;font-size:12px}.notice.error{background:#fce5e0;color:#8f3527}
    @media(max-width:780px){:host{margin:20px auto 50px}.auth-layout{grid-template-columns:1fr}.auth-art{min-height:260px;padding:24px}.auth-art h1{font-size:50px}.auth-art img{height:145px;width:35%;bottom:20px;right:24px}.auth-art p{max-width:60%;font-size:12px}.auth-panel{padding:30px 25px}.back-link{margin-bottom:28px}}
    @media(max-width:480px){.two-col{grid-template-columns:1fr;gap:0}.auth-art img{opacity:.24}.auth-art p{max-width:72%}}
  `]
})
export class AuthPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(Api);
  private readonly auth = inject(AuthService);
  readonly mode = this.route.snapshot.data['mode'] as AuthMode;
  busy = false;
  message = '';
  isError = false;
  form: AuthForm = { user: '', password: '', password_confirmation: '', nombre: '', apellidos: '', usuario: '', correo: '', id_tipo: 5, token: '' };

  constructor() {
    this.form['correo'] = this.route.snapshot.queryParamMap.get('email') ?? '';
    this.form['token'] = this.route.snapshot.queryParamMap.get('token') ?? '';
  }

  passwordHasMinLength(): boolean { return this.form.password.length >= 8; }
  passwordHasLowercase(): boolean { return /[a-z]/.test(this.form.password); }
  passwordHasUppercase(): boolean { return /[A-Z]/.test(this.form.password); }
  passwordHasNumber(): boolean { return /\d/.test(this.form.password); }
  passwordsMatch(): boolean { return this.form.password.length > 0 && this.form.password === this.form.password_confirmation; }
  registrationPasswordValid(): boolean {
    return this.passwordHasMinLength() && this.passwordHasLowercase() && this.passwordHasUppercase() && this.passwordHasNumber() && this.passwordsMatch();
  }

  submit(): void {
    this.busy = true; this.message = '';
    const request: Observable<any> = this.mode === 'login'
      ? this.auth.login({ user: String(this.form['user']), password: String(this.form['password']) })
      : this.mode === 'register'
        ? this.auth.register(this.form)
        : this.mode === 'recover'
          ? this.api.post<{ message: string }>('/auth/forgot-password', { correo: this.form['correo'] })
          : this.api.post<{ message: string }>('/auth/reset-password', { correo: this.form['correo'], token: this.form['token'], password: this.form['password'], password_confirmation: this.form['password_confirmation'] });
    request.subscribe({
      next: (result: any) => {
        this.busy = false;
        if (this.mode === 'recover') { this.message = result.message ?? 'Si el correo existe, recibirás instrucciones.'; return; }
        if (this.mode === 'reset') { this.message = result.message ?? 'Contraseña actualizada.';setTimeout(()=>void this.router.navigateByUrl('/login'),1500);return; }
        this.auth.acceptSession(result);
        const requested = this.route.snapshot.queryParamMap.get('redirect');
        const destination = requested?.startsWith('/') && !requested.startsWith('//') ? requested : '/admin';
        void this.router.navigateByUrl(this.auth.isAdmin() ? destination : '/descubrir');
      },
      error: (error: any) => {
        this.busy = false; this.isError = true;
        const validation = error.error?.errors ? Object.values(error.error.errors).flat()[0] : null;
        this.message = String(validation ?? error.error?.message ?? 'No se pudo conectar con ArtistApp. Revisa que la API esté en marcha.');
      }
    });
  }
}
