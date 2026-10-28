import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  template: `
    <div class="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
      <div class="flex items-center gap-2">
        <span>{{ total() }} registros</span>
        <select class="input !w-auto !py-1" aria-label="Registros por página"
                (change)="pageSizeChange.emit(+$any($event.target).value)">
          @for (size of sizes; track size) {
            <option [value]="size" [selected]="size === pageSize()">{{ size }} / pág.</option>
          }
        </select>
      </div>
      <div class="flex items-center gap-2">
        <button type="button" class="btn-secondary" [disabled]="page() <= 1"
                (click)="pageChange.emit(page() - 1)">Anterior</button>
        <span>Página {{ page() }} de {{ totalPages() || 1 }}</span>
        <button type="button" class="btn-secondary" [disabled]="page() >= totalPages()"
                (click)="pageChange.emit(page() + 1)">Siguiente</button>
      </div>
    </div>
  `,
})
export class PaginationComponent {
  readonly page = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly total = input.required<number>();
  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();
  protected readonly sizes = [10, 25, 50];
}
