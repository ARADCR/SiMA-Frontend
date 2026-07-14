import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AdultoMayorService } from '../../../../core/services/adulto-mayor.service';
import { ObservacionService } from '../../../../core/services/observacion.service';
import { AdultoMayor } from '../../../../core/models/adulto-mayor.model';
import { Observacion, UrgenciaObservacion } from '../../../../core/models/observacion.model';

const AVATAR_COLORS = ['#2E86AB', '#52B788', '#E76F51', '#F4A261', '#6C63FF'];

@Component({
  selector: 'app-observaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './observaciones.component.html',
  styleUrls: ['./observaciones.component.scss']
})
export class ObservacionesComponent implements OnInit {
  private adultoSvc = inject(AdultoMayorService);
  private observacionSvc = inject(ObservacionService);

  busqueda = '';
  pacienteFiltro = '';
  urgenciaFiltro = '';
  modalOpen = signal(false);
  toast = signal<string | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  guardando = signal(false);

  adultos = signal<AdultoMayor[]>([]);
  observaciones = signal<Observacion[]>([]);

  nuevaObs = {
    idAdulto: null as number | null,
    urgencia: 'normal' as UrgenciaObservacion,
    texto: '',
    ta: '', fc: '', temp: ''
  };

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading.set(true);
    this.error.set(null);

    this.adultoSvc.getMisPacientes().subscribe({
      next: (list) => {
        this.adultos.set(list);
        if (list.length === 0) {
          this.observaciones.set([]);
          this.loading.set(false);
          return;
        }

        forkJoin(list.map(a => this.observacionSvc.listarPorAdulto(a.idAdulto))).subscribe({
          next: (resultados) => {
            this.observaciones.set(resultados.flat());
            this.loading.set(false);
          },
          error: () => {
            this.error.set('Error al cargar las observaciones');
            this.loading.set(false);
          }
        });
      },
      error: () => {
        this.error.set('Error al cargar los pacientes');
        this.loading.set(false);
      }
    });
  }

  obsFiltradas = computed(() => {
    let list = this.observaciones();
    if (this.busqueda) {
      const q = this.busqueda.toLowerCase();
      list = list.filter(o => o.texto.toLowerCase().includes(q) || this.nombrePaciente(o.idAdulto).toLowerCase().includes(q));
    }
    if (this.pacienteFiltro) list = list.filter(o => String(o.idAdulto) === this.pacienteFiltro);
    if (this.urgenciaFiltro) list = list.filter(o => o.urgencia === this.urgenciaFiltro);
    return list;
  });

  nombrePaciente(idAdulto: number): string {
    const a = this.adultos().find(a => a.idAdulto === idAdulto);
    return a ? `${a.nombre} ${a.apellido}` : '';
  }

  inicialesPaciente(idAdulto: number): string {
    const a = this.adultos().find(a => a.idAdulto === idAdulto);
    return a ? `${a.nombre.charAt(0)}${a.apellido.charAt(0)}`.toUpperCase() : '';
  }

  colorPaciente(idAdulto: number): string {
    const index = this.adultos().findIndex(a => a.idAdulto === idAdulto);
    return AVATAR_COLORS[index % AVATAR_COLORS.length];
  }

  urgenciaBadgeClass(u: string): string { return `badge badge-${u}`; }
  urgenciaLabel(u: string): string {
    return u === 'normal' ? 'Normal' : u === 'importante' ? 'Importante' : 'Urgente';
  }

  hasVitales(obs: Observacion): boolean {
    return !!(obs.tensionArterial || obs.frecuenciaCardiaca || obs.temperatura);
  }

  formatearFecha(fechaStr: string): string {
    if (!fechaStr) return '';
    const date = new Date(fechaStr);
    return date.toLocaleString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  guardar(): void {
    if (!this.nuevaObs.idAdulto || !this.nuevaObs.texto.trim()) return;

    this.guardando.set(true);
    this.observacionSvc.registrar({
      idAdulto: this.nuevaObs.idAdulto,
      urgencia: this.nuevaObs.urgencia,
      texto: this.nuevaObs.texto,
      tensionArterial: this.nuevaObs.ta || undefined,
      frecuenciaCardiaca: this.nuevaObs.fc || undefined,
      temperatura: this.nuevaObs.temp || undefined
    }).subscribe({
      next: (creada) => {
        this.observaciones.update(list => [creada, ...list]);
        this.nuevaObs = { idAdulto: null, urgencia: 'normal', texto: '', ta: '', fc: '', temp: '' };
        this.modalOpen.set(false);
        this.guardando.set(false);
        this.showToast('Observación guardada correctamente');
      },
      error: () => {
        this.guardando.set(false);
        this.showToast('No se pudo guardar la observación');
      }
    });
  }

  cerrarSiEsOverlay(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) {
      this.modalOpen.set(false);
    }
  }

  resetFiltros(): void {
    this.busqueda = '';
    this.pacienteFiltro = '';
    this.urgenciaFiltro = '';
  }

  private showToast(msg: string): void {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(null), 3500);
  }
}
