import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { AdultoMayorService } from '../../../../core/services/adulto-mayor.service';
import { RegistroTomaService, RegistroTomaResponse } from '../../../../core/services/registro-toma.service';
import { AlertaService } from '../../../../core/services/alerta.service';
import { HistorialService } from '../../../../core/services/historial.service';
import { ObservacionService } from '../../../../core/services/observacion.service';
import { AiService, ResumenAlertasIAResponse } from '../../../../core/services/ai.service';

interface TodayMed {
  nombre: string;
  dosis: string;
  hora: string;
  estado: 'tomado' | 'pendiente' | 'omitido';
}

interface Alerta {
  id: number;
  titulo: string;
  descripcion: string;
  tipo: 'urgente' | 'moderado';
  hora: string;
  resuelta: boolean;
}

interface Adulto {
  id: number;
  nombre: string;
  initials: string;
  activo: boolean;
}

@Component({
  selector: 'app-dashboard-familiar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-familiar.component.html',
  styleUrls: ['./dashboard-familiar.component.scss']
})
export class DashboardFamiliarComponent implements OnInit {
  protected auth = inject(AuthService);
  private adultoSvc = inject(AdultoMayorService);
  private registroTomaService = inject(RegistroTomaService);
  private alertaSvc = inject(AlertaService);
  private historialSvc = inject(HistorialService);
  private observacionSvc = inject(ObservacionService);
  private aiSvc = inject(AiService);

  adultoActivo = signal<number | null>(null);
  toast = signal<string | null>(null);
  loading = signal(true);

  resumenAlertasIA = signal<ResumenAlertasIAResponse | null>(null);
  loadingResumenIA = signal(false);

  adultos: Adulto[] = [];
  medicamentosHoy = signal<TodayMed[]>([]);
  alertas = signal<Alerta[]>([]);
  ultimoEvento = signal<{ titulo: string; metodo: string; hora: string } | null>(null);
  observaciones: { cuidador: string; initials: string; hora: string; texto: string }[] = [];

  alertasActivas = computed(() => this.alertas().filter(a => !a.resuelta));
  tomadas = computed(() => this.medicamentosHoy().filter(m => m.estado === 'tomado').length);
  totalMeds = computed(() => this.medicamentosHoy().length);
  cumplimientoPct = computed(() => {
    const total = this.totalMeds();
    if (total === 0) return 100;
    return Math.round((this.tomadas() / total) * 100);
  });
  proxima = computed(() => this.medicamentosHoy().find(m => m.estado === 'pendiente') ?? null);

  adultoActivoObj = computed(() => this.adultos.find(a => a.id === this.adultoActivo()) ?? this.adultos[0]);

  constructor() {
    effect(() => {
      const idAdulto = this.adultoActivo();
      if (idAdulto != null) {
        this.cargarTomasDelDia(idAdulto);
      }
    });
  }

  ngOnInit(): void {
    this.cargarAdultos();
  }

