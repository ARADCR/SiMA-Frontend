import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
export class DashboardCuidadorComponent {
  readonly fechaHoy = new Date().toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  pacientes = signal<Paciente[]>([
    { id: 1, nombre: 'Elena Rodríguez', edad: 78, initials: 'ER', condiciones: ['Diabetes', 'Hipertensión'],
      tomasHoy: 2, tomasTotal: 4, proximaToma: '14:00', proximaMed: 'Metformina', estado: 'estable' },
    { id: 2, nombre: 'José Martínez', edad: 82, initials: 'JM', condiciones: ['Hipertensión'],
      tomasHoy: 1, tomasTotal: 3, proximaToma: '15:30', proximaMed: 'Enalapril', estado: 'atencion' },
    { id: 3, nombre: 'Rosa Pérez', edad: 75, initials: 'RP', condiciones: ['Gastritis'],
      tomasHoy: 0, tomasTotal: 2, proximaToma: '16:00', proximaMed: 'Omeprazol', estado: 'estable' },
    { id: 4, nombre: 'Luis García', edad: 80, initials: 'LG', condiciones: ['Cardiopatía'],
      tomasHoy: 0, tomasTotal: 3, proximaToma: '13:30', proximaMed: 'Losartán', estado: 'critico' },
  ]);

  observacionesRecientes = signal<Observacion[]>([
    { id: 1, paciente: 'Elena Rodríguez', initials: 'ER', color: '#2E86AB',
      texto: 'La señora Elena desayunó bien y caminó por el jardín durante 20 minutos. Buen ánimo general.', hora: '11:45 AM' },
    { id: 2, paciente: 'José Martínez', initials: 'JM', color: '#52B788',
      texto: 'Presión arterial matutina: 130/85. Dentro de rango esperado para su condición.', hora: '08:30 AM' },
  ]);

  diasCompliance: DiaCompliance[] = [
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
