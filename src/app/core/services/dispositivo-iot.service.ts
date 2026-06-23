import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { DispositivoIot, DispositivoCreate, LecturaDispositivo } from '../models/dispositivo-iot.model';
import { RespuestaPaginada } from '../models/respuesta-api.model';

@Injectable({
  providedIn: 'root'
})
export class DispositivoIotService {
  private readonly endpoint = '/dispositivos';

  constructor(private api: ApiService) {}

  getAll(params?: Record<string, unknown>): Observable<any> {
    return this.api.get<any[]>(this.endpoint, params).pipe(
      map(r => ({ data: (r.data || []).map(this.mapBackendToFrontend) }))
    );
  }

  getByAdulto(adultoId: number): Observable<DispositivoIot[]> {
    return this.api.get<any[]>(`${this.endpoint}/adulto/${adultoId}`).pipe(
      map(r => (r.data || []).map(this.mapBackendToFrontend))
    );
  }

  getById(id: number): Observable<DispositivoIot> {
    return this.api.get<any>(`${this.endpoint}/${id}`).pipe(map(r => this.mapBackendToFrontend(r.data)));
  }

  create(dispositivo: any): Observable<DispositivoIot> {
    return this.api.post<any>(this.endpoint, dispositivo).pipe(map(r => this.mapBackendToFrontend(r.data)));
  }

  update(id: number, datos: any): Observable<DispositivoIot> {
    return this.api.put<any>(`${this.endpoint}/${id}`, datos).pipe(map(r => this.mapBackendToFrontend(r.data)));
  }

  private mapBackendToFrontend(d: any): DispositivoIot {
    return {
      id: d.idDispositivo,
      nombre: `Dispositivo ${d.identificadorFisico}`, // Backend doesnt store nombre, we use ID Fisico
      tipo: d.tipoDispositivo === 'pulsera_inteligente' ? 'pulsera' : 'sensor_cama',
      numeroSerie: d.identificadorFisico,
      estado: d.activo ? 'activo' : 'inactivo',
      adultoMayorId: d.idAdulto,
      adultoMayorNombre: d.nombreAdulto,
    } as DispositivoIot;
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`).pipe(map(() => void 0));
  }

  getLecturas(dispositivoId: number, params?: { desde?: string; hasta?: string; limit?: number }): Observable<LecturaDispositivo[]> {
    return this.api.get<LecturaDispositivo[]>(`${this.endpoint}/${dispositivoId}/lecturas`, params).pipe(map(r => r.data));
  }
}
