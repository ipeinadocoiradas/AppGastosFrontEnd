import { HttpErrorResponse } from '@angular/common/http';
import { ProblemDetails } from '../models/api.models';

const TITLES: Record<number, string> = {
  0: 'Sin conexión',
  400: 'Datos no válidos',
  401: 'No autorizado',
  403: 'Acceso denegado',
  404: 'No encontrado',
  409: 'Conflicto',
};

const isProblemDetails = (body: unknown): body is ProblemDetails =>
  typeof body === 'object' && body !== null;

export const errorTitle = (status: number): string =>
  TITLES[status] ?? (status >= 500 ? 'Error del servidor' : 'Error');

/** Extrae un mensaje legible de un `ProblemDetails` / `ValidationProblemDetails` de .NET. */
export function errorMessage(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'No se pudo conectar con el servidor. Comprueba tu conexión e inténtalo de nuevo.';
  }
  if (error.status >= 500) {
    return 'Se ha producido un error inesperado. Inténtalo de nuevo más tarde.';
  }

  const problem = isProblemDetails(error.error) ? error.error : null;
  const validationErrors = problem?.errors ? Object.values(problem.errors).flat() : [];
  if (validationErrors.length > 0) return validationErrors.join('\n');

  return (
    problem?.detail ||
    problem?.title ||
    (typeof error.error === 'string' && error.error) ||
    'No se pudo completar la operación.'
  );
}
