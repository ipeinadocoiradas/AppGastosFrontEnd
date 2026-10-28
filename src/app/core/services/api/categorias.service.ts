import { Injectable } from '@angular/core';
import { CategoriaDto, RegistrarCatalogoCommand } from '../../models/api.models';
import { CrudApiService } from './crud-api.service';

@Injectable({ providedIn: 'root' })
export class CategoriasService extends CrudApiService<CategoriaDto, RegistrarCatalogoCommand> {
  protected readonly resource = 'categorias';
}
