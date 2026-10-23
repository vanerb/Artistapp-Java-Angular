import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ChatPanel } from '../shared/chat-panel';
import { AuthService } from '../core/auth.service';

@Component({standalone:true,imports:[ChatPanel,RouterLink],template:`<main class="chat-page"><a routerLink="/mensajes">← Todas las conversaciones</a><app-chat-panel [mode]="mode()" [targetId]="targetId()" [currentUserId]="auth.user()?.id||0" [title]="title()" /></main>`,styles:[`:host{display:block}.chat-page{max-width:820px;margin:auto;padding:32px 22px 75px}.chat-page>a{display:inline-block;margin-bottom:15px;color:#7045d4;text-decoration:none;font-size:11px;font-weight:750}`]})
export class ChatPage {private readonly route=inject(ActivatedRoute);readonly auth=inject(AuthService);readonly targetId=signal(0);readonly mode=signal<'direct'|'event'>('direct');readonly title=signal('');constructor(){this.route.paramMap.subscribe(p=>this.targetId.set(Number(p.get('id'))||0));this.route.data.subscribe(d=>{const event=d['mode']==='event';this.mode.set(event?'event':'direct');this.title.set(event?'Chat del evento':'Chat con artista');});}}
