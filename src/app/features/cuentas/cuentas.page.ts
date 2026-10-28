import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CuentaDto, RegistrarCuentaCommand } from '../../core/models/api.models';
import { BancosService } from '../../core/services/api/bancos.service';
import { CuentasService } from '../../core/services/api/cuentas.service';
import { TiposCuentaService } from '../../core/services/api/tipos-cuenta.service';
import { catalogSignal } from '../../core/utils/catalog.util';
import { CrudPageBase } from '../../shared/base/crud-page.base';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-cuentas-page',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe, ModalComponent, FormFieldComponent, PaginationComponent],
  template: `
    <section class="space-y-6">
      <header class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-semibold text-slate-900">Cuentas</h1>
          <p class="text-sm text-slate-500">Tus cuentas bancarias y su saldo actual.</p>
        </div>
        <button type="button" class="btn-primary" (click)="openCreate()">+ Nueva cuenta</button>
      </header>

      <form class="flex gap-2" (submit)="$event.preventDefault(); search(q.value)">
        <input #q type="search" class="input max-w-sm" placeholder="Buscar por número de cuenta…" [value]="buscar()" />
        <button type="submit" class="btn-secondary">Buscar</button>
      </form>

      <div class="card overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200 text-sm">
          <thead class="bg-slate-50">
            <tr>
              <th class="th">Nº cuenta</th><th class="th">Banco</th><th class="th">Tipo</th>
              <th class="th text-right">Saldo</th><th class="th text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (c of items(); track c.id) {
              <tr class="hover:bg-slate-50">
                <td class="td font-medium text-slate-900">{{ c.numeroCuenta }}</td>
                <td class="td">{{ c.banco }}</td>
                <td class="td">{{ c.tipoCuenta }}</td>
                <td class="td text-right font-medium tabular-nums">{{ c.saldoActual | currency: 'EUR' }}</td>
                <td class="td text-right"><button type="button" class="btn-link" (click)="openEdit(c)">Editar</button></td>
              </tr>
            } @empty {
              <tr><td colspan="5" class="td py-8 text-center text-slate-500">{{ loading() ? 'Cargando…' : 'Sin resultados' }}</td></tr>
            }
          </tbody>
        </table>
      </div>

      <app-pagination [page]="page()" [pageSize]="pageSize()" [totalPages]="totalPages()" [total]="total()"
                      (pageChange)="goToPage($event)" (pageSizeChange)="changePageSize($event)" />
    </section>

    <app-modal [open]="modalOpen()" [title]="modalTitle()" (closed)="closeModal()">
      <form [formGroup]="form" (ngSubmit)="save()" class="space-y-4" novalidate>
        <app-form-field label="Número de cuenta" [control]="form.controls.numeroCuenta">
          <input class="input" formControlName="numeroCuenta" />
        </app-form-field>
        <app-form-field label="Banco" [control]="form.controls.bancoId">
          <select class="input" formControlName="bancoId">
            <option value="" disabled>Selecciona un banco…</option>
            @for (b of bancos(); track b.id) { <option [value]="b.id">{{ b.nombre }}</option> }
          </select>
        </app-form-field>
        <app-form-field label="Tipo de cuenta" [control]="form.controls.tipoCuentaId">
          <select class="input" formControlName="tipoCuentaId">
            <option value="" disabled>Selecciona un tipo…</option>
            @for (t of tiposCuenta(); track t.id) { <option [value]="t.id">{{ t.nombre }}</option> }
          </select>
        </app-form-field>
        @if (!editing()) {
          <app-form-field label="Saldo inicial" [control]="form.controls.saldoActual">
            <input type="number" step="0.01" class="input" formControlName="saldoActual" />
          </app-form-field>
        }
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" class="btn-secondary" (click)="closeModal()">Cancelar</button>
          <button type="submit" class="btn-primary" [disabled]="saving()">{{ saving() ? 'Guardando…' : 'Guardar' }}</button>
        </div>
      </form>
    </app-modal>
  `,
})
export class CuentasPage extends CrudPageBase<CuentaDto, RegistrarCuentaCommand> {
  protected readonly service = inject(CuentasService);
  protected readonly nombreEntidad = 'cuenta';
  protected readonly bancos = catalogSignal(inject(BancosService));
  protected readonly tiposCuenta = catalogSignal(inject(TiposCuentaService));
  protected readonly form = inject(NonNullableFormBuilder).group({
    numeroCuenta: ['', [Validators.required, Validators.maxLength(34)]],
    bancoId: ['', [Validators.required]],
    tipoCuentaId: ['', [Validators.required]],
    saldoActual: [0, [Validators.required]],
  });

  /** El saldo inicial solo se informa en el alta. */
  protected override onFormOpened(item: CuentaDto | null): void {
    const { saldoActual } = this.form.controls;
    if (item) saldoActual.disable();
    else saldoActual.enable();
  }
}
