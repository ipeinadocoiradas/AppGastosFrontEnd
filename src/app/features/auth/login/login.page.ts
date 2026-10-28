import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule, FormFieldComponent],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-4">
      <div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div class="mb-8 text-center">
          <div class="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-indigo-600 text-2xl font-bold text-white">GG</div>
          <h1 class="text-2xl font-semibold text-slate-900">Gestión de Gastos</h1>
          <p class="mt-1 text-sm text-slate-500">Inicia sesión para continuar</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5" novalidate>
          <app-form-field label="Email" [control]="form.controls.email">
            <input type="email" class="input" formControlName="email" autocomplete="username" placeholder="usuario@empresa.com" />
          </app-form-field>

          <app-form-field label="Contraseña" [control]="form.controls.password">
            <div class="relative">
              <input [type]="showPassword() ? 'text' : 'password'" class="input pr-20"
                     formControlName="password" autocomplete="current-password" />
              <button type="button" class="absolute inset-y-0 right-3 text-xs font-medium text-indigo-600"
                      (click)="showPassword.set(!showPassword())">
                {{ showPassword() ? 'Ocultar' : 'Mostrar' }}
              </button>
            </div>
          </app-form-field>

          <button type="submit" class="btn-primary  mt-3 w-full" [disabled]="loading()">
            {{ loading() ? 'Accediendo…' : 'Iniciar sesión' }}
          </button>
        </form>
      </div>
    </div>
  `,
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toastr = inject(ToastrService);

  protected readonly loading = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.auth
      .login(this.form.getRawValue())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(() => {
        this.toastr.success(`Bienvenido/a, ${this.auth.user()?.nombre ?? ''}`);
        void this.router.navigateByUrl(this.returnUrl());
      });
  }

  /** Solo se aceptan rutas internas para evitar redirecciones abiertas. */
  private returnUrl(): string {
    const url = this.route.snapshot.queryParamMap.get('returnUrl');
    return url?.startsWith('/') && !url.startsWith('//') ? url : '/';
  }
}
