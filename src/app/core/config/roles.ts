export type Role =

  | 'super_admin'
  | 'admin'
  | 'recepcion'
  | 'cliente';


// =========================================
// ROLES
// =========================================

export const ROLES = {

  SUPER_ADMIN:
    'super_admin' as Role,

  ADMIN:
    'admin' as Role,

  RECEPCION:
    'recepcion' as Role,

  CLIENTE:
    'cliente' as Role,
};


// =========================================
// ADMIN ROLES
// =========================================

export const ADMIN_ROLES: Role[] = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.RECEPCION,
];