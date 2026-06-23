export type TipoAlerta = 
  | 'medicamento_omitido'
  | 'medicamento_retrasado'
  | 'stock_bajo'
  | 'emergencia'
  | 'caida_detectada'
  | 'frecuencia_cardiaca'
  | 'presion_arterial'
  | 'glucemia'
  | 'bateria_baja'
  | 'dispositivo_desconectado'
  | 'otro';

export type PrioridadAlerta = 'baja' | 'media' | 'alta' | 'critica';
export type EstadoAlerta = 'activa' | 'vista' | 'resuelta' | 'descartada';

export interface Alerta {
  id: number;
  tipo: TipoAlerta;
  prioridad: PrioridadAlerta;
  estado: EstadoAlerta;
  titulo: string;
  descripcion: string;
  adultoMayorId?: number;
  adultoMayorNombre?: string;
  dispositivoId?: number;
  medicamentoId?: number;
  timestamp: string;
  resolverPor?: string;
  resolucion?: string;
}

export interface AlertaFiltros {
  estado?: EstadoAlerta;
  prioridad?: PrioridadAlerta;
  tipo?: TipoAlerta;
  adultoMayorId?: number;
  desde?: string;
  hasta?: string;
}
