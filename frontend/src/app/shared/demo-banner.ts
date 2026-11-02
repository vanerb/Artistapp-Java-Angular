import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { resetDemoData } from '../demo/demo-backend.interceptor';

/** Aviso fijo de la demo estática con las cuentas de prueba y un botón para restablecer los datos. */
@Component({
  selector: 'app-demo-banner',
  template: `
    <aside class="demo-banner" [class.closed]="closed()">
      @if (closed()) {
        <button type="button" class="pill" (click)="closed.set(false)">Demo · cuentas de prueba</button>
      } @else {
        <strong>Demo sin servidor</strong>
        <span>Los datos viven en tu navegador. Entra con <code>artista-uno</code>, <code>organizador-demo</code>, <code>visitante-uno</code> o <code>admin-demo</code> y la contraseña <code>Usuario123</code>.</span>
        <button type="button" (click)="reset()">Restablecer datos</button>
        <button type="button" class="close" aria-label="Ocultar aviso de demo" (click)="closed.set(true)">×</button>
      }
    </aside>
  `,
  styles: `
    .demo-banner{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:60;display:flex;align-items:center;gap:12px;width:min(920px,calc(100% - 32px));padding:10px 12px 10px 16px;border:1px solid #272432;border-radius:16px;background:#d9fa72;color:#272432;font-size:12px;line-height:1.45;box-shadow:0 12px 32px #27243233}
    .demo-banner.closed{width:auto;padding:0;border:0;background:none;box-shadow:none}
    strong{white-space:nowrap;font-weight:800}
    span{flex:1}
    code{padding:1px 5px;border-radius:6px;background:#ffffffaa;font-size:11px}
    button{border:1px solid #272432;border-radius:99px;background:#fffdf9;color:#272432;padding:6px 11px;font-size:11px;font-weight:700;white-space:nowrap;cursor:pointer}
    .close{border:0;background:none;font-size:18px;line-height:1;padding:2px 6px}
    .pill{background:#d9fa72;box-shadow:0 8px 20px #27243233}
    @media(max-width:640px){.demo-banner:not(.closed){flex-wrap:wrap;gap:8px}span{flex-basis:100%;order:2}.close{margin-left:auto}}
  `
})
export class DemoBanner {
  private readonly auth = inject(AuthService);
  readonly closed = signal(false);

  reset(): void {
    resetDemoData();
    this.auth.clearSession(false);
    location.reload();
  }
}
