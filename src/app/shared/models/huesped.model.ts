export interface Huesped {
  id: number;
  nombres: string;
  apellidos: string;
  documento?: string | null;
  email?: string | null;
  telefono?: string | null;
  nacionalidad?: string | null;
  fechaNacimiento?: string | null;
  creadoEn?: string;
}
