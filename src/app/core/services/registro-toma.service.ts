import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
    return this.api.get<RegistroTomaResponse[]>(`/tomas/hoy/${idAdulto}`).pipe(
      map(res => res.data)
    );
  }

  /**
   * Obtiene la próxima toma pendiente de un adulto.
   */
  getProximaToma(idAdulto: number): Observable<RegistroTomaResponse> {
    return this.api.get<RegistroTomaResponse>(`/tomas/proxima/${idAdulto}`).pipe(
      map(res => res.data)
    );
  }

  /**
   * Confirma una toma de medicamento.
   */
  confirmarToma(request: RegistroTomaRequest): Observable<RegistroTomaResponse> {
    return this.api.post<RegistroTomaResponse>('/tomas/confirmar', request).pipe(
      map(res => res.data)
    );
  }

  /**
   * Registra una toma como omitida por el cuidador.
   */
  omitirToma(idRegistro: number): Observable<RegistroTomaResponse> {
    const body: RegistroTomaRequest = {
      idRegistro,
      metodoConfirmacion: 'omision_cuidador'
    };
    return this.api.post<RegistroTomaResponse>('/tomas/omitir', body).pipe(
      map(res => res.data)
    );
  }

  /**
   * Revierte una toma confirmada u omitida a estado pendiente.
   */
  revertirToma(idRegistro: number): Observable<RegistroTomaResponse> {
    return this.api.post<RegistroTomaResponse>(`/tomas/revertir/${idRegistro}`, {}).pipe(
      map(res => res.data)
    );
  }
}
