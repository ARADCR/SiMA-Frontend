import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Evento { id: number; fecha: string; hora: string; tipo: string; descripcion: string; metodo: string; }
interface DiaSemana { dia: string; fecha: string; pct: number; }

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.scss']
})
export class HistorialComponent {
  tipoActivo = signal('todos');

  tipoPills = [
    { label: 'Todos',         value: 'todos' },
    { label: 'Tomas',         value: 'toma' },
    { label: 'Alertas',       value: 'alerta' },
    { label: 'Observaciones', value: 'observacion' },
    { label: 'IoT',           value: 'iot' },
  ];

  diasSemana: DiaSemana[] = [
    { dia: 'Lun', fecha: '23 Jun', pct: 100 },
    { dia: 'Mar', fecha: '24 Jun', pct: 80 },
    { dia: 'Mié', fecha: '25 Jun', pct: 100 },
    { dia: 'Jue', fecha: '26 Jun', pct: 60 },
    { dia: 'Vie', fecha: '27 Jun', pct: 100 },
    { dia: 'Sáb', fecha: '28 Jun', pct: 100 },
    { dia: 'Dom', fecha: '29 Jun', pct: 80 },
  ];

  eventos: Evento[] = [
    { id: 1,  fecha: '29/06/2026', hora: '08:02', tipo: 'toma',        descripcion: 'Metformina 500mg tomada — Compartimento 1',    metodo: 'Pastillero IoT' },
    { id: 2,  fecha: '29/06/2026', hora: '08:03', tipo: 'toma',        descripcion: 'Atorvastatina 20mg tomada — Compartimento 4',  metodo: 'Pastillero IoT' },
    { id: 3,  fecha: '29/06/2026', hora: '09:00', tipo: 'iot',         descripcion: 'Medición: BPM 72 · SpO₂ 98.2% · Temp 36.5°C', metodo: 'Pulsera BLE' },
    { id: 4,  fecha: '28/06/2026', hora: '12:30', tipo: 'alerta',      descripcion: 'Toma omitida — Vitamina D 12:00',              metodo: 'Sistema' },
    { id: 5,  fecha: '28/06/2026', hora: '14:00', tipo: 'toma',        descripcion: 'Metformina 500mg tomada',                      metodo: 'Manual' },
    { id: 6,  fecha: '27/06/2026', hora: '10:15', tipo: 'observacion', descripcion: 'Sin eventos adversos. Buen día.',              metodo: 'Cuidador' },
    { id: 7,  fecha: '26/06/2026', hora: '08:00', tipo: 'toma',        descripcion: 'Enalapril 5mg tomada',                         metodo: 'Pastillero IoT' },
    { id: 8,  fecha: '26/06/2026', hora: '11:00', tipo: 'alerta',      descripcion: 'Frecuencia cardíaca elevada: 102 BPM',         metodo: 'Pulsera BLE' },
  ];

  eventosFiltrados = computed(() => {
    const tipo = this.tipoActivo();
    if (tipo === 'todos') return this.eventos;
    return this.eventos.filter(e => e.tipo === tipo);
  });

  cumplimientoTotal = computed(() => {
    const total = this.diasSemana.reduce((acc, d) => acc + d.pct, 0);
    return Math.round(total / this.diasSemana.length);
  });

  circleClass(pct: number): string {
    if (pct >= 90) return 'circle high';
    if (pct >= 60) return 'circle mid';
    return 'circle low';
  }

  tipoBadge(tipo: string): string {
    const map: Record<string, string> = {
      toma: 'badge badge-green',
      alerta: 'badge badge-red',
      observacion: 'badge badge-purple',
      iot: 'badge badge-blue',
    };
    return map[tipo] ?? 'badge badge-yellow';
  }
}
