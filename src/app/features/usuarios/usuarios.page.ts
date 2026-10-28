import { Component, computed, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  GuardarUsuarioCommand,
  ROLES_DISPONIBLES,
  UsuarioListadoDto,
} from '../../core/models/api.models';
import { UsuariosService } from '../../core/services/api/usuarios.service';
import { AuthService } from '../../core/services/auth.service';
import { CrudPageBase } from '../../shared/base/crud-page.base';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-usuarios-page',
  standalone: true,
  imports: [ReactiveFormsModule, ModalComponent, FormFieldComponent, PaginationComponent, ConfirmDialogComponent],
  template: `
    <section class="space-y-6">
      <header class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-semibold text-slate-900">Usuarios</h1>
          <p class="text-sm text-slate-500">Gestión de usuarios del sistema.</p>
        </div>
        <button type="button" class="btn-primary" (click)="openCreate()">+ Nuevo usuario</button>
      </header>

      <form class="flex gap-2" (submit)="$event.preventDefault(); search(q.value)">
        <input #q type="search" class="input max-w-sm" placeholder="Buscar por nombre o email…" [value]="buscar()" />
        <button type="submit" class="btn-secondary">Buscar</button>
      </form>

      <div class="card overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200 text-sm">
          <thead class="bg-slate-50">
            <tr>
              <th class="th">Nombre</th><th class="th">Email</th><th class="th">Roles</th>
              <th class="th text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (u of items(); track u.id) {
              <tr class="hover:bg-slate-50">
                <td class="td font-medium text-slate-900">{{ u.nombre }}</td>
                <td class="td">{{ u.email }}</td>
                <td class="td">
                  @for (role of u.roles; track role) {
                    <span class="mr-1 inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">{{ role }}</span>
                  }
                </td>
                <td class="td whitespace-nowrap text-right">
                  <button type="button" class="btn-link" (click)="openEdit(u)">Editar</button>
                  @if (!esPropio(u)) {
                    <button type="button" class="btn-danger-link" (click)="askDelete(u)">Eliminar</button>
                  }
                </td>
              </tr>
            } @empty {
              <tr><td colspan="4" class="td py-8 text-center text-slate-500">{{ loading() ? 'Cargando…' : 'Sin resultados' }}</td></tr>
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
        <app-form-field label="Email" [control]="form.controls.email">
          <input type="email" class="input" formControlName="email" />
        </app-form-field>

        @if (editing()) {
          <fieldset>
            <legend class="mb-1 block text-sm font-medium text-slate-700">Roles</legend>
            <div class="flex flex-wrap gap-4">
              @for (rol of rolesDisponibles(); track rol) {
                <label class="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" class="size-4 rounded border-slate-300 text-indigo-600"
                         [checked]="tieneRol(rol)" (change)="toggleRol(rol)" />
                  {{ rol }}
                </label>
              }
            </div>
            @if (form.controls.roles.touched && form.controls.roles.invalid) {
              <p class="mt-1 text-xs text-red-600">Selecciona al menos un rol.</p>
            }
          </fieldset>
        } @else {
          <app-form-field label="Contraseña" [control]="form.controls.password">
            <input type="password" class="input" formControlName="password" autocomplete="new-password" />
          </app-form-field>
        }

        <div class="flex justify-end gap-2 pt-2">
          <button type="button" class="btn-secondary" (click)="closeModal()">Cancelar</button>
          <button type="submit" class="btn-primary" [disabled]="saving()">{{ saving() ? 'Guardando…' : 'Guardar' }}</button>
        </div>
      </form>
    </app-modal>

    <app-confirm-dialog [open]="itemToDelete() !== null" title="Eliminar usuario"
                        [message]="deleteMessage()" [loading]="deleting()"
                        (confirmed)="confirmDelete()" (cancelled)="cancelDelete()" />
  `,
})
export class UsuariosPage extends CrudPageBase<UsuarioListadoDto, GuardarUsuarioCommand> {
  private readonly auth = inject(AuthService);

  protected readonly service = inject(UsuariosService);
  protected readonly nombreEntidad = 'usuario';
  protected readonly form = inject(NonNullableFormBuilder).group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    roles: [[] as string[], [Validators.required]],
  });

  /** Catálogo de roles + cualquier rol que el usuario editado ya tenga y no esté en el catálogo. */
  protected readonly rolesDisponibles = computed(() => [
    ...new Set<string>([...ROLES_DISPONIBLES, ...(this.editing()?.roles ?? [])]),
  ]);

  /** Contraseña solo en el alta; roles solo en la modificación. */
  protected override onFormOpened(item: UsuarioListadoDto | null): void {
    const { password, roles } = this.form.controls;
    if (item) {
      password.disable();
      roles.enable();
    } else {
      password.enable();
      roles.disable();
    }
  }

  protected tieneRol(rol: string): boolean {
    return this.form.controls.roles.value.includes(rol);
  }

  protected toggleRol(rol: string): void {
    const control = this.form.controls.roles;
    const actuales = control.value;
    control.setValue(actuales.includes(rol) ? actuales.filter((r) => r !== rol) : [...actuales, rol]);
    control.markAsTouched();
  }

  /** Un administrador no puede eliminarse a sí mismo. */
  protected esPropio(usuario: UsuarioListadoDto): boolean {
    return usuario.email === this.auth.user()?.email;
  }
}
