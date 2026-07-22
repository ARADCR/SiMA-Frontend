import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdultoMayorService } from '../../../../core/services/adulto-mayor.service';
import { AiService, BriefingIAResponse, PrioridadPaciente } from '../../../../core/services/ai.service';
import { RegistroTomaService } from '../../../../core/services/registro-toma.service';
import { AlertaService } from '../../../../core/services/alerta.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface Paciente {
  id: number; nombre: string; edad: number; initials: string;
  condiciones: string[]; tomasHoy: number; tomasTotal: number;
  proximaToma: string; proximaMed: string;
  estado: 'estable' | 'atencion' | 'critico';
}

interface Observacion {
  id: number; paciente: string; initials: string; color: string;
  texto: string; hora: string;
}

interface DiaCompliance {
  label: string; pct: string; bg: string; color: string;
}

const PRIORIDAD_ICONO: Record<PrioridadPaciente, string> = {
  alta: '🔴',
  media: '🟡',
  baja: '🟢',
};

const PRIORIDAD_PESO: Record<PrioridadPaciente, number> = {
  alta: 0,
  media: 1,
  baja: 2,
};

@Component({
  selector: 'app-dashboard-cuidador',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-cuidador.component.html',
  styleUrls: ['./dashboard-cuidador.component.scss']
})
export class DashboardCuidadorComponent implements OnInit {
  private adultoService = inject(AdultoMayorService);
  private aiService = inject(AiService);
  private registroTomaService = inject(RegistroTomaService);
  private alertaService = inject(AlertaService);

  readonly fechaHoy = new Date().toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  pacientes = signal<Paciente[]>([]);

  // HU-25: briefing diario inteligente
  briefing = signal<BriefingIAResponse | null>(null);
  briefingCargando = signal(false);
  briefingError = signal(false);

  alertasPendientes = signal<number>(0);

  ngOnInit() {
    this.cargarPacientes();
    this.cargarBriefing();
    this.cargarAlertas();
  }

  cargarAlertas() {
    this.alertaService.getContadorActivas().subscribe({
      next: (count) => this.alertasPendientes.set(count),
      error: (err) => console.error('Error al cargar contador de alertas', err)
    });
  }

  cargarBriefing() {
    this.briefingCargando.set(true);
    this.briefingError.set(false);
    this.aiService.getBriefing().subscribe({
      next: (data) => {
        const ordenado = this.ordenarPorPrioridad(data);
        this.briefing.set(ordenado);
        this.briefingCargando.set(false);
        this.actualizarEstadosPacientes(ordenado);
      },
      error: (err) => {
        console.error('Error al cargar el briefing IA', err);
        this.briefingError.set(true);
        this.briefingCargando.set(false);
      }
    });
  }

  refrescarBriefing() {
    this.briefingCargando.set(true);
    this.briefingError.set(false);
    this.aiService.refreshBriefing().subscribe({
      next: (data) => {
        const ordenado = this.ordenarPorPrioridad(data);
        this.briefing.set(ordenado);
        this.briefingCargando.set(false);
        this.actualizarEstadosPacientes(ordenado);
      },
      error: (err) => {
        console.error('Error al refrescar el briefing IA', err);
        this.briefingError.set(true);
        this.briefingCargando.set(false);
      }
    });
  }

  private ordenarPorPrioridad(data: BriefingIAResponse): BriefingIAResponse {
    return {
      ...data,
      pacientes: [...(data.pacientes ?? [])].sort(
        (a, b) => PRIORIDAD_PESO[a.prioridad] - PRIORIDAD_PESO[b.prioridad]
      )
    };
  }

  actualizarEstadosPacientes(data: BriefingIAResponse) {
    const current = this.pacientes();
    if (current.length === 0) return;

    const actualizados = current.map(p => {
      const bp = data.pacientes.find(b => b.idAdulto === p.id);
      const estado = bp ? (bp.prioridad === 'alta' ? 'critico' : bp.prioridad === 'media' ? 'atencion' : 'estable') : p.estado;
      return { ...p, estado };
    });
    this.pacientes.set(actualizados);
  }

  prioridadIcono(prioridad: PrioridadPaciente): string {
    return PRIORIDAD_ICONO[prioridad] ?? '⚪';
  }

