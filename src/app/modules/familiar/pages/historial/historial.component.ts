import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HistorialService, Page } from '../../../../core/services/historial.service';
import { AdultoMayorService } from '../../../../core/services/adulto-mayor.service';
import { HistorialEvento } from '../../../../core/models/historial.model';
import { AdultoMayor } from '../../../../core/models/adulto-mayor.model';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.scss']
})
export class HistorialComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private historialSvc = inject(HistorialService);
  private adultoSvc = inject(AdultoMayorService);

  // State
  adultos = signal<AdultoMayor[]>([]);
  adultoActual = signal<AdultoMayor | null>(null);
  eventos = signal<HistorialEvento[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // Filters & Pagination
  tipoActivo = signal('todos');
  fechaInicio = signal<string>('');
  fechaFin = signal<string>('');
  currentPage = signal(0);
  pageSize = signal(20);
  totalPages = signal(0);
  totalElements = signal(0);

  tipoPills = [
    { label: 'Todos',         value: 'todos' },
    { label: 'Tomas',         value: 'toma' },
    { label: 'Alertas',       value: 'alerta' },
    { label: 'IoT',           value: 'actividad_iot' }
  ];

  ngOnInit(): void {
    const adultoId = Number(this.route.snapshot.queryParamMap.get('adultoId')
                  ?? this.route.snapshot.paramMap.get('id'));

    this.adultoSvc.getAll().subscribe({
      next: r => {
        const list = r.data ?? [];
        this.adultos.set(list);
        if (!adultoId && list.length > 0) {
          this.adultoActual.set(list[0]);
          this.cargarHistorial(list[0].idAdulto);
        } else if (adultoId) {
          const found = list.find(a => a.idAdulto === adultoId);
          if (found) {
            this.adultoActual.set(found);
          } else {
            this.adultoSvc.getById(adultoId).subscribe({ next: a => this.adultoActual.set(a) });
          }
          this.cargarHistorial(adultoId);
        } else {
          this.loading.set(false);
        }
      },
      error: err => {
        this.error.set('Error al cargar la lista de adultos mayores');
        this.loading.set(false);
      }
    });
  }

  cargarHistorial(adultoId: number): void {
    this.loading.set(true);
    this.error.set(null);

    const params: any = {
      page: this.currentPage(),
      size: this.pageSize()
    };

    if (this.tipoActivo() !== 'todos') {
      params.tipoEvento = this.tipoActivo();
    }
    if (this.fechaInicio()) {
      params.fechaInicio = this.fechaInicio() + 'T00:00:00';
    }
    if (this.fechaFin()) {
      params.fechaFin = this.fechaFin() + 'T23:59:59';
    }

    this.historialSvc.getHistorial(adultoId, params).subscribe({
      next: (pageData: Page<HistorialEvento>) => {
        this.eventos.set(pageData.content);
        this.totalPages.set(pageData.totalPages);
        this.totalElements.set(pageData.totalElements);
        this.loading.set(false);
      },
      error: err => {
        this.error.set('Error al cargar el historial de salud');
        this.loading.set(false);
      }
    });
  }

  cambiarAdulto(adulto: AdultoMayor): void {
    this.adultoActual.set(adulto);
    this.currentPage.set(0);
    this.cargarHistorial(adulto.idAdulto);
  }

  cambiarFiltroTipo(tipo: string): void {
    this.tipoActivo.set(tipo);
    this.currentPage.set(0);
    const act = this.adultoActual();
    if (act) this.cargarHistorial(act.idAdulto);
  }

  aplicarFiltroFechas(): void {
    this.currentPage.set(0);
    const act = this.adultoActual();
    if (act) this.cargarHistorial(act.idAdulto);
  }

  limpiarFiltroFechas(): void {
    this.fechaInicio.set('');
    this.fechaFin.set('');
    this.currentPage.set(0);
    const act = this.adultoActual();
    if (act) this.cargarHistorial(act.idAdulto);
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 0 && nuevaPagina < this.totalPages()) {
      this.currentPage.set(nuevaPagina);
      const act = this.adultoActual();
      if (act) this.cargarHistorial(act.idAdulto);
    }
  }

  formatearFecha(fechaStr: string): string {
    if (!fechaStr) return '';
    try {
      const date = new Date(fechaStr);
      return date.toLocaleString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return fechaStr;
    }
  }

  tipoBadge(tipo: string): string {
    const map: Record<string, string> = {
      toma: 'badge badge-green',
      alerta: 'badge badge-red',
      actividad_iot: 'badge badge-blue'
    };
    return map[tipo] ?? 'badge badge-yellow';
  }

  obtenerMetodo(ev: HistorialEvento): string {
    if (ev.tipo === 'toma') {
      return ev.meta && ev.meta['confirmador'] ? ev.meta['confirmador'] : 'Sistema';
    } else if (ev.tipo === 'actividad_iot') {
      return ev.meta && ev.meta['tipoDispositivo'] ? String(ev.meta['tipoDispositivo']).replace('_', ' ') : 'IoT';
    }
    return 'Alerta';
  }
}
