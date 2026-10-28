import { Injectable } from '@angular/core';
import { UsuarioListadoDto, GuardarUsuarioCommand } from '../../models/api.models';
import { CrudApiService } from './crud-api.service';

@Injectable({ providedIn: 'root' })
export class UsuariosService extends CrudApiService<UsuarioListadoDto, GuardarUsuarioCommand> {
  protected readonly resource = 'usuarios';
}
