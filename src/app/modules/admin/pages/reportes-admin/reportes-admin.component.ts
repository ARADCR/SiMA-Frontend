import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Reporte { id: number; nombre: string; tipo: string; fecha: string; generadoPor: string; estado: string; }

@Component({
  selector: 'app-reportes-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes-admin.component.html',
  styleUrls: ['./reportes-admin.component.scss']
})
export class ReportesAdminComponent {
  reportes: Reporte[] = [
    { id: 1, nombre: 'Reporte semanal de tomas — Semana 26',   tipo: 'Semanal',    fecha: '28/06/2026', generadoPor: 'Sistema (auto)', estado: 'Completado' },
    { id: 2, nombre: 'Análisis de alertas — Junio 2026',       tipo: 'Mensual',    fecha: '25/06/2026', generadoPor: 'Admin SIMA',    estado: 'Completado' },
    { id: 3, nombre: 'Cumplimiento de medicación — Q2 2026',   tipo: 'Trimestral', fecha: '20/06/2026', generadoPor: 'Sistema (auto)', estado: 'Completado' },
    { id: 4, nombre: 'Actividad de cuidadores — Mayo 2026',    tipo: 'Mensual',    fecha: '01/06/2026', generadoPor: 'Admin SIMA',    estado: 'Completado' },
    { id: 5, nombre: 'Reporte dispositivos IoT — Q2 2026',     tipo: 'Trimestral', fecha: '15/06/2026', generadoPor: 'Sistema (auto)', estado: 'En proceso' },
  ];
}
