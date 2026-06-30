import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Observacion {
  id: number; paciente: string; initials: string; color: string;
  texto: string; fecha: string; hora: string;
  urgencia: 'normal' | 'importante' | 'urgente';
  vitales?: { ta?: string; fc?: string; temp?: string };
}

@Component({
  selector: 'app-observaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './observaciones.component.html',
  styleUrls: ['./observaciones.component.scss']
})
export class ObservacionesComponent {
  busqueda = '';
  pacienteFiltro = '';
  urgenciaFiltro = '';
  modalOpen = signal(false);
  confirmDeleteId = signal<number | null>(null);
  toast = signal<string | null>(null);

  nuevaObs = {
    paciente: '',
    urgencia: 'normal' as 'normal' | 'importante' | 'urgente',
    texto: '',
    ta: '', fc: '', temp: ''
  };

  observaciones = signal<Observacion[]>([
    {
      id: 1, paciente: 'Elena Rodríguez', initials: 'ER', color: '#2E86AB',
      texto: 'Paciente presentó mareos leves después de la toma de Metformina. Se mantuvo sentada durante 20 minutos y mejoró. Se recomienda no levantarse bruscamente.',
      fecha: '28/06/2026', hora: '10:30', urgencia: 'importante',
      vitales: { ta: '130/85 mmHg', fc: '72 BPM', temp: '36.5°C' }
    },
    {
      id: 2, paciente: 'José Martínez', initials: 'JM', color: '#52B788',
      texto: 'Buen estado general. Comió bien. Refiere dolor leve en rodilla izquierda. Se aplicó crema analgésica.',
      fecha: '28/06/2026', hora: '08:15', urgencia: 'normal'
    },
    {
      id: 3, paciente: 'Rosa Pérez', initials: 'RP', color: '#E76F51',
      texto: 'Omitió toma de Omeprazol por náuseas. Se comunicó al familiar. Pendiente seguimiento a las 16:00.',
      fecha: '27/06/2026', hora: '20:00', urgencia: 'urgente'
    },
  ]);

  obsFiltradas = computed(() => {
    let list = this.observaciones();
    if (this.busqueda) {
      const q = this.busqueda.toLowerCase();
      list = list.filter(o => o.texto.toLowerCase().includes(q) || o.paciente.toLowerCase().includes(q));
    }
    if (this.pacienteFiltro) list = list.filter(o => o.paciente === this.pacienteFiltro);
    if (this.urgenciaFiltro) list = list.filter(o => o.urgencia === this.urgenciaFiltro);
    return list;
  });

  urgenciaBadgeClass(u: string): string { return `badge badge-${u}`; }
  urgenciaLabel(u: string): string {
    return u === 'normal' ? 'Normal' : u === 'importante' ? 'Importante' : 'Urgente';
  }

  hasVitales(obs: Observacion): boolean {
    return !!(obs.vitales && (obs.vitales.ta || obs.vitales.fc || obs.vitales.temp));
  }

  guardar(): void {
    if (!this.nuevaObs.paciente || !this.nuevaObs.texto.trim()) return;
    const colors: Record<string, string> = {
      'Elena Rodríguez': '#2E86AB', 'José Martínez': '#52B788',
      'Rosa Pérez': '#E76F51', 'Luis García': '#F4A261'
    };
    const inits = this.nuevaObs.paciente.split(' ').map(n => n[0]).join('').slice(0, 2);
    const vitales = (this.nuevaObs.ta || this.nuevaObs.fc || this.nuevaObs.temp)
      ? { ta: this.nuevaObs.ta || undefined, fc: this.nuevaObs.fc || undefined, temp: this.nuevaObs.temp || undefined }
      : undefined;
    this.observaciones.update(list => [{
      id: Date.now(), paciente: this.nuevaObs.paciente, initials: inits,
      color: colors[this.nuevaObs.paciente] || '#9CABB8',
      texto: this.nuevaObs.texto,
      fecha: new Date().toLocaleDateString('es-MX'),
      hora: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      urgencia: this.nuevaObs.urgencia,
      vitales
    }, ...list]);
    this.nuevaObs = { paciente: '', urgencia: 'normal', texto: '', ta: '', fc: '', temp: '' };
    this.modalOpen.set(false);
    this.showToast('Observación guardada correctamente');
  }

  solicitarEliminar(id: number): void {
    this.confirmDeleteId.set(id);
  }

  confirmarEliminar(): void {
    const id = this.confirmDeleteId();
    if (id !== null) {
      this.observaciones.update(list => list.filter(o => o.id !== id));
      this.showToast('Observación eliminada');
    }
    this.confirmDeleteId.set(null);
  }

  cerrarSiEsOverlay(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) {
      this.modalOpen.set(false);
      this.confirmDeleteId.set(null);
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
