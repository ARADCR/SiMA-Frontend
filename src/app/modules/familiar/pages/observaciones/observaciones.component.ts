import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ObservacionService } from '../../../../core/services/observacion.service';
import { AdultoMayorService } from '../../../../core/services/adulto-mayor.service';
import { AiService, ResumenObservacionesResponse } from '../../../../core/services/ai.service';
import { Observacion } from '../../../../core/models/observacion.model';
import { AdultoMayor } from '../../../../core/models/adulto-mayor.model';

@Component({
  selector: 'app-observaciones-familiar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './observaciones.component.html',
  styleUrls: ['./observaciones.component.scss']
})
export class ObservacionesFamiliarComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private observacionSvc = inject(ObservacionService);
  private adultoSvc = inject(AdultoMayorService);
  private aiSvc = inject(AiService);

  adultos = signal<AdultoMayor[]>([]);
  adultoActual = signal<AdultoMayor | null>(null);
  observaciones = signal<Observacion[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  urgenciaFiltro = signal('');

  resumenIA = signal<ResumenObservacionesResponse | null>(null);
  resumenIALoading = signal(false);
  resumenIAError = signal<string | null>(null);

  ngOnInit(): void {
    const adultoId = Number(this.route.snapshot.queryParamMap.get('adultoId')
                  ?? this.route.snapshot.paramMap.get('id'));

    this.adultoSvc.getAll().subscribe({
      next: r => {
        const list = r.data ?? [];
        this.adultos.set(list);
        if (!adultoId && list.length > 0) {
          this.adultoActual.set(list[0]);
          this.cargarObservaciones(list[0].idAdulto);
        } else if (adultoId) {
          const found = list.find(a => a.idAdulto === adultoId);
          if (found) {
            this.adultoActual.set(found);
          } else {
            this.adultoSvc.getById(adultoId).subscribe({ next: a => this.adultoActual.set(a) });
          }
          this.cargarObservaciones(adultoId);
        } else {
          this.loading.set(false);
        }
      },
      error: () => {
        this.error.set('Error al cargar la lista de adultos mayores');
        this.loading.set(false);
      }
    });
  }

  cargarObservaciones(adultoId: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.observacionSvc.listarPorAdulto(adultoId).subscribe({
      next: (list) => {
        this.observaciones.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar las observaciones');
        this.loading.set(false);
      }
    });
    this.cargarResumenIA(adultoId);
  }

  cargarResumenIA(adultoId: number): void {
    this.resumenIA.set(null);
    this.resumenIAError.set(null);
    this.resumenIALoading.set(true);
    this.aiSvc.getResumenObservaciones(adultoId).subscribe({
      next: (resumen) => {
        this.resumenIA.set(resumen);
        this.resumenIALoading.set(false);
      },
      error: () => {
        this.resumenIAError.set('No se pudo generar el resumen de IA en este momento.');
        this.resumenIALoading.set(false);
      }
    });
  }

  cambiarAdulto(adulto: AdultoMayor): void {
    this.adultoActual.set(adulto);
    this.cargarObservaciones(adulto.idAdulto);
  }

  observacionesFiltradas(): Observacion[] {
    const list = this.observaciones();
    if (!this.urgenciaFiltro()) return list;
    return list.filter(o => o.urgencia === this.urgenciaFiltro());
  }

  hasVitales(obs: Observacion): boolean {
    return !!(obs.tensionArterial || obs.frecuenciaCardiaca || obs.temperatura);
  }

  urgenciaBadge(u: string): string {
    const map: Record<string, string> = {
      normal: 'badge badge-green',
      importante: 'badge badge-yellow',
      urgente: 'badge badge-red'
    };
    return map[u] ?? 'badge badge-blue';
  }

  urgenciaLabel(u: string): string {
    return u === 'normal' ? 'Normal' : u === 'importante' ? 'Importante' : 'Urgente';
  }

  formatearFecha(fechaStr: string): string {
    if (!fechaStr) return '';
    const date = new Date(fechaStr);
    return date.toLocaleString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
