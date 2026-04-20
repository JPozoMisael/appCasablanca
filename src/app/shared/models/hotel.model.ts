export interface Hotel {

  id: number;
  nombre: string;
  slug: string;

  ciudad: string;
  pais: string;

  estrellas?: number;

  rating?: number;
  precio_desde?: number;
  imagen?: string;

}