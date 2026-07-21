import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ReporteService } from '../../../../core/services/reporte.service';
import { AdultoMayorService } from '../../../../core/services/adulto-mayor.service';
import { AiService, PatronesAdherenciaResponse, ResumenReporteIAResponse } from '../../../../core/services/ai.service';
import { ReporteMedicionSemanal } from '../../../../core/models/reporte-medicacion.model';
import { AdultoMayor } from '../../../../core/models/adulto-mayor.model';

@Component({
  selector: 'app-reportes-medicacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes-medicacion.component.html',
  styleUrls: ['./reportes-medicacion.component.scss']
})
export class ReportesMedicacionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private reporteSvc = inject(ReporteService);
  private adultoSvc = inject(AdultoMayorService);
  private aiSvc = inject(AiService);

  adultos = signal<AdultoMayor[]>([]);
  adultoActual = signal<AdultoMayor | null>(null);
  reporte = signal<ReporteMedicionSemanal | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  resumenIA = signal<ResumenReporteIAResponse | null>(null);
  resumenIALoading = signal(false);
  resumenIAError = signal<string | null>(null);

  patronesIA = signal<PatronesAdherenciaResponse | null>(null);
  patronesIALoading = signal(false);
  patronesIAError = signal<string | null>(null);
  patronesIAVisible = signal(false);

  ngOnInit(): void {
    const adultoId = Number(
      this.route.snapshot.queryParamMap.get('adultoId') ??
      this.route.snapshot.paramMap.get('id')
    );

    this.adultoSvc.getMisPacientes().subscribe({
      next: list => {
        this.adultos.set(list);
        if (!adultoId && list.length > 0) {
          this.adultoActual.set(list[0]);
          this.cargarReporte(list[0].idAdulto);
        } else if (adultoId) {
          const found = list.find(a => a.idAdulto === adultoId);
          this.adultoActual.set(found ?? null);
          this.cargarReporte(adultoId);
        } else {
          this.loading.set(false);
        }
      },
      error: () => {
        this.error.set('Error al cargar la lista de pacientes');
        this.loading.set(false);
      }
    });
  }

  cargarReporte(idAdulto: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.reporteSvc.getReporteSemanal(idAdulto).subscribe({
      next: data => {
        this.reporte.set(data);
        this.loading.set(false);
        this.cargarResumenIA(idAdulto);
      },
      error: () => {
        this.error.set('No se pudo cargar el reporte. Verificá tu conexión o permisos.');
        this.loading.set(false);
      }
    });
  }

  cargarResumenIA(idAdulto: number): void {
    this.resumenIALoading.set(true);
    this.resumenIAError.set(null);
    this.aiSvc.getResumenReporte(idAdulto).subscribe({
      next: data => {
        this.resumenIA.set(data);
        this.resumenIALoading.set(false);
      },
      error: () => {
        this.resumenIAError.set('No se pudo generar el análisis IA en este momento.');
        this.resumenIALoading.set(false);
      }
    });
  }

  toggleVerPatrones(): void {
    const idAdulto = this.adultoActual()?.idAdulto;
    if (!idAdulto) return;

    if (this.patronesIAVisible()) {
      this.patronesIAVisible.set(false);
      return;
    }

    this.patronesIAVisible.set(true);
    if (this.patronesIA()) return; // ya cargados, no re-fetch

    this.patronesIALoading.set(true);
    this.patronesIAError.set(null);
    this.aiSvc.getPatronesAdherencia(idAdulto).subscribe({
      next: data => {
        this.patronesIA.set(data);
        this.patronesIALoading.set(false);
      },
      error: () => {
        this.patronesIAError.set('No se pudieron cargar los patrones detectados.');
        this.patronesIALoading.set(false);
      }
    });
  }

  severidadIcono(severidad: string): string {
    if (severidad === 'alta') return '🔴';
    if (severidad === 'media') return '🟡';
    return '🟢';
  }

  cambiarAdulto(adulto: AdultoMayor): void {
    this.adultoActual.set(adulto);
    this.resumenIA.set(null);
    this.patronesIA.set(null);
    this.patronesIAVisible.set(false);
    this.cargarReporte(adulto.idAdulto);
  }

  adherenciaColor(pct: number): string {
    if (pct >= 80) return '#16A34A';
    if (pct >= 60) return '#D97706';
    return '#DC2626';
  }

  adherenciaBackground(pct: number): string {
    if (pct >= 80) return '#DCFCE7';
    if (pct >= 60) return '#FEF3C7';
    return '#FEE2E2';
  }

  barWidth(tomadas: number, programadas: number): string {
    if (!programadas) return '0%';
    return Math.min((tomadas / programadas) * 100, 100).toFixed(1) + '%';
  }

  formatDia(isoDate: string): string {
    if (!isoDate) return '';
    const d = new Date(isoDate + 'T12:00:00');
    return d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });
  }
}
