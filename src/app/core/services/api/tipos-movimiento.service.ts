import { Injectable } from '@angular/core';
import { TipoMovimientoDto } from '../../models/api.models';
import { CrudApiService } from './crud-api.service';


@Injectable({ providedIn: 'root' })
export class TiposMovimientoService extends CrudApiService<TipoMovimientoDto, unknown> {
  protected readonly resource = 'tipos-movimiento';
}
