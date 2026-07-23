export type TipoDispositivo = 'pastillero_esp32' | 'pulsera_inteligente';

export interface DispositivoIot {
  idDispositivo: number;
  identificadorFisico: string;
  tipoDispositivo: TipoDispositivo;
  idAdulto: number | null;
  nombreAdulto: string | null;
  activo: boolean;
  fechaRegistro: string;
  ultimaConexion?: string;
  online?: boolean;
}

export interface DispositivoIotRequest {
  identificadorFisico: string;
  tipoDispositivo: TipoDispositivo;
  idAdulto?: number | null;
}
