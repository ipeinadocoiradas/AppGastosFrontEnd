import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PageQuery, PagedResult } from '../../models/api.models';
import { toHttpParams } from '../../utils/http-params.util';

/** Base para recursos REST paginados: GET (lista), POST (alta) y PUT (modificación). */
export abstract class CrudApiService<TDto, TCommand> {
  protected readonly http = inject(HttpClient);
  protected abstract readonly resource: string;

  protected get url(): string {
    return `${environment.apiUrl}/api/${this.resource}`;
  }

  list(query: PageQuery = {}): Observable<PagedResult<TDto>> {
    return this.http.get<PagedResult<TDto>>(this.url, { params: toHttpParams(query) });
  }

  create(command: TCommand): Observable<unknown> {
    return this.http.post(this.url, command);
  }

  update(id: string, command: Partial<TCommand>): Observable<unknown> {
    return this.http.put(`${this.url}/${id}`, command);
  }

   delete(id: string): Observable<unknown> {
    return this.http.delete(`${this.url}/${id}`);
  }
  
}
