import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AdultoMayor, AdultoMayorCreate, AdultoMayorUpdate } from '../models/adulto-mayor.model';
import { RespuestaPaginada } from '../models/respuesta-api.model';

@Injectable({
  providedIn: 'root'
})
export class AdultoMayorService {
  private readonly endpoint = '/adultos';

  constructor(private api: ApiService) {}

  getAll(params?: Record<string, unknown>): Observable<RespuestaPaginada<AdultoMayor>> {
    return this.api.getPaginado<AdultoMayor>(this.endpoint, params);
  }

  getAllAdmin(): Observable<AdultoMayor[]> {
    return this.api.get<AdultoMayor[]>(`${this.endpoint}/todos`).pipe(map(r => r.data));
  }

  getById(id: number): Observable<AdultoMayor> {
    return this.api.get<AdultoMayor>(`${this.endpoint}/${id}`).pipe(map(r => r.data));
  }

  getMisPacientes(familiarId?: number, cuidadorId?: number): Observable<AdultoMayor[]> {
    const params: Record<string, unknown> = {};
    if (familiarId) params['familiarId'] = familiarId;
    if (cuidadorId) params['cuidadorId'] = cuidadorId;
    return this.api.get<AdultoMayor[]>(this.endpoint, params).pipe(map(r => r.data));
  }

  create(adulto: AdultoMayorCreate): Observable<AdultoMayor> {
    return this.api.post<AdultoMayor>(this.endpoint, adulto).pipe(map(r => r.data));
  }

  update(id: number, datos: AdultoMayorUpdate): Observable<AdultoMayor> {
    return this.api.put<AdultoMayor>(`${this.endpoint}/${id}`, datos).pipe(map(r => r.data));
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`).pipe(map(() => void 0));
  }
}
