import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Medicamento, MedicamentoCreate, Toma } from '../models/medicamento.model';
import { RespuestaPaginada } from '../models/respuesta-api.model';

@Injectable({
  providedIn: 'root'
})
export class MedicamentoService {
  private readonly endpoint = '/medicamentos';

  constructor(private api: ApiService) {}

  getAll(params?: Record<string, unknown>): Observable<RespuestaPaginada<Medicamento>> {
    return this.api.getPaginado<Medicamento>(this.endpoint, params);
  }

  getByAdulto(adultoMayorId: number): Observable<Medicamento[]> {
    return this.api.get<Medicamento[]>(`/adultos-mayores/${adultoMayorId}/medicamentos`).pipe(map(r => r.data));
  }

  getById(id: number): Observable<Medicamento> {
    return this.api.get<Medicamento>(`${this.endpoint}/${id}`).pipe(map(r => r.data));
  }

  create(medicamento: MedicamentoCreate): Observable<Medicamento> {
    return this.api.post<Medicamento>(this.endpoint, medicamento).pipe(map(r => r.data));
  }

  update(id: number, datos: Partial<MedicamentoCreate>): Observable<Medicamento> {
    return this.api.put<Medicamento>(`${this.endpoint}/${id}`, datos).pipe(map(r => r.data));
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`).pipe(map(() => void 0));
  }

  /** Tomas */
  getTomas(adultoMayorId: number, fecha?: string): Observable<Toma[]> {
    return this.api.get<Toma[]>(`/tomas/hoy/${adultoMayorId}`).pipe(map(r => r.data));
  }

  registrarToma(tomaId: number, datos: { estado: string; observacion?: string; fechaHoraReal?: string }): Observable<Toma> {
    const payload = {
      idRegistro: tomaId,
      metodoConfirmacion: 'app', // o manual_cuidador, dependiendo del rol, pero app funciona para HU-01
      observacion: datos.observacion
    };
    return this.api.post<Toma>(`/tomas/confirmar`, payload).pipe(map(r => r.data));
  }
}
