import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MedicamentoService } from '../../../../core/services/medicamento.service';
import { AuthService }        from '../../../../core/auth/auth.service';
import { Toma, EstadoToma }   from '../../../../core/models/medicamento.model';
import { environment } from '../../../../../environments/environment';

interface TomaAgrupada {
  hora: string;     // "08:00"
  tomas: Toma[];
}

@Component({
  selector: 'app-recordatorios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recordatorios.component.html',
  styleUrl:    './recordatorios.component.scss',
  providers: [DatePipe]
})
export class RecordatoriosComponent implements OnInit {
  private medSvc  = inject(MedicamentoService);
  private auth    = inject(AuthService);
  private datePipe = inject(DatePipe);
  private http    = inject(HttpClient);

  tomas        = signal<Toma[]>([]);
  loading      = signal(true);
  error        = signal<string | null>(null);
  toast        = signal<{ msg: string; type: 'success' | 'error' } | null>(null);
  confirmando  = signal<number | null>(null);   // id de toma que se está confirmando

  fechaHoy = new Date();

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.loading.set(true);
    const userId = this.auth.usuarioActual?.userId;
    if (!userId) { this.loading.set(false); return; }

    // Si el usuario es Adulto Mayor, primero obtener su idAdulto via /adultos/mi-perfil
    if (this.auth.rolActual === 'Adulto Mayor') {
      this.http.get<any>(`${environment.apiUrl}/adultos/mi-perfil`).subscribe({
        next: resp => {
          const idAdulto = resp?.data?.idAdulto;
          if (idAdulto) {
            this.cargarTomas(idAdulto);
          } else {
            this.error.set('No se encontró tu perfil de adulto mayor.');
            this.loading.set(false);
          }
        },
        error: () => {
          this.error.set('Error al obtener tu perfil.');
          this.loading.set(false);
        }
      });
    } else {
      // Para Familiar/Cuidador se usa el userId directamente
      this.cargarTomas(userId);
    }
  }

  private cargarTomas(idAdulto: number): void {
    const hoy = new Date().toISOString().substring(0, 10);
    this.medSvc.getTomas(idAdulto, hoy).subscribe({
      next: t  => { this.tomas.set(t ?? []); this.loading.set(false); },
      error: e => { this.error.set(e.mensaje ?? 'Error al cargar recordatorios'); this.loading.set(false); }
    });
  }

  // ─── Computed ─────────────────────────────────────────────────────────────
  tomasAgrupadas = computed((): TomaAgrupada[] => {
    const grupos = new Map<string, Toma[]>();
    this.tomas().forEach(t => {
      const hora = t.fechaHoraProgramada
        ? new Date(t.fechaHoraProgramada).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
        : '--:--';
      if (!grupos.has(hora)) grupos.set(hora, []);
      grupos.get(hora)!.push(t);
    });
    return Array.from(grupos.entries())
      .map(([hora, tomas]) => ({ hora, tomas }))
      .sort((a, b) => a.hora.localeCompare(b.hora));
  });

  stats = computed(() => {
    const all = this.tomas();
    return {
      total:    all.length,
      tomadas:  all.filter(t => t.estado === 'tomado').length,
      pendientes: all.filter(t => t.estado === 'pendiente').length,
      omitidas:   all.filter(t => t.estado === 'omitido').length,
      progreso:   all.length ? Math.round((all.filter(t => t.estado === 'tomado').length / all.length) * 100) : 0,
    };
  });

  proximaToma = computed((): Toma | null => {
    const ahora = new Date();
    return this.tomas()
      .filter(t => t.estado === 'pendiente' && t.fechaHoraProgramada && new Date(t.fechaHoraProgramada) >= ahora)
      .sort((a, b) => new Date(a.fechaHoraProgramada!).getTime() - new Date(b.fechaHoraProgramada!).getTime())[0] ?? null;
  });

  // ─── Acciones ─────────────────────────────────────────────────────────────
  confirmarToma(toma: Toma): void {
    this.confirmando.set(toma.id);
    this.medSvc.registrarToma(toma.id, {
      estado: 'tomado',
      fechaHoraReal: new Date().toISOString()
    }).subscribe({
      next: updated => {
        this.tomas.update(all => all.map(t => t.id === updated.id ? updated : t));
        this.confirmando.set(null);
        this.showToast('Toma confirmada correctamente', 'success');
      },
      error: e => {
        this.confirmando.set(null);
        this.showToast(e.mensaje ?? 'Error al confirmar', 'error');
      }
    });
  }

  omitirToma(toma: Toma): void {
    this.medSvc.registrarToma(toma.id, { estado: 'omitido' }).subscribe({
      next: updated => {
        this.tomas.update(all => all.map(t => t.id === updated.id ? updated : t));
        this.showToast('Toma marcada como omitida', 'success');
      },
      error: e => this.showToast(e.mensaje ?? 'Error', 'error')
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  private showToast(msg: string, type: 'success' | 'error'): void {
    this.toast.set({ msg, type });
    setTimeout(() => this.toast.set(null), 4000);
  }

  estadoClass(estado: EstadoToma): string {
    return { tomado: 'success', pendiente: 'pending', omitido: 'danger', retrasado: 'warning' }[estado] ?? '';
  }

  estadoLabel(estado: EstadoToma): string {
    return { tomado: 'Tomado', pendiente: 'Pendiente', omitido: 'Omitido', retrasado: 'Retrasado' }[estado] ?? estado;
  }

  isPendiente(t: Toma): boolean { return t.estado === 'pendiente' || t.estado === 'retrasado'; }

  minutosHastaProxima(toma: Toma | null): string {
    if (!toma?.fechaHoraProgramada) return '';
    const diff = new Date(toma.fechaHoraProgramada).getTime() - Date.now();
    const mins = Math.round(diff / 60000);
    if (mins < 0)  return 'Hace ' + Math.abs(mins) + ' min';
    if (mins < 60) return 'En ' + mins + ' min';
    return 'En ' + Math.round(mins / 60) + ' h';
  }

  nombreUsuario(): string {
    return this.auth.usuarioActual?.nombre ?? 'Usuario';
  }
}
