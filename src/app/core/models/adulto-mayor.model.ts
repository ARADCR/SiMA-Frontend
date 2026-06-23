export interface AdultoMayor {
  idAdulto: number;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;   // ISO date
  edad?: number;
  condicionesMedicas?: string;
  contactoMedico?: string;
  activo: boolean;
  creadoEn?: string;
}

export interface AdultoMayorCreate {
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  condicionesMedicas?: string;
  contactoMedico?: string;
}

export interface AdultoMayorUpdate extends Partial<AdultoMayorCreate> {
  activo?: boolean;
}
