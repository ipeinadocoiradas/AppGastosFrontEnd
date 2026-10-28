import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { CrudApiService } from '../services/api/crud-api.service';

/** Carga un catálogo completo (para selects). Llamar desde un contexto de inyección. */
export function catalogSignal<T>(service: CrudApiService<T, unknown>) {
  return toSignal(
    service.list({ page: 1, pageSize: 100 }).pipe(
      map((result) => result.items),
      catchError(() => of([] as T[])),
    ),
    { initialValue: [] as T[] },
  );
}
