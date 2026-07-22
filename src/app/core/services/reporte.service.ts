import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { ReporteMedicionSemanal } from '../models/reporte-medicacion.model';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private readonly endpoint = '/reportes/medicacion';

  constructor(private api: ApiService) {}

  getReporteSemanal(idAdulto: number): Observable<ReporteMedicionSemanal> {
    return this.api
      .get<ReporteMedicionSemanal>(`${this.endpoint}/${idAdulto}/semanal`)
      .pipe(map(r => r.data));
  }
}
