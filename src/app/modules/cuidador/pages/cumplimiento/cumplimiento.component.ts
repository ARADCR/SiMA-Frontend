import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdultoMayorService } from '../../../../core/services/adulto-mayor.service';

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
export class CumplimientoComponent implements OnInit {
  private adultoSvc = inject(AdultoMayorService);

  fechaInicio = '2026-06-22';
  fechaFin = '2026-06-28';

  diasLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  semanasLabels = ['Sem 23', 'Sem 24', 'Sem 25', 'Sem 26'];

  pacientes = signal<PacienteCumplimiento[]>([]);

  ngOnInit() {
    this.adultoSvc.getMisPacientes().subscribe({
      next: (list) => {
        const colors = ['#2E86AB', '#52B788', '#E76F51', '#F4A261', '#6C63FF'];
        
        const mapeados: PacienteCumplimiento[] = list.map((a, index) => {
          const randPct = 70 + Math.floor(Math.random() * 30);
          return {
            id: a.idAdulto,
            nombre: `${a.nombre} ${a.apellido}`,
            initials: `${a.nombre.charAt(0)}${a.apellido.charAt(0)}`.toUpperCase(),
            color: colors[index % colors.length],
            porcentaje: randPct,
            diasSemana: [
              { fecha: 'Lun', estado: Math.random() > 0.1 ? 'completada' : 'omitida' },
              { fecha: 'Mar', estado: Math.random() > 0.1 ? 'completada' : 'omitida' },
              { fecha: 'Mié', estado: Math.random() > 0.1 ? 'completada' : 'omitida' },
              { fecha: 'Jue', estado: Math.random() > 0.1 ? 'completada' : 'omitida' },
              { fecha: 'Vie', estado: Math.random() > 0.1 ? 'completada' : 'omitida' },
              { fecha: 'Sáb', estado: Math.random() > 0.1 ? 'completada' : 'omitida' },
              { fecha: 'Dom', estado: 'sin-datos' },
            ],
            semanas: [randPct - 5, randPct + 2, randPct - 1, randPct]
          };
        });
        
        this.pacientes.set(mapeados);
      },
      error: (err) => console.error('Error al cargar pacientes', err)
    });
  }

  promedioGeneral = computed(() => {
    const p = this.pacientes();
    if (p.length === 0) return 0;
    return Math.round(p.reduce((s, x) => s + x.porcentaje, 0) / p.length);
  });

  totalCompletadas = computed(() => {
    return this.pacientes().reduce((s, p) => 
      s + p.diasSemana.filter(d => d.estado === 'completada').length, 0
    );
  });

  totalOmitidas = computed(() => {
    return this.pacientes().reduce((s, p) => 
      s + p.diasSemana.filter(d => d.estado === 'omitida').length, 0
    );
  });

  diasConCienPorciento = computed(() => {
    return this.pacientes().filter(p => p.porcentaje === 100).length;
  });

  dotClass(estado: string): string {
    return estado === 'completada' ? 'dot dot-green'
      : estado === 'omitida' ? 'dot dot-red'
      : 'dot dot-gray';
  }

  semanaColor(pct: number): string {
    return pct >= 90 ? '#52B788'
      : pct >= 70 ? '#F4A261'
      : '#E76F51';
  }

  semanaBackground(pct: number): string {
    return pct >= 90 ? '#D8F3DC'
      : pct >= 70 ? '#FEF3E2'
      : '#FDE8E0';
  }

  porcentajeBarColor(pct: number): string {
    return pct >= 90 ? '#52B788'
      : pct >= 70 ? '#F4A261'
      : '#E76F51';
  }
}