  cargarPacientes() {
    this.adultoService.getMisPacientes().subscribe({
      next: (adultos) => {
        const mapeados = adultos.map(a => {
          const edadCalc = a.edad || this.calcularEdad(a.fechaNacimiento);
          return {
            id: a.idAdulto,
            nombre: `${a.nombre} ${a.apellido}`,
            edad: edadCalc,
            initials: `${a.nombre.charAt(0)}${a.apellido.charAt(0)}`.toUpperCase(),
            condiciones: a.condicionesMedicas ? a.condicionesMedicas.split(',').map(s=>s.trim()) : ['Sin registrar'],
            tomasHoy: 0,
            tomasTotal: 0,
            proximaToma: '--:--',
            proximaMed: 'N/A',
            estado: 'estable' as 'estable' | 'atencion' | 'critico'
          };
        });
        
        if (mapeados.length === 0) {
          this.pacientes.set([]);
          return;
        }

        const tomasObs = mapeados.map(p => 
          this.registroTomaService.getTomasDelDia(p.id).pipe(
            catchError(() => of([]))
          )
        );

        forkJoin(tomasObs).subscribe(resultadosTomas => {
          resultadosTomas.forEach((tomas, index) => {
            const p = mapeados[index];
            p.tomasTotal = tomas.length;
            p.tomasHoy = tomas.filter(t => t.estado === 'tomado' || t.estado === 'confirmado_manual').length;
            
            const proximas = tomas.filter(t => t.estado === 'pendiente')
                                  .sort((a, b) => new Date(a.fechaHoraProgramada).getTime() - new Date(b.fechaHoraProgramada).getTime());
            if (proximas.length > 0) {
              const prox = proximas[0];
              p.proximaToma = prox.horario.horaProgramada.substring(0, 5);
              p.proximaMed = prox.horario.medicamento.nombre;
            }
          });
          
          this.pacientes.set(mapeados);
          // Apply briefing states if briefing is already loaded
          if (this.briefing()) {
            this.actualizarEstadosPacientes(this.briefing()!);
          }
        });
      },
      error: (err) => console.error('Error al cargar pacientes asignados', err)
    });
  }

  calcularEdad(fecha: string): number {
    if (!fecha) return 0;
    const diff = Date.now() - new Date(fecha).getTime();
    return Math.abs(Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)));
  }

  // HU-25: "Últimas observaciones" y "Cumplimiento" ahora se derivan del briefing IA
  // (antes: observaciones con Math.random() y compliance hardcodeado por día).
  observacionesRecientes = computed<Observacion[]>(() => {
    const pacientes = this.briefing()?.pacientes ?? [];
    return pacientes.map((p, idx) => ({
      id: p.idAdulto,
      paciente: p.nombre,
      initials: this.iniciales(p.nombre),
      color: this.avatarColor(idx + 1),
      texto: p.resumen,
      hora: p.proximaToma
    }));
  });

  diasCompliance = computed<DiaCompliance[]>(() => {
    const pacientes = this.briefing()?.pacientes ?? [];
    return pacientes.map(p => ({
      label: p.nombre.split(' ')[0],
      pct: `${Math.round(p.adherenciaSemana)}%`,
      ...this.complianceColores(p.adherenciaSemana)
    }));
  });

  private complianceColores(pct: number): { bg: string; color: string } {
    if (pct >= 85) return { bg: '#D8F3DC', color: '#52B788' };
    if (pct >= 60) return { bg: '#FEF3E2', color: '#F4A261' };
    return { bg: '#FDE8E0', color: '#E76F51' };
  }

  private iniciales(nombreCompleto: string): string {
    const partes = nombreCompleto.trim().split(/\s+/);
    const primeras = partes.slice(0, 2).map(p => p.charAt(0));
    return primeras.join('').toUpperCase() || '?';
  }

  totalTomas = computed(() => this.pacientes().reduce((s, p) => s + p.tomasTotal, 0));
  tomasHoy = computed(() => this.pacientes().reduce((s, p) => s + p.tomasHoy, 0));

  avatarColor(id: number): string {
    const colors = ['#2E86AB', '#52B788', '#E76F51', '#F4A261', '#6C63FF'];
    return colors[(id - 1) % colors.length];
  }

  estadoBadgeClass(estado: string): string {
    return estado === 'estable' ? 'badge badge-green'
      : estado === 'atencion' ? 'badge badge-yellow'
      : 'badge badge-red';
  }

  estadoLabel(estado: string): string {
    return estado === 'estable' ? 'Estable'
      : estado === 'atencion' ? 'Atención'
      : 'Crítico';
  }

  porcentajeTomas(p: Paciente): number {
    return p.tomasTotal > 0 ? (p.tomasHoy / p.tomasTotal) * 100 : 0;
  }
}
