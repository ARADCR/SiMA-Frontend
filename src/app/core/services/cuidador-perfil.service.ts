import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface DatosContactoCuidador {
  correo: string;
  telefono?: string | null;
  ciudad?: string | null;
  tarifaHora?: number | null;
  disponibilidad?: string | null;
}

export interface DatosContactoCuidadorResponse {
  correo: string;
  telefono: string | null;
  ciudad: string | null;
  tarifaHora: number | null;
  disponibilidad: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class CuidadorPerfilService {
  private readonly endpoint = '/cuidador/perfil';

  constructor(private api: ApiService) {}

  obtenerPerfil(): Observable<DatosContactoCuidadorResponse> {
    return this.api
      .get<DatosContactoCuidadorResponse>(this.endpoint)
      .pipe(map(r => r.data));
  }

  actualizarPerfil(datos: DatosContactoCuidador): Observable<DatosContactoCuidadorResponse> {
    return this.api
      .put<DatosContactoCuidadorResponse>(this.endpoint, datos)
      .pipe(map(r => r.data));
  }
}
