export type TipoDispositivo = 'pulsera' | 'sensor_cama' | 'camara' | 'boton_panico' | 'glucometro' | 'tensimetro' | 'otro';
export type EstadoDispositivo = 'activo' | 'inactivo' | 'mantenimiento' | 'desconectado';

export interface DispositivoIot {
  id: number;
  nombre: string;
  tipo: TipoDispositivo;
  modelo?: string;
  numeroSerie?: string;
  estado: EstadoDispositivo;
  nivelBateria?: number;       // 0-100
  ultimaConexion?: string;
  adultoMayorId?: number;
  adultoMayorNombre?: string;
  configuracion?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface LecturaDispositivo {
  id: number;
  dispositivoId: number;
  tipo: string;
  valor: number | string;
  unidad?: string;
  timestamp: string;
  alerta?: boolean;
}

export interface DispositivoCreate {
  nombre: string;
  tipo: TipoDispositivo;
  modelo?: string;
  numeroSerie?: string;
  adultoMayorId?: number;
}
