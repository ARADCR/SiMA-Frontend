import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface RegistroTomaResponse {
  idRegistro: number;
  horario: {
    idHorario: number;
    horaProgramada: string;
    medicamento: {
      idMedicamento: number;
      nombre: string;
      dosis: string;
    };
  };
  estado: 'pendiente' | 'tomado' | 'omitido' | 'confirmado_manual';
  metodoConfirmacion: string | null;
  fechaHoraProgramada: string;
  fechaHoraRegistro: string | null;
  observacion: string | null;
}

export interface RegistroTomaRequest {
  idRegistro: number;
  metodoConfirmacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class RegistroTomaService {
  private api = inject(ApiService);

  /**
   * Obtiene las tomas del día para el adulto especificado.
   */
  getTomasDelDia(idAdulto: number): Observable<RegistroTomaResponse[]> {
    return this.api.get<RegistroTomaResponse[]>(`/tomas/hoy/${idAdulto}`);
  }

  /**
   * Obtiene la próxima toma pendiente de un adulto.
   */
  getProximaToma(idAdulto: number): Observable<RegistroTomaResponse> {
    return this.api.get<RegistroTomaResponse>(`/tomas/proxima/${idAdulto}`);
  }

  /**
   * Confirma una toma de medicamento.
   */
  confirmarToma(request: RegistroTomaRequest): Observable<RegistroTomaResponse> {
    return this.api.post<RegistroTomaResponse>('/tomas/confirmar', request);
  }
}
