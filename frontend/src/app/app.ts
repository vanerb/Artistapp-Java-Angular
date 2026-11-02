import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Navbar } from './shared/navbar';
import { DemoBanner } from './shared/demo-banner';
import { AuthService } from './core/auth.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterOutlet, Navbar, DemoBanner],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly auth = inject(AuthService);
  readonly demo = environment.demo;
  constructor() { this.auth.refreshSession(); }
}