  private cargarAdultos(): void {
    this.loading.set(true);
    this.adultoSvc.getMisPacientes().subscribe({
      next: (list) => {
        this.adultos = list.map(a => ({
          id: a.idAdulto,
          nombre: `${a.nombre} ${a.apellido}`,
          initials: (a.nombre.charAt(0) + a.apellido.charAt(0)).toUpperCase(),
          activo: a.activo
        }));

        if (this.adultos.length > 0) {
          const firstId = this.adultos[0].id;
          this.adultoActivo.set(firstId);
          this.cargarDatosAdulto(firstId);
        } else {
          this.loading.set(false);
        }
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  cargarTomasDelDia(idAdulto: number): void {
    this.registroTomaService.getTomasDelDia(idAdulto).subscribe({
      next: (res: RegistroTomaResponse[]) => {
        const meds = res.map(toma => ({
          nombre: toma.horario.medicamento.nombre,
          dosis: toma.horario.medicamento.dosis,
          hora: toma.horario.horaProgramada.substring(0, 5),
          estado: (toma.estado === 'confirmado_manual' ? 'tomado' : toma.estado) as TodayMed['estado']
        }));
        this.medicamentosHoy.set(meds);
      },
      error: err => {
        console.error('Error al cargar tomas', err);
        this.showToast('Error al cargar medicamentos del día');
      }
    });
  }

  seleccionarAdulto(id: number): void {
    this.adultoActivo.set(id);
    this.cargarDatosAdulto(id);
  }

  private cargarDatosAdulto(idAdulto: number): void {
    // 1. Cargar alertas activas
    this.alertaSvc.getActivas().subscribe({
      next: (alertas) => {
        const filtradas = alertas.filter(a => a.adultoMayorId === idAdulto);
        this.alertas.set(filtradas.map(a => ({
          id: a.id,
          titulo: a.titulo || a.tipo.replace('_', ' '),
          descripcion: a.descripcion,
          tipo: a.prioridad === 'alta' || a.prioridad === 'critica' ? 'urgente' : 'moderado',
          hora: this.formatearTiempoRelativo(a.timestamp),
          resuelta: a.estado === 'resuelta'
        })));
      }
    });

    // 2. Cargar último evento del historial
    this.historialSvc.getHistorial(idAdulto, { size: 1 }).subscribe({
      next: (page) => {
        if (page && page.content && page.content.length > 0) {
          const e = page.content[0];
          this.ultimoEvento.set({
            titulo: e.titulo,
            metodo: e.tipo === 'toma'
              ? (e.meta && e.meta['confirmador'] ? String(e.meta['confirmador']) : 'Sistema')
              : (e.tipo === 'actividad_iot' && e.meta && e.meta['tipoDispositivo'] ? String(e.meta['tipoDispositivo']).replace('_', ' ') : 'Sistema'),
            hora: this.formatearTiempoRelativo(e.fechaHora)
          });
        } else {
          this.ultimoEvento.set(null);
        }
      }
    });

    // 3. Cargar últimas observaciones del cuidador
    this.observacionSvc.listarPorAdulto(idAdulto).subscribe({
      next: (obs) => {
        this.observaciones = obs
          .slice(0, 2)
          .map(o => ({
            cuidador: o.cuidadorNombre,
            initials: o.cuidadorNombre.split(' ').map(p => p.charAt(0)).join('').toUpperCase().slice(0, 2),
            hora: this.formatearTiempoRelativo(o.fechaHora),
            texto: o.texto
          }));
      }
    });

    // 4. Cargar resumen inteligente de alertas del día
    this.cargarResumenAlertasIA(idAdulto);

    this.loading.set(false);
  }

  private cargarResumenAlertasIA(idAdulto: number): void {
    this.loadingResumenIA.set(true);
    this.resumenAlertasIA.set(null);
    this.aiSvc.getResumenAlertas(idAdulto).subscribe({
      next: (resumen) => {
        this.resumenAlertasIA.set(resumen);
        this.loadingResumenIA.set(false);
      },
      error: () => {
        this.loadingResumenIA.set(false);
      }
    });
  }

  marcarResuelta(id: number): void {
    this.alertaSvc.resolver(id, 'Resuelta desde dashboard').subscribe({
      next: () => {
        this.alertas.update(list => list.map(a => a.id === id ? { ...a, resuelta: true } : a));
        this.showToast('Alerta marcada como resuelta');
      }
    });
  }

  private showToast(msg: string): void {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(null), 3500);
  }

  private formatearTiempoRelativo(fechaStr: string): string {
    if (!fechaStr) return '';
    try {
      const date = new Date(fechaStr);
      const diffMs = new Date().getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 60) return `Hace ${diffMins} min`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `Hace ${diffHours} horas`;
      return date.toLocaleDateString();
    } catch (e) {
      return '';
    }
  }
}
