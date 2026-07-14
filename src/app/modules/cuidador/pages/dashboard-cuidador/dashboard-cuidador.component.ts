import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdultoMayorService } from '../../../../core/services/adulto-mayor.service';
import { ObservacionService } from '../../../../core/services/observacion.service';

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

@Component({
  selector: 'app-dashboard-cuidador',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-cuidador.component.html',
  styleUrls: ['./dashboard-cuidador.component.scss']
})
export class DashboardCuidadorComponent implements OnInit {
  private adultoService = inject(AdultoMayorService);
  private observacionService = inject(ObservacionService);

  readonly fechaHoy = new Date().toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  pacientes = signal<Paciente[]>([]);

  ngOnInit() {
    this.cargarPacientes();
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
            estado: 'estable' as const
          };
        });
        this.pacientes.set(mapeados);

        if (adultos.length > 0) {
          import('rxjs').then(({ forkJoin }) => {
            forkJoin(adultos.map(a => this.observacionService.listarPorAdulto(a.idAdulto))).subscribe({
              next: (resultados) => {
                const todas = resultados.flat() as any[];
                const obsNuevas: Observacion[] = todas.map(o => {
                  const pacienteObj = mapeados.find(m => m.id === o.idAdulto);
                  return {
                    id: o.idObservacion,
                    paciente: pacienteObj ? pacienteObj.nombre : (o.adultoNombre || 'Desconocido'),
                    initials: pacienteObj ? pacienteObj.initials : '',
                    color: this.avatarColor(o.idAdulto),
                    texto: o.texto,
                    hora: this.formatearTiempoRelativo(o.fechaHora)
                  };
                });
                this.observacionesRecientes.set(obsNuevas.slice(0, 5)); // Mostrar solo las 5 más recientes
              }
            });
          });
        }
      },
      error: (err) => console.error('Error al cargar pacientes asignados', err)
    });
  }

  formatearTiempoRelativo(fechaStr: string): string {
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

  calcularEdad(fecha: string): number {
    if (!fecha) return 0;
    const diff = Date.now() - new Date(fecha).getTime();
    return Math.abs(Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)));
  }

  observacionesRecientes = signal<Observacion[]>([]);

  diasCompliance = [
    { label: 'Lun', pct: '95%', bg: '#D8F3DC', color: '#52B788' },
    { label: 'Mar', pct: '100%', bg: '#D8F3DC', color: '#52B788' },
    { label: 'Mié', pct: '75%', bg: '#FEF3E2', color: '#F4A261' },
    { label: 'Jue', pct: '88%', bg: '#D8F3DC', color: '#52B788' },
    { label: 'Vie', pct: '100%', bg: '#D8F3DC', color: '#52B788' },
    { label: 'Sáb', pct: '50%', bg: '#FDE8E0', color: '#E76F51' },
    { label: 'Dom', pct: '—', bg: '#F0F4F8', color: '#9CABB8' },
  ];

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
