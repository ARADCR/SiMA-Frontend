import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Observacion, ObservacionCreate } from '../models/observacion.model';

@Injectable({
  providedIn: 'root'
})
export class ObservacionService {
  private readonly endpoint = '/observaciones';

  constructor(private api: ApiService) {}

  registrar(observacion: ObservacionCreate): Observable<Observacion> {
    return this.api.post<Observacion>(this.endpoint, observacion).pipe(map(r => r.data));
  }

  listarPorAdulto(idAdulto: number): Observable<Observacion[]> {
    return this.api.get<Observacion[]>(`${this.endpoint}/${idAdulto}`).pipe(map(r => r.data));
  }
}
