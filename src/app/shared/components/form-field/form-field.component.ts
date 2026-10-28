import { Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

/** Etiqueta + control proyectado + mensaje de validación. */
@Component({
  selector: 'app-form-field',
  standalone: true,
  template: `
    <div>
      <label class="mb-1 block text-sm font-medium text-slate-700">{{ label() }}</label>
      <ng-content />
      @if (errorMessage(); as message) {
        <p class="mt-1 text-xs text-red-600">{{ message }}</p>
      }
    </div>
  `,
})
export class FormFieldComponent {
  readonly label = input.required<string>();
  readonly control = input.required<AbstractControl>();

  protected errorMessage(): string | null {
    const control = this.control();
    const errors = control.errors;
    if (!control.touched || !errors) return null;
    if (errors['required']) return 'Este campo es obligatorio.';
    if (errors['email']) return 'Introduce un email válido.';
    if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres.`;
    if (errors['maxlength']) return `Máximo ${errors['maxlength'].requiredLength} caracteres.`;
    if (errors['min']) return `El valor mínimo es ${errors['min'].min}.`;
    return 'Valor no válido.';
  }
}
