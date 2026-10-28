import { Injectable } from '@angular/core';
import { CuentaDto, RegistrarCuentaCommand } from '../../models/api.models';
import { CrudApiService } from './crud-api.service';

/** ⚠ /api/cuentas no existe en el OpenAPI adjunto: contrato asumido. */
@Injectable({ providedIn: 'root' })
export class CuentasService extends CrudApiService<CuentaDto, RegistrarCuentaCommand> {
  protected readonly resource = 'cuentas';
}
