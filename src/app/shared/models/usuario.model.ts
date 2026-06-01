export type RolUsuario = 'admin' | 'recepcion' | 'gerencia' | 'cliente' | 'super_admin';

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string | null;
  rol: RolUsuario;
  activo?: boolean;
  estado?: string;
  password?: string;
  creadoEn?: string;
  actualizadoEn?: string;
}