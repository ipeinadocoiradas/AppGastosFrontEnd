import { HttpParams } from '@angular/common/http';

/** Convierte un objeto de filtros en HttpParams ignorando valores vacíos. */
export function toHttpParams(source: object): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(source)) {
    if (value === undefined || value === null || value === '') continue;
    params = params.set(key, String(value));
  }
  return params;
}
