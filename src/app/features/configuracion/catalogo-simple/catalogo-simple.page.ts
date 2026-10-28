import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CatalogoDto, RegistrarCatalogoCommand } from '../../../core/models/api.models';
import { CategoriasService } from '../../../core/services/api/categorias.service';
import { CrudApiService } from '../../../core/services/api/crud-api.service';
import { TiposCuentaService } from '../../../core/services/api/tipos-cuenta.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CrudPageBase } from '../../../shared/base/crud-page.base';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

interface CatalogoRouteData {
  titulo: string;
  entidad: string;
  catalogo: 'categorias' | 'tipos-cuenta';
}

/** Página única para los catálogos nombre + descripción (Categorías y Tipos de cuenta). */
@Component({
  selector: 'app-catalogo-simple-page',
  standalone: true,
  imports: [ReactiveFormsModule, ModalComponent, FormFieldComponent, PaginationComponent, ConfirmDialogComponent],
  template: `
    <section class="space-y-6">
      <header class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-semibold text-slate-900">{{ titulo }}</h1>
          <p class="text-sm text-slate-500">Mantenimiento de {{ titulo.toLowerCase() }}.</p>
        </div>
        <button type="button" class="btn-primary" (click)="openCreate()">+ Nuevo/a {{ nombreEntidad }}</button>
      </header>

      <form class="flex gap-2" (submit)="$event.preventDefault(); search(q.value)">
        <input #q type="search" class="input max-w-sm" placeholder="Buscar…" [value]="buscar()" />
        <button type="submit" class="btn-secondary">Buscar</button>
      </form>

      <div class="card overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200 text-sm">
          <thead class="bg-slate-50">
            <tr><th class="th">Nombre</th><th class="th">Descripción</th><th class="th text-right">Acciones</th></tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (c of items(); track c.id) {
              <tr class="hover:bg-slate-50">
                <td class="td font-medium text-slate-900">{{ c.nombre }}</td>
                <td class="td">{{ c.descripcion ?? '—' }}</td>
                <td class="td whitespace-nowrap text-right">
                  <button type="button" class="btn-link" (click)="openEdit(c)">Editar</button>
                  <button type="button" class="btn-danger-link" (click)="askDelete(c)">Eliminar</button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="3" class="td py-8 text-center text-slate-500">{{ loading() ? 'Cargando…' : 'Sin resultados' }}</td></tr>
            }
          </tbody>
        </table>
      </div>

      <app-pagination [page]="page()" [pageSize]="pageSize()" [totalPages]="totalPages()" [total]="total()"
                      (pageChange)="goToPage($event)" (pageSizeChange)="changePageSize($event)" />
    </section>

    <app-modal [open]="modalOpen()" [title]="modalTitle()" (closed)="closeModal()">
      <form [formGroup]="form" (ngSubmit)="save()" class="space-y-4" novalidate>
        <app-form-field label="Nombre" [control]="form.controls.nombre">
          <input class="input" formControlName="nombre" />
        </app-form-field>
        <app-form-field label="Descripción" [control]="form.controls.descripcion">
          <textarea rows="3" class="input" formControlName="descripcion"></textarea>
        </app-form-field>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" class="btn-secondary" (click)="closeModal()">Cancelar</button>
          <button type="submit" class="btn-primary" [disabled]="saving()">{{ saving() ? 'Guardando…' : 'Guardar' }}</button>
        </div>
      </form>
    </app-modal>

    <app-confirm-dialog [open]="itemToDelete() !== null" title="Confirmar eliminación"
                        [message]="deleteMessage()" [loading]="deleting()"
                        (confirmed)="confirmDelete()" (cancelled)="cancelDelete()" />
  `,
})
export class CatalogoSimplePage extends CrudPageBase<CatalogoDto, RegistrarCatalogoCommand> {
  private readonly datos = inject(ActivatedRoute).snapshot.data as CatalogoRouteData;

  protected readonly titulo = this.datos.titulo;
  protected readonly nombreEntidad = this.datos.entidad;
  protected readonly service: CrudApiService<CatalogoDto, RegistrarCatalogoCommand> =
    this.datos.catalogo === 'categorias' ? inject(CategoriasService) : inject(TiposCuentaService);
  protected readonly form = inject(NonNullableFormBuilder).group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    descripcion: ['', [Validators.maxLength(250)]],
  });
}
