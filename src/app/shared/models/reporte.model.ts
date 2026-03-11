export type TipoReporte = 'INGRESOS' | 'OCUPACION' | 'RESERVAS';

export interface Reporte {
  id: number;
  tipo: TipoReporte;
  titulo: string;
  desde: string; // YYYY-MM-DD
  hasta: string; // YYYY-MM-DD
  generadoEn: string;

  data?: any; // luego lo tipamos mejor según tu API
}
