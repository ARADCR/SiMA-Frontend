import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { LecturaPulsera } from '../models/lectura-pulsera.model';

@Injectable({
  providedIn: 'root'
})
export class LecturaPulseraService {
  private readonly endpoint = '/lecturas-pulsera';

  constructor(private api: ApiService) {}

  /**
   * Obtiene la última lectura de pulsera de un adulto mayor.
   * GET /lecturas-pulsera/adulto/{idAdulto}/ultima
   */
  obtenerUltimaLectura(idAdulto: number): Observable<LecturaPulsera> {
    return this.api.get<LecturaPulsera>(`${this.endpoint}/adulto/${idAdulto}/ultima`)
      .pipe(map(r => r.data));
  }

  /**
   * Obtiene el historial completo de lecturas de un adulto mayor.
   * GET /lecturas-pulsera/adulto/{idAdulto}
   * Las lecturas vienen ordenadas de la más reciente a la más antigua.
   */
  obtenerHistorial(idAdulto: number): Observable<LecturaPulsera[]> {
    return this.api.get<LecturaPulsera[]>(`${this.endpoint}/adulto/${idAdulto}`)
      .pipe(map(r => r.data));
  }
}
