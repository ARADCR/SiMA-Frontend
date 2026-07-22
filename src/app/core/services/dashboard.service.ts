import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
  totalUsuarios: number;
  adultosActivos: number;
  dispositivosConectados: number;
  alertasActivas: number;
}

export interface DashboardUser {
  id: number;
  initials: string;
  avatarBg: string;
  name: string;
  email: string;
  role: string;
  roleBg: string;
  roleColor: string;
  lastAccess: string;
}

export interface PendingCredential {
  id: number;
  initials: string;
  name: string;
  docType: string;
  date: string;
}

export interface UnassignedDevice {
  id: number;
  type: string;
  mac: string;
}

export interface AdminDashboardResponse {
  stats: DashboardStats;
  usuarios: DashboardUser[];
  pendingCredentials: PendingCredential[];
  unassignedDevices: UnassignedDevice[];
}

export interface ReporteHistorial {
  id: number;
  nombre: string;
  tipo: string;
  fecha: string;
  generadoPor: string;
  estado: string;
}

export interface AdminReportesResponse {
  cumplimientoPromedio: number;
  tomasRegistradasSemana: number;
  alertasGeneradas: number;
  alertasActivas: number;
  cuidadoresActivos: number;
  historial: ReporteHistorial[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/dashboard';

  getAdminDashboard(): Observable<AdminDashboardResponse> {
    return this.http.get<AdminDashboardResponse>(`${this.apiUrl}/admin`);
  }

  getAdminReportes(): Observable<AdminReportesResponse> {
    return this.http.get<AdminReportesResponse>(`${this.apiUrl}/reportes`);
  }

  createReporte(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reportes`, data);
  }

  downloadReporte(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/reportes/${id}/download`, { responseType: 'blob' });
  }

  deleteReporte(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reportes/${id}`);
  }
}
