import { Injectable } from '@angular/core';
import { TipoCuentaDto, RegistrarCatalogoCommand } from '../../models/api.models';
import { CrudApiService } from './crud-api.service';

@Injectable({ providedIn: 'root' })
export class TiposCuentaService extends CrudApiService<TipoCuentaDto, RegistrarCatalogoCommand> {
  protected readonly resource = 'tipos-cuenta';
}
