export interface DetalleDiario {
  fecha: string;           // ISO date "2026-07-07"
  totalProgramadas: number;
  totalTomadas: number;
}

export interface MedicamentoOmitido {
  nombre: string;
  cantidadOmisiones: number;
}

export interface ReporteMedicionSemanal {
  porcentajeAdherencia: number;
  totalProgramadas: number;
  totalTomadas: number;
  totalOmitidas: number;
  desgloseDiario: DetalleDiario[];
  medicamentosMasOmitidos: MedicamentoOmitido[];
}
