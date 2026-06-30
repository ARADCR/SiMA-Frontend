import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface SemanaOption { label: string; value: string; }
interface MetricaSemana { nombre: string; valor: string; cambio: number; icon: string; color: string; bg: string; }
interface DiaDato { dia: string; tomas: number; omisiones: number; }

@Component({
  selector: 'app-reportes-semanales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes-semanales.component.html',
  styleUrls: ['./reportes-semanales.component.scss']
})
export class ReportesSemanalesComponent {
  Math = Math;
  adultoSel = 'Elena Rodríguez';
  semanaActiva = signal('Sem 26');
  toast = signal<string | null>(null);

  semanas: SemanaOption[] = [
    { label: 'Sem 23', value: 'Sem 23' },
    { label: 'Sem 24', value: 'Sem 24' },
    { label: 'Sem 25', value: 'Sem 25' },
    { label: 'Sem 26', value: 'Sem 26' },
  ];

  metricas: MetricaSemana[] = [
    { nombre: 'Cumplimiento',   valor: '91%',    cambio:  4,  icon: '💊', color: '#1A7A4A', bg: '#D8F3DC' },
    { nombre: 'Tomas totales',  valor: '49',     cambio:  2,  icon: '📋', color: '#1E5F7A', bg: '#EBF5FB' },
    { nombre: 'Alertas',        valor: '2',      cambio: -3,  icon: '🔔', color: '#C0452A', bg: '#FDE8E0' },
    { nombre: 'Frec. cardíaca', valor: '70 bpm', cambio:  1,  icon: '❤️', color: '#1A7A4A', bg: '#D8F3DC' },
  ];

  chartData: DiaDato[] = [
    { dia: 'Lun', tomas: 5, omisiones: 0 },
    { dia: 'Mar', tomas: 4, omisiones: 1 },
    { dia: 'Mié', tomas: 5, omisiones: 0 },
    { dia: 'Jue', tomas: 3, omisiones: 2 },
    { dia: 'Vie', tomas: 5, omisiones: 0 },
    { dia: 'Sáb', tomas: 5, omisiones: 0 },
    { dia: 'Dom', tomas: 4, omisiones: 1 },
  ];

  cumplimientoSemana = computed(() => {
    const total = this.chartData.reduce((acc, d) => acc + d.tomas + d.omisiones, 0);
    const tomas = this.chartData.reduce((acc, d) => acc + d.tomas, 0);
    return Math.round((tomas / total) * 100);
  });

  iaResumen = computed(() =>
    this.semanaActiva() === 'Sem 26'
      ? 'Elena Rodríguez muestra una semana de alta estabilidad con un cumplimiento del 91% en la toma de medicamentos. Su ritmo cardíaco se mantuvo en rangos normales (68-76 bpm) y no se registraron caídas. Las 2 omisiones detectadas corresponden al jueves, posiblemente relacionadas con la visita médica de ese día.'
      : `Durante la ${this.semanaActiva()}, el estado general de Elena Rodríguez fue estable. Los indicadores vitales se mantuvieron dentro de los parámetros esperados para su perfil de salud.`
  );

  iaObservaciones = computed(() => [
    'Jueves: 2 tomas omitidas (Metformina 14:00 y Vitamina D 12:00).',
    'Ritmo cardíaco promedio: 70 bpm — estable durante toda la semana.',
    'Pastillero IoT sincronizado correctamente los 7 días.',
    'Sin eventos de caída registrados por la pulsera.',
  ]);

  iaRecomendaciones = computed(() => [
    'Verificar con el médico si las omisiones del jueves requieren ajuste de dosis.',
    'Mantener el horario actual de medicamentos — los resultados son positivos.',
    'Próxima revisión cardiovascular recomendada en 3 semanas.',
  ]);

  semanaAnterior(): void {
    const idx = this.semanas.findIndex(s => s.value === this.semanaActiva());
    if (idx > 0) this.semanaActiva.set(this.semanas[idx - 1].value);
  }

  semanaSiguiente(): void {
    const idx = this.semanas.findIndex(s => s.value === this.semanaActiva());
    if (idx < this.semanas.length - 1) this.semanaActiva.set(this.semanas[idx + 1].value);
  }

  compartir(): void { this.showToast('Reporte compartido con el médico tratante por correo'); }
  descargar(): void { this.showToast('Descargando reporte PDF...'); }

  private showToast(msg: string): void {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(null), 3500);
  }
}
