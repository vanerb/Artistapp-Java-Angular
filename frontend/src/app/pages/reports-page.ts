import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../core/api';
import { ConfirmModal } from '../shared/confirm-modal';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModal],
  templateUrl: './reports-page.html',
  styleUrl: './reports-page.css',
})
export class ReportsPage {
  private readonly api = inject(Api);
  readonly reports = signal<any[]>([]);
  readonly users = signal<any[]>([]);
  readonly formOpen = signal(false);
  readonly busy = signal(false);
  readonly message = signal('');
  readonly confirmation = signal<{ message: string } | null>(null);
  private pendingAction: (() => void) | null = null;
  draft = { id_usuarioreferenciado: 0, informe: '' };
  constructor() {
    this.load();
    this.api
      .get<{ data: any[] }>('/users')
      .subscribe({
        next: (r) => this.users.set((r.data ?? []).filter((user) => Number(user.id_tipo) !== 1)),
      });
  }
  load() {
    this.api
      .get<{ data: any[] }>('/reports')
      .subscribe({
        next: (r) => this.reports.set(r.data ?? []),
        error: (e) => this.message.set(e.error?.message ?? 'No se pudieron cargar los informes.'),
      });
  }
  submit() {
    this.busy.set(true);
    this.api.post('/reports', this.draft).subscribe({
      next: () => {
        this.busy.set(false);
        this.formOpen.set(false);
        this.draft = { id_usuarioreferenciado: 0, informe: '' };
        this.message.set('Informe enviado al equipo.');
        this.load();
      },
      error: (e) => {
        this.busy.set(false);
        this.message.set(e.error?.message ?? 'No se pudo enviar el informe.');
      },
    });
  }
  remove(report: any) {
    this.pendingAction = () =>
      this.api.delete(`/reports/${report.id}`).subscribe({
        next: () => {
          this.reports.update((items) => items.filter((item) => item.id !== report.id));
          this.message.set('Informe cancelado.');
        },
        error: (e) => this.message.set(e.error?.message ?? 'No se pudo cancelar el informe.'),
      });
    this.confirmation.set({ message: '¿Quieres cancelar este informe?' });
  }
  dismissConfirmation() {
    this.confirmation.set(null);
    this.pendingAction = null;
  }
  confirmCancellation() {
    const action = this.pendingAction;
    this.dismissConfirmation();
    action?.();
  }
}
