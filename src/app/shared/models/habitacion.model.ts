export type EstadoHabitacion = 'DISPONIBLE' | 'OCUPADA' | 'MANTENIMIENTO' | 'LIMPIEZA';

export interface Habitacion {
  id: number;
  numero: string;
  tipo: string;
  descripcion?: string | null;
  capacidad: number;
  camas?: number | null;
  precioNoche: number;
  estado: EstadoHabitacion;
  imagenUrl?: string | null;
}
