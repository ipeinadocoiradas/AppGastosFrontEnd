import { DestroyRef, Directive, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { PageQuery, PagedResult } from '../../core/models/api.models';

/** Estado y comportamiento común de cualquier listado paginado con búsqueda (Signals). */
@Directive()
export abstract class ListadoBase<T> implements OnInit {
  protected abstract fetch(query: PageQuery): Observable<PagedResult<T>>;
  protected readonly destroyRef = inject(DestroyRef);

  readonly items = signal<T[]>([]);
  readonly loading = signal(false);
  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly buscar = signal('');
  readonly total = signal(0);
  readonly totalPages = signal(0);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.fetch({
      page: this.page(),
      pageSize: this.pageSize(),
      buscar: this.buscar() || undefined,
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.items.set(result.items);
          this.total.set(result.totalCount);
          this.totalPages.set(result.totalPages);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  search(term: string): void {
    this.buscar.set(term.trim());
    this.page.set(1);
    this.load();
  }

  goToPage(page: number): void {
    this.page.set(page);
    this.load();
  }

  changePageSize(size: number): void {
    this.pageSize.set(size);
    this.page.set(1);
    this.load();
  }
}
