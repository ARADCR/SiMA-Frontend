import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { HistorialEvento } from '../models/historial.model';
import { RespuestaApi } from '../models/respuesta-api.model';

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class HistorialService {
  private readonly endpoint = '/historial';

  constructor(private api: ApiService) {}

  getHistorial(idAdulto: number, params?: {
    tipoEvento?: string;
    fechaInicio?: string;
    fechaFin?: string;
    page?: number;
    size?: number;
  }): Observable<Page<HistorialEvento>> {
    return this.api.get<Page<HistorialEvento>>(`${this.endpoint}/${idAdulto}`, params as Record<string, unknown>).pipe(
      map(r => r.data)
    );
  }
}
