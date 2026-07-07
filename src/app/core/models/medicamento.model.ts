export type FrecuenciaMedicamento = 'diario' | 'semanal' | 'mensual' | 'cada_X_horas';
export type EstadoToma = 'pendiente' | 'tomado' | 'omitido' | 'retrasado';

export interface HorarioMedicamento {
  idHorario: number;
  horaProgramada: string;
  activo: boolean;
}

export interface Medicamento {
  idMedicamento: number;
  idAdulto: number;
  nombre: string;
  dosis: string;
  frecuenciaHoras: number;
  activo: boolean;
  observaciones?: string;
  creadoEn: string;
  horarios?: HorarioMedicamento[];
  stockActual?: number;
  stockMinimo?: number;
  prescritoPor?: string;
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
