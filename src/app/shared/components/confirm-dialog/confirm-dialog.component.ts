import { Component, input, output } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';

/** Diálogo de confirmación para acciones destructivas. */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [ModalComponent],
  template: `
    <app-modal [open]="open()" [title]="title()" (closed)="cancelled.emit()">
      <p class="text-sm text-slate-600">{{ message() }}</p>
      <div class="mt-6 flex justify-end gap-2">
        <button type="button" class="btn-secondary" (click)="cancelled.emit()">Cancelar</button>
        <button type="button" class="btn-danger" [disabled]="loading()" (click)="confirmed.emit()">
          {{ loading() ? 'Eliminando…' : 'Eliminar' }}
        </button>
      </div>
    </app-modal>
  `,
})
export class ConfirmDialogComponent {
  readonly open = input(false);
  readonly title = input('Confirmar');
  readonly message = input.required<string>();
  readonly loading = input(false);
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
}
