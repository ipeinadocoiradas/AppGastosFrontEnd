import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  MovimientoDto,
  MovimientoItemDto,
  MovimientosQuery,
  PagedResult,
  RegistrarMovimientoCommand,
} from '../../models/api.models';
import { toHttpParams } from '../../utils/http-params.util';

@Injectable({ providedIn: 'root' })
export class MovimientosService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/api/movimientos`;

  list(query: MovimientosQuery): Observable<PagedResult<MovimientoItemDto>> {
    return this.http.get<PagedResult<MovimientoItemDto>>(this.url, {
      params: toHttpParams(query),
    });
  }

  registrar(command: RegistrarMovimientoCommand): Observable<MovimientoDto> {
    return this.http.post<MovimientoDto>(this.url, command);
  }
}
