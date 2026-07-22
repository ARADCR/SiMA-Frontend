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

export interface CuidadorStats {
  pacientes: number;
  calificacion: number;
  tomasRegistradas: number;
  cumplimiento: number;
}

export interface DatosContactoCuidadorResponse {
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string | null;
  ciudad: string | null;
  tarifaHora: number | null;
  disponibilidad: string | null;
}

export interface ResenaResponse {
  id: number;
  familia: string;
  initials: string;
  puntos: number;
  texto: string;
  fecha: string;
}

export interface CredencialResponse {
  id: number;
  tipo: string;
  nombre: string;
  fecha: string;
  estado: string;
  archivoUrl: string;
}

export interface CrearCredencialRequest {
  tipo: string;
  nombre: string;
  archivoFalsoNombre: string;
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

  obtenerStats(): Observable<CuidadorStats> {
    return this.api
      .get<CuidadorStats>(`${this.endpoint}/stats`)
      .pipe(map(r => r.data));
  }

  obtenerResenas(): Observable<ResenaResponse[]> {
    return this.api
      .get<ResenaResponse[]>(`${this.endpoint}/resenas`)
      .pipe(map(r => r.data));
  }

  obtenerCredenciales(): Observable<CredencialResponse[]> {
    return this.api
      .get<CredencialResponse[]>('/cuidador/credenciales')
      .pipe(map(r => r.data));
  }

  subirCredencial(request: CrearCredencialRequest): Observable<CredencialResponse> {
    return this.api
      .post<CredencialResponse>('/cuidador/credenciales', request)
      .pipe(map(r => r.data));
  }
}
