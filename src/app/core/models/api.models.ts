/* ===== Genéricos ===== */
export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PageQuery {
  page?: number;
  pageSize?: number;
  buscar?: string;
}

export interface ProblemDetails {
  type?: string | null;
  title?: string | null;
  status?: number | null;
  detail?: string | null;
  instance?: string | null;
  errors?: Record<string, string[]>;
}

/* ===== Auth ===== */
export interface LoginCommand {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresAt: string;
}

export interface AuthUser {
  nombre: string;
  email: string;
  roles: string[];
  /** Expiración del JWT en segundos (claim `exp`). */
  exp: number | null;
}

/* ===== Catálogos ===== */
export interface BancoDto {
  id: string;
  nombre: string;
  codigoInstitucional: string;
}
export interface RegistrarBancoCommand {
  nombre: string;
  codigoInstitucional: string;
}

/** Categorías y Tipos de cuenta comparten contrato (nombre + descripción). */
export interface CatalogoDto {
  id: string;
  nombre: string;
  descripcion: string | null;
}
export interface RegistrarCatalogoCommand {
  nombre: string;
  descripcion: string | null;
}
export type CategoriaDto = CatalogoDto;
export type TipoCuentaDto = CatalogoDto;

/* ===== Usuarios ===== */
export interface UsuarioDto {
  id: string;
  nombre: string;
  email: string;
}
export interface UsuarioListadoDto extends UsuarioDto {
  roles: string[];
}
export interface RegistrarUsuarioCommand {
  nombre: string;
  email: string;
  password: string;
}

/* ===== Movimientos ===== */
/** 1 = Ingreso, 2 = Egreso. */
export const NaturalezaMovimiento = { Ingreso: 1, Egreso: 2 } as const;

export interface MovimientoItemDto {
  id: string;
  cuentaId: string;
  numeroCuenta: string;
  categoriaId: string;
  categoria: string;
  tipoMovimientoId: string;
  tipoMovimiento: string;
  naturaleza: string;
  monto: number;
  fechaHora: string;
  descripcion: string | null;
}

export interface MovimientoDto {
  id: string;
  cuentaId: string;
  categoriaId: string;
  tipoMovimientoId: string;
  monto: number;
  fechaHora: string;
  descripcion: string | null;
  saldoActualCuenta: number;
}

export interface RegistrarMovimientoCommand {
  cuentaId: string;
  categoriaId: string;
  tipoMovimientoId: string;
  monto: number;
  descripcion: string | null;
  fechaHora?: string | null;
}

export interface MovimientosQuery extends PageQuery {
  cuentaId?: string;
  categoriaId?: string;
  tipoMovimientoId?: string;
  desde?: string;
  hasta?: string;
}

export interface CuentaDto {
  id: string;
  numeroCuenta: string;
  bancoId: string;
  banco: string;
  tipoCuentaId: string;
  tipoCuenta: string;
  saldoActual: number;
}
export interface RegistrarCuentaCommand {
  numeroCuenta: string;
  bancoId: string;
  tipoCuentaId: string;
  saldoActual: number;
}
export interface TipoMovimientoDto {
  id: string;
  nombre: string;
  descripcion: string;
  naturaleza: string;
}

export interface GuardarUsuarioCommand extends RegistrarUsuarioCommand {
  roles: string[];
}

export const ROLES_DISPONIBLES = ['Administrador', 'Usuario'] as const;

