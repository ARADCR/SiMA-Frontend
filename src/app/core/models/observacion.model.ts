export type UrgenciaObservacion = 'normal' | 'importante' | 'urgente';

export interface Observacion {
  idObservacion: number;
  idAdulto: number;
  idCuidador: number;
  cuidadorNombre: string;
  urgencia: UrgenciaObservacion;
  texto: string;
  tensionArterial?: string;
  frecuenciaCardiaca?: string;
  temperatura?: string;
  fechaHora: string;
}

export interface ObservacionCreate {
  idAdulto: number;
  urgencia: UrgenciaObservacion;
  texto: string;
  tensionArterial?: string;
  frecuenciaCardiaca?: string;
  temperatura?: string;
  /** true si el Cuidador aceptó explícitamente la sugerencia de urgencia "urgente" generada por la IA */
  sugerenciaIaAceptada?: boolean;
}
