export interface LecturaPulsera {
  idLectura: number;
  idDispositivo: number;
  identificadorFisico: string;
  idAdulto: number;
  nombreAdulto: string;
  frecuenciaCardiaca: number | null;
  spo2: number | null;
  presionSistolica: number | null;
  presionDiastolica: number | null;
  pasosDiarios: number | null;
  nivelBateria: number | null;
  fechaMedicion: string;
  fechaRecepcion: string;
  mensaje?: string;
}
