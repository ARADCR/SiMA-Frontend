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

  getAll(params?: Record<string, unknown>): Observable<RespuestaPaginada<DispositivoIot>> {
    return this.api.getPaginado<DispositivoIot>(this.endpoint, params);
  }

  getByAdulto(adultoMayorId: number): Observable<DispositivoIot[]> {
    return this.api.get<DispositivoIot[]>(`/adultos-mayores/${adultoMayorId}/dispositivos`).pipe(map(r => r.data));
  }

  getById(id: number): Observable<DispositivoIot> {
    return this.api.get<DispositivoIot>(`${this.endpoint}/${id}`).pipe(map(r => r.data));
  }

  create(dispositivo: DispositivoCreate): Observable<DispositivoIot> {
    return this.api.post<DispositivoIot>(this.endpoint, dispositivo).pipe(map(r => r.data));
  }

  update(id: number, datos: Partial<DispositivoCreate>): Observable<DispositivoIot> {
    return this.api.put<DispositivoIot>(`${this.endpoint}/${id}`, datos).pipe(map(r => r.data));
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`).pipe(map(() => void 0));
  }

  getLecturas(dispositivoId: number, params?: { desde?: string; hasta?: string; limit?: number }): Observable<LecturaDispositivo[]> {
    return this.api.get<LecturaDispositivo[]>(`${this.endpoint}/${dispositivoId}/lecturas`, params).pipe(map(r => r.data));
  }
}
