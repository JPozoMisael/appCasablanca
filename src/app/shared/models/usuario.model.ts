export type RolUsuario = 'ADMIN' | 'RECEPCION' | 'GERENCIA' | 'CLIENTE';

export interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string | null;
  rol: RolUsuario;
  activo: boolean;
  creadoEn?: string;
  actualizadoEn?: string;
}
