import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Observable, finalize } from 'rxjs';
import {
  MovimientoItemDto,
  NaturalezaMovimiento,
  PageQuery,
  PagedResult,
  RegistrarMovimientoCommand,
} from '../../core/models/api.models';
import { CategoriasService } from '../../core/services/api/categorias.service';
import { CuentasService } from '../../core/services/api/cuentas.service';
import { MovimientosService } from '../../core/services/api/movimientos.service';
import { TiposMovimientoService } from '../../core/services/api/tipos-movimiento.service';
import { catalogSignal } from '../../core/utils/catalog.util';
import { formatEuro } from '../../core/utils/format.util';
import { ListadoBase } from '../../shared/base/listado.base';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-movimientos-page',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe, DatePipe, ModalComponent, FormFieldComponent, PaginationComponent],
  template: `
    <section class="space-y-6">
      <header class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-semibold text-slate-900">Movimientos</h1>
          <p class="text-sm text-slate-500">Del más reciente al más antiguo.</p>
        </div>
        <button type="button" class="btn-primary" (click)="openCreate()">+ Registrar movimiento</button>
      </header>

      <form [formGroup]="filtros" (ngSubmit)="aplicarFiltros()" class="card grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-6">
        <div class="lg:col-span-2">
          <label class="mb-1 block text-xs font-medium text-slate-500">Cuenta</label>
          <select class="input" formControlName="cuentaId">
            <option value="">Todas</option>
            @for (c of cuentas(); track c.id) { <option [value]="c.id">{{ c.banco }} · {{ c.numeroCuenta }}</option> }
          </select>
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-slate-500">Categoría</label>
          <select class="input" formControlName="categoriaId">
            <option value="">Todas</option>
            @for (c of categorias(); track c.id) { <option [value]="c.id">{{ c.nombre }}</option> }
          </select>
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-slate-500">Tipo</label>
          <select class="input" formControlName="tipoMovimientoId">
            <option value="">Todos</option>
            @for (t of tiposMovimiento(); track t.id) { <option [value]="t.id">{{ t.nombre }}</option> }
          </select>
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-slate-500">Desde</label>
          <input type="date" class="input" formControlName="desde" />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-slate-500">Hasta</label>
          <input type="date" class="input" formControlName="hasta" />
        </div>
        <div class="flex gap-2 sm:col-span-2 lg:col-span-6 lg:justify-end">
          <button type="button" class="btn-secondary" (click)="limpiarFiltros()">Limpiar</button>
          <button type="submit" class="btn-primary">Filtrar</button>
        </div>
      </form>

      <div class="card overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200 text-sm">
          <thead class="bg-slate-50">
            <tr>
              <th class="th">Fecha</th><th class="th">Cuenta</th><th class="th">Categoría</th>
              <th class="th">Tipo</th><th class="th">Descripción</th><th class="th text-right">Importe</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (m of items(); track m.id) {
              <tr class="hover:bg-slate-50">
                <td class="td whitespace-nowrap">{{ m.fechaHora | date: 'dd/MM/yyyy HH:mm' }}</td>
                <td class="td">{{ m.numeroCuenta }}</td>
                <td class="td">{{ m.categoria }}</td>
                <td class="td">{{ m.tipoMovimiento }}</td>
                <td class="td">{{ m.descripcion ?? '—' }}</td>
                <td class="td whitespace-nowrap text-right font-medium tabular-nums"
                    [class]="esIngreso(m) ? 'text-emerald-600' : 'text-rose-600'">
                  {{ esIngreso(m) ? '+' : '−' }}{{ importe(m) | currency: 'EUR' }}
                </td>
              </tr>
            } @empty {
              <tr><td colspan="6" class="td py-8 text-center text-slate-500">{{ loading() ? 'Cargando…' : 'Sin movimientos' }}</td></tr>
            }
          </tbody>
        </table>
      </div>

      <app-pagination [page]="page()" [pageSize]="pageSize()" [totalPages]="totalPages()" [total]="total()"
                      (pageChange)="goToPage($event)" (pageSizeChange)="changePageSize($event)" />
    </section>

    <app-modal [open]="modalOpen()" title="Registrar movimiento" (closed)="closeModal()">
      <form [formGroup]="form" (ngSubmit)="registrar()" class="space-y-4" novalidate>
        <app-form-field label="Cuenta" [control]="form.controls.cuentaId">
          <select class="input" formControlName="cuentaId">
            <option value="" disabled>Selecciona una cuenta…</option>
            @for (c of cuentas(); track c.id) { <option [value]="c.id">{{ c.banco }} · {{ c.numeroCuenta }}</option> }
          </select>
        </app-form-field>
        <div class="grid gap-4 sm:grid-cols-2">
          <app-form-field label="Categoría" [control]="form.controls.categoriaId">
            <select class="input" formControlName="categoriaId">
              <option value="" disabled>Selecciona…</option>
              @for (c of categorias(); track c.id) { <option [value]="c.id">{{ c.nombre }}</option> }
            </select>
          </app-form-field>
          <app-form-field label="Tipo de movimiento" [control]="form.controls.tipoMovimientoId">
            <select class="input" formControlName="tipoMovimientoId">
              <option value="" disabled>Selecciona…</option>
              @for (t of tiposMovimiento(); track t.id) { <option [value]="t.id">{{ t.nombre }}</option> }
            </select>
          </app-form-field>
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <app-form-field label="Monto" [control]="form.controls.monto">
            <input type="number" step="0.01" min="0" class="input" formControlName="monto" />
          </app-form-field>
          <app-form-field label="Fecha y hora (opcional)" [control]="form.controls.fechaHora">
            <input type="datetime-local" class="input" formControlName="fechaHora" />
          </app-form-field>
        </div>
        <app-form-field label="Descripción" [control]="form.controls.descripcion">
          <textarea rows="2" class="input" formControlName="descripcion"></textarea>
        </app-form-field>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" class="btn-secondary" (click)="closeModal()">Cancelar</button>
          <button type="submit" class="btn-primary" [disabled]="saving()">{{ saving() ? 'Guardando…' : 'Registrar' }}</button>
        </div>
      </form>
    </app-modal>
  `,
})
export class MovimientosPage extends ListadoBase<MovimientoItemDto> {
  private readonly service = inject(MovimientosService);
  private readonly toastr = inject(ToastrService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly cuentas = catalogSignal(inject(CuentasService));
  protected readonly categorias = catalogSignal(inject(CategoriasService));
  protected readonly tiposMovimiento = catalogSignal(inject(TiposMovimientoService));

  protected readonly modalOpen = signal(false);
  protected readonly saving = signal(false);

  protected readonly filtros = this.fb.group({
    cuentaId: [''],
    categoriaId: [''],
    tipoMovimientoId: [''],
    desde: [''],
    hasta: [''],
  });

  protected readonly form = this.fb.group({
    cuentaId: ['', [Validators.required]],
    categoriaId: ['', [Validators.required]],
    tipoMovimientoId: ['', [Validators.required]],
    monto: [null as number | null, [Validators.required, Validators.min(0.01)]],
    descripcion: ['', [Validators.maxLength(250)]],
    fechaHora: [''],
  });

  protected override fetch(query: PageQuery): Observable<PagedResult<MovimientoItemDto>> {
    const f = this.filtros.getRawValue();
    return this.service.list({
      ...query,
      cuentaId: f.cuentaId || undefined,
      categoriaId: f.categoriaId || undefined,
      tipoMovimientoId: f.tipoMovimientoId || undefined,
      desde: f.desde ? new Date(`${f.desde}T00:00:00`).toISOString() : undefined,
      hasta: f.hasta ? new Date(`${f.hasta}T23:59:59.999`).toISOString() : undefined,
    });
  }

  protected aplicarFiltros(): void {
    this.page.set(1);
    this.load();
  }

  protected limpiarFiltros(): void {
    this.filtros.reset();
    this.aplicarFiltros();
  }

  protected esIngreso(m: MovimientoItemDto): boolean {
    return m.naturaleza?.toLowerCase() === 'ingreso'; 
  }

  protected importe(m: MovimientoItemDto): number {
    return Math.abs(m.monto);
  }

  protected openCreate(): void {
    this.form.reset();
    this.form.patchValue({ cuentaId: this.filtros.getRawValue().cuentaId });
    this.modalOpen.set(true);
  }

  protected closeModal(): void {
    this.modalOpen.set(false);
  }

  protected registrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const command: RegistrarMovimientoCommand = {
      cuentaId: v.cuentaId,
      categoriaId: v.categoriaId,
      tipoMovimientoId: v.tipoMovimientoId,
      monto: v.monto ?? 0,
      descripcion: v.descripcion || null,
      fechaHora: v.fechaHora ? new Date(v.fechaHora).toISOString() : null,
    };

    this.saving.set(true);
    this.service
      .registrar(command)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe((movimiento) => {
        this.toastr.success(
          `Saldo actual de la cuenta: ${formatEuro(movimiento.saldoActualCuenta)}`,
          'Movimiento registrado',
        );
        this.closeModal();
        this.page.set(1);
        this.load();
      });
  }
}
