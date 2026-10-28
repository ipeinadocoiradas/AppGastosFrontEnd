import { AuthUser } from '../models/api.models';

const CLAIM_ROLE = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
const CLAIM_NAME = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name';
const CLAIM_EMAIL = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress';

type Claims = Record<string, unknown>;

const asString = (value: unknown): string | null =>
  typeof value === 'string' && value.length > 0 ? value : null;

const asArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.map(String) : value ? [String(value)] : [];

/** Decodifica el payload del JWT (sin verificar la firma: eso es cosa del servidor). */
export function parseJwt(token: string): AuthUser | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    );
    const claims = JSON.parse(json) as Claims;
    const email = asString(claims['email']) ?? asString(claims[CLAIM_EMAIL]) ?? '';

    return {
      nombre:
        asString(claims['name']) ??
        asString(claims['unique_name']) ??
        asString(claims[CLAIM_NAME]) ??
        asString(claims['nombre']) ??
        email,
      email,
      roles: asArray(claims['role'] ?? claims[CLAIM_ROLE] ?? claims['roles']),
      exp: typeof claims['exp'] === 'number' ? claims['exp'] : null,
    };
  } catch {
    return null;
  }
}
