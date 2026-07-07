import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RespuestaApi } from '../models/respuesta-api.model';
import { DispositivoIot, DispositivoIotRequest } from '../models/dispositivo-iot.model';

@Injectable({
  providedIn: 'root'
})
export class DispositivoIotService {
  private apiUrl = `${environment.apiUrl}/dispositivos`;

  constructor(private http: HttpClient) {}

  listar(): Observable<RespuestaApi<DispositivoIot[]>> {
    return this.http.get<RespuestaApi<DispositivoIot[]>>(this.apiUrl);
  }

  listarSinAsignar(): Observable<RespuestaApi<DispositivoIot[]>> {
    return this.http.get<RespuestaApi<DispositivoIot[]>>(`${this.apiUrl}/sin-asignar`);
  }

  listarPorAdulto(idAdulto: number): Observable<RespuestaApi<DispositivoIot[]>> {
    return this.http.get<RespuestaApi<DispositivoIot[]>>(`${this.apiUrl}/adulto/${idAdulto}`);
  }

  registrar(request: DispositivoIotRequest): Observable<RespuestaApi<DispositivoIot>> {
    return this.http.post<RespuestaApi<DispositivoIot>>(this.apiUrl, request);
  }

  actualizar(id: number, request: DispositivoIotRequest): Observable<RespuestaApi<DispositivoIot>> {
    return this.http.put<RespuestaApi<DispositivoIot>>(`${this.apiUrl}/${id}`, request);
  }

  asignar(id: number, idAdulto: number): Observable<RespuestaApi<DispositivoIot>> {
    return this.http.put<RespuestaApi<DispositivoIot>>(`${this.apiUrl}/${id}/asignar`, { idAdulto });
  }

  desasignar(id: number): Observable<RespuestaApi<VoidFunction>> {
    return this.http.put<RespuestaApi<VoidFunction>>(`${this.apiUrl}/${id}/desasignar`, {});
  }
}
