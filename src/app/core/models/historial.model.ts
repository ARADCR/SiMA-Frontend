export interface HistorialEvento {
  id: number;
  tipo: 'toma' | 'alerta' | 'actividad_iot';
  subtipo: string;
  titulo: string;
  descripcion: string;
  fechaHora: string;
  meta?: Record<string, any>;
}
