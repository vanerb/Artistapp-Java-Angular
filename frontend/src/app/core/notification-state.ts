import { Injectable, inject, signal } from '@angular/core';
import { Api } from './api';

@Injectable({providedIn:'root'})
export class NotificationState {
  private readonly api=inject(Api);
  readonly unread=signal(0);
  constructor(){setInterval(()=>{if(typeof localStorage!=='undefined'&&localStorage.getItem('artistapp_token'))this.refresh();},30000);}
  refresh(){this.api.get<{unread:number}>('/notifications').subscribe({next:r=>this.unread.set(Number(r.unread)||0),error:()=>this.unread.set(0)});}
}
