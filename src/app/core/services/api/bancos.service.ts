import { Injectable } from '@angular/core';
import { BancoDto, RegistrarBancoCommand } from '../../models/api.models';
import { CrudApiService } from './crud-api.service';

@Injectable({ providedIn: 'root' })
export class BancosService extends CrudApiService<BancoDto, RegistrarBancoCommand> {
  protected readonly resource = 'bancos';
}
