import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CuidadorPublic {
  idUsuario: number;
  nombre: string;
  apellido: string;
  especialidad: string;
  calificacion: number;
  experiencia: string;
  precio: string;
  resumenIa?: string | null;
}

export interface SolicitudVinculacion {
  idSolicitud: number;
  nombreFamiliar: string;
  correoFamiliar: string;
  nombreAdulto: string;
  idAdulto: number;
  estado: string;
  fechaCreacion: string;
  fechaRespuesta: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class VinculacionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/vinculaciones`;

  // Para el Familiar
  getCuidadoresDisponibles(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/cuidadores`);
  }

  enviarSolicitud(idAdulto: number, idCuidador: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/solicitar`, {
      idAdulto,
      idCuidador
    });
  }

  // Para el Cuidador
  getPendientes(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/pendientes`);
  }

  responderSolicitud(idSolicitud: number, aceptar: boolean): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${idSolicitud}/responder?aceptar=${aceptar}`, {});
  }
}
