import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Alerta, AlertaFiltros } from '../models/alerta.model';
import { RespuestaPaginada, ParametrosPaginacion } from '../models/respuesta-api.model';

@Injectable({
  providedIn: 'root'
})
export class AlertaService {
  private readonly endpoint = '/alertas';

  constructor(private api: ApiService) {}

  getAll(filtros?: AlertaFiltros & ParametrosPaginacion): Observable<RespuestaPaginada<Alerta>> {
    return this.api.getPaginado<Alerta>(this.endpoint, filtros as Record<string, unknown>);
  }

  getActivas(): Observable<Alerta[]> {
    return this.api.get<Alerta[]>(`${this.endpoint}/activas`).pipe(map(r => r.data));
  }

  getById(id: number): Observable<Alerta> {
    return this.api.get<Alerta>(`${this.endpoint}/${id}`).pipe(map(r => r.data));
  }

  marcarVista(id: number): Observable<Alerta> {
    return this.api.patch<Alerta>(`${this.endpoint}/${id}/vista`, {}).pipe(map(r => r.data));
  }

  resolver(id: number, resolucion: string): Observable<Alerta> {
    return this.api.patch<Alerta>(`${this.endpoint}/${id}/resolver`, { resolucion }).pipe(map(r => r.data));
  }

  descartar(id: number): Observable<Alerta> {
    return this.api.patch<Alerta>(`${this.endpoint}/${id}/descartar`, {}).pipe(map(r => r.data));
  }

  getContadorActivas(): Observable<number> {
    return this.api.get<{ total: number }>(`${this.endpoint}/contador`).pipe(map(r => r.data.total));
  }
}
