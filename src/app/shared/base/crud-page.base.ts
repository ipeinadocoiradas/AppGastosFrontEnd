import { Directive, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Observable, finalize } from 'rxjs';
import { PageQuery, PagedResult } from '../../core/models/api.models';
import { CrudApiService } from '../../core/services/api/crud-api.service';
import { ListadoBase } from './listado.base';

/** Listado paginado + modal de alta/modificación. Las páginas solo aportan servicio, formulario y plantilla. */
@Directive()
export abstract class CrudPageBase<TDto extends { id: string; nombre?: string  }, TCommand> extends ListadoBase<TDto> {
  protected abstract readonly service: CrudApiService<TDto, TCommand>;
  protected abstract readonly form: FormGroup;
  protected abstract readonly nombreEntidad: string;

  protected readonly toastr = inject(ToastrService);

  readonly modalOpen = signal(false);
  readonly saving = signal(false);
  readonly editing = signal<TDto | null>(null);
  readonly modalTitle = computed(
    () => `${this.editing() ? 'Editar' : 'Nuevo/a'} ${this.nombreEntidad}`,
  );

  readonly itemToDelete = signal<TDto | null>(null);
  readonly deleting = signal(false);
  readonly deleteMessage = computed(
    () =>
      `¿Seguro que quieres eliminar «${this.itemToDelete()?.nombre ?? 'este registro'}»? Esta acción no se puede deshacer.`,
  );

  protected override fetch(query: PageQuery): Observable<PagedResult<TDto>> {
    return this.service.list(query);
  }

  /** Hook para adaptar el formulario (habilitar/deshabilitar campos) al abrirlo. */
  protected onFormOpened(_item: TDto | null): void {}

  /** Cadenas vacías → null. Los controles deshabilitados quedan fuera (`form.value`). */
  protected buildPayload(): Partial<TCommand> {
    const entries = Object.entries(this.form.value as Record<string, unknown>).map(
      ([key, value]) => [key, value === '' ? null : value],
    );
    return Object.fromEntries(entries) as Partial<TCommand>;
  }

  openCreate(): void {
    this.editing.set(null);
    this.form.reset();
    this.onFormOpened(null);
    this.modalOpen.set(true);
  }

  openEdit(item: TDto): void {
    this.editing.set(item);
    this.form.reset();
    this.onFormOpened(item);
    this.form.patchValue(item as Record<string, unknown>);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  askDelete(item: TDto): void {
    this.itemToDelete.set(item);
  }

  cancelDelete(): void {
    this.itemToDelete.set(null);
  }

    confirmDelete(): void {
    const item = this.itemToDelete();
    if (!item) return;

    this.deleting.set(true);
    this.service
      .delete(item.id)
      .pipe(
        finalize(() => this.deleting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.toastr.success('Registro eliminado correctamente.', 'Operación completada');
          this.itemToDelete.set(null);
          // Si era el último de la página, retrocede una.
          if (this.items().length === 1 && this.page() > 1) this.page.update((p) => p - 1);
          this.load();
        },
        error: () => this.itemToDelete.set(null), // el interceptor ya muestra el motivo (p. ej. 409)
      });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const current = this.editing();
    const payload = this.buildPayload();
    const request$ = current
      ? this.service.update(current.id, payload)
      : this.service.create(payload as TCommand);

    this.saving.set(true);
    request$
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.toastr.success('Registro guardado correctamente.', 'Operación completada');
        this.closeModal();
        this.load();
      });
  }
}
