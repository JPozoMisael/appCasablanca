export type Role = 'ADMIN' | 'RECEPCION' | 'GERENCIA' | 'CLIENTE';

export const ROLES = {
  ADMIN: 'ADMIN' as Role,
  RECEPCION: 'RECEPCION' as Role,
  GERENCIA: 'GERENCIA' as Role,
  CLIENTE: 'CLIENTE' as Role,
};

export const ADMIN_ROLES: Role[] = [ROLES.ADMIN, ROLES.GERENCIA];
