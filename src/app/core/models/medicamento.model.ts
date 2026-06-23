export type FrecuenciaMedicamento = 'diario' | 'semanal' | 'mensual' | 'cada_X_horas';
export type EstadoToma = 'pendiente' | 'tomado' | 'omitido' | 'retrasado';

export interface Medicamento {
  id: number;
  nombre: string;
  principioActivo?: string;
  dosis: string;
  frecuencia: FrecuenciaMedicamento;
  horasToma?: number[];       // e.g. [8, 14, 20]
  fechaInicio: string;
  fechaFin?: string;
  instrucciones?: string;
  stockActual?: number;
  stockMinimo?: number;
  activo: boolean;
  adultoMayorId: number;
  prescritoPor?: string;
  createdAt?: string;
}

export interface Toma {
  id: number;
  medicamentoId: number;
  medicamentoNombre?: string;
  adultoMayorId: number;
  fechaHoraProgramada: string;
  fechaHoraReal?: string;
  estado: EstadoToma;
  observacion?: string;
  registradoPor?: number;
  registradoPorNombre?: string;
}

export interface MedicamentoCreate {
  nombre: string;
  principioActivo?: string;
  dosis: string;
  frecuencia: FrecuenciaMedicamento;
  horasToma?: number[];
  fechaInicio: string;
  fechaFin?: string;
  instrucciones?: string;
  stockActual?: number;
  stockMinimo?: number;
  adultoMayorId: number;
  prescritoPor?: string;
}
