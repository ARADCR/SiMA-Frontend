import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type TipoEvento = 'toma' | 'omision' | 'observacion' | 'alerta';

interface Evento {
  id: number; tipo: TipoEvento; paciente: string; initials: string; color: string;
  titulo: string; descripcion: string; fecha: string; hora: string;
}

interface GrupoEventos {
  fecha: string;
  eventos: Evento[];
}

@Component({
  selector: 'app-historial-cuidador',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historial-cuidador.component.html',
  styleUrls: ['./historial-cuidador.component.scss']
})
export class HistorialCuidadorComponent {
  pacienteFiltro = '';
  tipoFiltro = '';
  fechaInicio = '';
  fechaFin = '';

  eventos = signal<Evento[]>([
    { id: 1, tipo: 'toma', paciente: 'Elena Rodríguez', initials: 'ER', color: '#2E86AB',
      titulo: 'Toma de Metformina 500mg registrada', descripcion: 'Administrada correctamente. Paciente sin reacciones adversas.', fecha: '28/06/2026', hora: '08:05' },
    { id: 2, tipo: 'toma', paciente: 'José Martínez', initials: 'JM', color: '#52B788',
      titulo: 'Toma de Enalapril 10mg registrada', descripcion: 'Administrada. Tensión arterial previa: 130/85 mmHg.', fecha: '28/06/2026', hora: '09:10' },
    { id: 3, tipo: 'omision', paciente: 'Rosa Pérez', initials: 'RP', color: '#E76F51',
      titulo: 'Omisión de Omeprazol 20mg', descripcion: 'Paciente refiere náuseas. Se notificó al familiar.', fecha: '28/06/2026', hora: '09:35' },
    { id: 4, tipo: 'observacion', paciente: 'Elena Rodríguez', initials: 'ER', color: '#2E86AB',
      titulo: 'Observación registrada', descripcion: 'Mareos leves post-Metformina. Mejoró tras 20 min en reposo.', fecha: '28/06/2026', hora: '10:30' },
    { id: 5, tipo: 'alerta', paciente: 'Luis García', initials: 'LG', color: '#F4A261',
      titulo: 'Alerta de ritmo cardíaco elevado', descripcion: 'Pulsera detectó 110 BPM durante 15 minutos. Se verificó presencia y se tomaron signos.', fecha: '27/06/2026', hora: '20:45' },
    { id: 6, tipo: 'toma', paciente: 'Luis García', initials: 'LG', color: '#F4A261',
      titulo: 'Toma de Losartán 50mg registrada', descripcion: 'Administrada correctamente a la hora indicada.', fecha: '27/06/2026', hora: '21:00' },
    { id: 7, tipo: 'observacion', paciente: 'Rosa Pérez', initials: 'RP', color: '#E76F51',
      titulo: 'Observación de seguimiento', descripcion: 'Paciente más tranquila por la tarde. Come mejor. Se suspendió aviso al familiar.', fecha: '27/06/2026', hora: '16:00' },
  ]);

  eventosAgrupados = computed((): GrupoEventos[] => {
    let evs = this.eventos();
    if (this.pacienteFiltro) evs = evs.filter(e => e.paciente === this.pacienteFiltro);
    if (this.tipoFiltro) evs = evs.filter(e => e.tipo === this.tipoFiltro);
    const grupos: GrupoEventos[] = [];
    for (const ev of evs) {
      const g = grupos.find(x => x.fecha === ev.fecha);
      if (g) g.eventos.push(ev);
      else grupos.push({ fecha: ev.fecha, eventos: [ev] });
    }
    return grupos;
  });

  resetFiltros(): void {
    this.pacienteFiltro = '';
    this.tipoFiltro = '';
    this.fechaInicio = '';
    this.fechaFin = '';
  }

  tipoBadgeClass(t: TipoEvento): string { return `badge badge-${t}`; }
  tipoLabel(t: TipoEvento): string {
    return { toma: 'Toma', omision: 'Omisión', observacion: 'Observación', alerta: 'Alerta' }[t];
  }
}
