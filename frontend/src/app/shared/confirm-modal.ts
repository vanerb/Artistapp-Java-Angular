import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `@if(open){<div class="confirm-backdrop" (click)="cancel.emit()"><section class="confirm-dialog" role="alertdialog" aria-modal="true" [attr.aria-label]="title" (click)="$event.stopPropagation()"><span class="eyebrow">CONFIRMACIÓN</span><button type="button" class="close" aria-label="Cerrar" (click)="cancel.emit()">×</button><h2>{{title}}</h2><p>{{message}}</p><footer><button type="button" class="secondary" (click)="cancel.emit()">Cancelar</button><button type="button" class="primary" [class.danger]="tone==='danger'" (click)="confirm.emit()">{{confirmLabel}}</button></footer></section></div>}`,
  styles: [`:host{display:contents}.confirm-backdrop{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;padding:20px;background:#211c2cb8;backdrop-filter:blur(6px);animation:fade-in .14s ease-out}.confirm-dialog{position:relative;width:min(440px,100%);padding:28px;border:1px solid #ffffffa8;border-radius:22px;background:#fffdf9;color:#272432;box-shadow:0 30px 100px #15121d55;animation:modal-in .18s ease-out}.eyebrow{color:#7045d4;font-size:9px;font-weight:850;letter-spacing:.15em}.close{position:absolute;right:18px;top:17px;width:34px;height:34px;border:1px solid #e9e2da;border-radius:50%;background:white;color:#555160;font-size:22px;cursor:pointer}.confirm-dialog h2{margin:13px 35px 8px 0;font-size:clamp(23px,4vw,29px);letter-spacing:-.05em}.confirm-dialog p{margin:0;color:#77727e;font-size:13px;line-height:1.6}.confirm-dialog footer{display:flex;justify-content:flex-end;gap:9px;margin-top:25px}.confirm-dialog footer button{min-height:42px;padding:0 17px;border:0;border-radius:999px;font-size:11px;font-weight:800;cursor:pointer}.secondary{background:#f0ece6;color:#514c59}.primary{background:#7045d4;color:white}.primary.danger{background:#a94351}@keyframes fade-in{from{opacity:0}to{opacity:1}}@keyframes modal-in{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}`]
})
export class ConfirmModal {
  @Input() open = false;
  @Input() title = '¿Confirmas esta acción?';
  @Input() message = '';
  @Input() confirmLabel = 'Aceptar';
  @Input() tone: 'danger' | 'default' = 'default';
  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();
}
