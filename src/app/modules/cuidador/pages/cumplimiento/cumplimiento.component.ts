import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface DiaCumplimiento {
  fecha: string;
  estado: 'completada' | 'omitida' | 'sin-datos';
}

interface PacienteCumplimiento {
  id: number;
  nombre: string;
  initials: string;
  color: string;
  porcentaje: number;
  diasSemana: DiaCumplimiento[];
  semanas: number[];
}

@Component({
  selector: 'app-cumplimiento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cumplimiento.component.html',
  styleUrls: ['./cumplimiento.component.scss']
})
export class CumplimientoComponent {
  fechaInicio = '2026-06-22';
  fechaFin = '2026-06-28';

  diasLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  semanasLabels = ['Sem 23', 'Sem 24', 'Sem 25', 'Sem 26'];

  pacientes = signal<PacienteCumplimiento[]>([
    {
      id: 1, nombre: 'Elena Rodríguez', initials: 'ER', color: '#2E86AB', porcentaje: 87,
      diasSemana: [
        { fecha: 'Lun', estado: 'completada' },
        { fecha: 'Mar', estado: 'completada' },
        { fecha: 'Mié', estado: 'omitida' },
        { fecha: 'Jue', estado: 'completada' },
        { fecha: 'Vie', estado: 'completada' },
        { fecha: 'Sáb', estado: 'completada' },
        { fecha: 'Dom', estado: 'sin-datos' },
      ],
      semanas: [95, 100, 75, 87]
    },
    {
      id: 2, nombre: 'José Martínez', initials: 'JM', color: '#52B788', porcentaje: 92,
      diasSemana: [
        { fecha: 'Lun', estado: 'completada' },
        { fecha: 'Mar', estado: 'completada' },
        { fecha: 'Mié', estado: 'completada' },
        { fecha: 'Jue', estado: 'omitida' },
        { fecha: 'Vie', estado: 'completada' },
        { fecha: 'Sáb', estado: 'completada' },
        { fecha: 'Dom', estado: 'completada' },
      ],
      semanas: [88, 92, 96, 92]
    },
    {
      id: 3, nombre: 'Rosa Pérez', initials: 'RP', color: '#E76F51', porcentaje: 68,
      diasSemana: [
        { fecha: 'Lun', estado: 'completada' },
        { fecha: 'Mar', estado: 'omitida' },
        { fecha: 'Mié', estado: 'omitida' },
        { fecha: 'Jue', estado: 'completada' },
        { fecha: 'Vie', estado: 'completada' },
        { fecha: 'Sáb', estado: 'omitida' },
        { fecha: 'Dom', estado: 'sin-datos' },
      ],
      semanas: [70, 65, 72, 68]
    },
    {
      id: 4, nombre: 'Luis García', initials: 'LG', color: '#F4A261', porcentaje: 75,
      diasSemana: [
        { fecha: 'Lun', estado: 'completada' },
        { fecha: 'Mar', estado: 'completada' },
        { fecha: 'Mié', estado: 'omitida' },
        { fecha: 'Jue', estado: 'completada' },
        { fecha: 'Vie', estado: 'omitida' },
        { fecha: 'Sáb', estado: 'completada' },
        { fecha: 'Dom', estado: 'sin-datos' },
      ],
      semanas: [80, 78, 70, 75]
    },
  ]);

  promedioGeneral = computed(() => {
    const list = this.pacientes();
    return Math.round(list.reduce((s, p) => s + p.porcentaje, 0) / list.length);
  });

  totalCompletadas = computed(() =>
    this.pacientes().reduce((s, p) =>
      s + p.diasSemana.filter(d => d.estado === 'completada').length, 0)
  );

  totalOmitidas = computed(() =>
    this.pacientes().reduce((s, p) =>
      s + p.diasSemana.filter(d => d.estado === 'omitida').length, 0)
  );

  diasConCienPorciento = computed(() =>
    this.pacientes().filter(p => p.porcentaje === 100).length
  );

  dotClass(estado: string): string {
    return estado === 'completada' ? 'dot dot-green'
      : estado === 'omitida' ? 'dot dot-red'
      : 'dot dot-gray';
  }

  semanaColor(pct: number): string {
    return pct >= 90 ? '#1A7A4A' : pct >= 70 ? '#B47B12' : '#C0452A';
  }

  semanaBackground(pct: number): string {
    return pct >= 90 ? '#D8F3DC' : pct >= 70 ? '#FEF3E2' : '#FDE8E0';
  }

  porcentajeBarColor(pct: number): string {
    return pct >= 90 ? '#52B788' : pct >= 70 ? '#F4A261' : '#E76F51';
  }
}
