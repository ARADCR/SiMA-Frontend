import { Component, signal, OnInit, OnDestroy, inject, HostListener } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertaService } from '../../../../core/services/alerta.service';
import { AdultoMayorService } from '../../../../core/services/adulto-mayor.service';
import { LecturaPulseraService } from '../../../../core/services/lectura-pulsera.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { AdultoMayor } from '../../../../core/models/adulto-mayor.model';
import { LecturaPulsera } from '../../../../core/models/lectura-pulsera.model';
import { Subscription, interval, forkJoin } from 'rxjs';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface Evento { id: number; tipo: string; descripcion: string; hora: string; dispositivo: string; }

@Component({
  selector: 'app-actividad-iot',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './actividad-iot.component.html',
  styleUrls: ['./actividad-iot.component.scss']
})
export class ActividadIotComponent implements OnInit, OnDestroy {
  private alertaService = inject(AlertaService);
  private adultoService = inject(AdultoMayorService);
  private lecturaService = inject(LecturaPulseraService);
  private authService = inject(AuthService);
  private subs: Subscription = new Subscription();

  // ─── Adultos mayores ────────────────────────────────────────────────
  adultos = signal<AdultoMayor[]>([]);
  adultoSeleccionadoId = signal<number | null>(null);
  cargandoAdultos = signal<boolean>(true);
  errorAdultos = signal<string | null>(null);

  // ─── Lecturas de pulsera ────────────────────────────────────────────
  ultimaLectura = signal<LecturaPulsera | null>(null);
  historial = signal<LecturaPulsera[]>([]);
  cargandoLecturas = signal<boolean>(false);
  errorLecturas = signal<string | null>(null);
  sinLecturas = signal<boolean>(false);

  // ─── Modal Gráficas ─────────────────────────────────────────────────
  mostrarModalGraficas = signal<boolean>(false);
  chartBPMInstance: Chart | null = null;
  chartSpO2Instance: Chart | null = null;

  // ─── Pastillero (datos existentes, conservados) ─────────────────────
  compartimentos = [
    { id: 1, nombre: 'Metformina',    hora: '08:00', estado: 'tomado' },
    { id: 2, nombre: 'Atorvastatina', hora: '08:00', estado: 'tomado' },
    { id: 3, nombre: 'Metformina',    hora: '14:00', estado: 'pendiente' },
    { id: 4, nombre: 'Enalapril',     hora: '08:00', estado: 'tomado' },
    { id: 5, nombre: 'Vitamina D',    hora: '12:00', estado: 'omitido' },
    { id: 6, nombre: 'Calcio',        hora: '20:00', estado: 'pendiente' },
    { id: 7, nombre: 'Metformina',    hora: '20:00', estado: 'pendiente' },
  ];

  bateriaPastillero = signal<number>(78);

  // ─── Eventos del feed (conservados) ─────────────────────────────────
  tipoEvento = '';
  eventos = signal<Evento[]>([
    { id: 1, tipo: 'Toma confirmada', descripcion: 'Compartimento 1 abierto — Metformina 500mg',        dispositivo: 'Pastillero ESP32-001', hora: '08:02' },
    { id: 2, tipo: 'Toma confirmada', descripcion: 'Compartimento 4 abierto — Atorvastatina 20mg',      dispositivo: 'Pastillero ESP32-001', hora: '08:03' },
    { id: 3, tipo: 'Medición',        descripcion: 'Ritmo cardíaco: 72 BPM · SpO₂: 98.2%',             dispositivo: 'Pulsera BLE-023',       hora: '09:00' },
    { id: 4, tipo: 'Alerta',          descripcion: 'Toma omitida — Vitamina D 12:00 no fue registrada', dispositivo: 'Pastillero ESP32-001', hora: '12:30' },
    { id: 5, tipo: 'Medición',        descripcion: 'Ritmo cardíaco: 68 BPM · Pasos: 2,340',             dispositivo: 'Pulsera BLE-023',       hora: '13:00' },
  ]);

  // ─── Lifecycle ──────────────────────────────────────────────────────

  ngOnInit() {
    this.cargarAdultos();

    // Polling para actualizar lecturas (cada 10 segundos)
    this.subs.add(
      interval(10000).subscribe(() => {
        const id = this.adultoSeleccionadoId();
        if (id) {
          this.cargarLecturas(id, true);
        }
      })
    );

    // Polling de alertas de caída (HU-10)
    this.subs.add(
      interval(10000).subscribe(() => {
        this.alertaService.getActivas().subscribe(alertas => {
          const caida = alertas.find(a => a.tipo === 'caida_detectada');
          if (caida) {
            // Notificar al familiar inmediatamente
            window.alert('¡ALERTA CRÍTICA!\nSe ha detectado una caída del paciente. Atiéndalo inmediatamente.');
            // Agregar al feed de eventos si no está ya
            const existe = this.eventos().find(e => e.descripcion.includes('Caída detectada'));
            if (!existe) {
              this.eventos.update(evs => [
                { id: Date.now(), tipo: 'Alerta', descripcion: 'Caída detectada por la pulsera', dispositivo: 'Pulsera BLE-023', hora: new Date().toLocaleTimeString().substring(0,5) },
                ...evs
              ]);
            }
          }
        });
      })
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  // ─── Carga de adultos mayores ───────────────────────────────────────

  private cargarAdultos(): void {
    this.cargandoAdultos.set(true);
    this.errorAdultos.set(null);

    this.adultoService.getMisPacientes().subscribe({
      next: (data) => {
        this.adultos.set(data);
        this.cargandoAdultos.set(false);

        if (data.length === 1) {
          // Auto-seleccionar si solo hay un adulto
          this.seleccionarAdulto(data[0].idAdulto);
        } else if (data.length > 1) {
          // No auto-seleccionar, el usuario elige
          this.adultoSeleccionadoId.set(null);
        }
      },
      error: (err) => {
        this.errorAdultos.set(err?.mensaje || 'Error al cargar los adultos mayores.');
        this.cargandoAdultos.set(false);
      }
    });
  }

  // ─── Selección de adulto ────────────────────────────────────────────

  seleccionarAdulto(idAdulto: number): void {
    this.adultoSeleccionadoId.set(idAdulto);
    this.cargarLecturas(idAdulto);
  }

  onAdultoChange(event: Event): void {
    const id = Number((event.target as HTMLSelectElement).value);
    if (id) {
      this.seleccionarAdulto(id);
    }
  }

  // ─── Carga de lecturas ──────────────────────────────────────────────

  private cargarLecturas(idAdulto: number, esPolling: boolean = false): void {
    if (!esPolling) {
      this.cargandoLecturas.set(true);
      this.ultimaLectura.set(null);
      this.historial.set([]);
    }
    this.errorLecturas.set(null);
    this.sinLecturas.set(false);

    forkJoin({
      ultima: this.lecturaService.obtenerUltimaLectura(idAdulto),
      historial: this.lecturaService.obtenerHistorial(idAdulto)
    }).subscribe({
      next: ({ ultima, historial }) => {
        this.ultimaLectura.set(ultima);
        this.historial.set(historial);
        this.sinLecturas.set(!ultima && historial.length === 0);
        if (!esPolling) this.cargandoLecturas.set(false);
      },
      error: (err) => {
        // Si el error es 404, es que no hay lecturas aún
        if (err?.status === 404) {
          this.sinLecturas.set(true);
          this.errorLecturas.set(null);
        } else {
          this.errorLecturas.set(err?.mensaje || 'Error al cargar las lecturas de la pulsera.');
        }
        if (!esPolling) this.cargandoLecturas.set(false);
      }
    });
  }

  // ─── Acciones del usuario ───────────────────────────────────────────

  actualizar(): void {
    const id = this.adultoSeleccionadoId();
    if (id) {
      this.cargarLecturas(id);
    }
  }

  reintentar(): void {
    if (this.errorAdultos()) {
      this.cargarAdultos();
    } else {
      this.actualizar();
    }
  }

  // ─── Helpers para el template ───────────────────────────────────────

  get adultoSeleccionadoNombre(): string {
    const adulto = this.adultos().find(a => a.idAdulto === this.adultoSeleccionadoId());
    return adulto ? `${adulto.nombre} ${adulto.apellido}` : '';
  }

  formatearFecha(fecha: string | null | undefined): string {
    if (!fecha) return '--';
    try {
      const date = new Date(fecha);
      if (isNaN(date.getTime())) return '--';
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
      return '--';
    }
  }

  // ─── Feed de eventos (conservado) ───────────────────────────────────

  eventosFiltrados = () => {
    if (!this.tipoEvento) return this.eventos();
    const d = this.tipoEvento === 'pastillero' ? 'Pastillero' : 'Pulsera';
    return this.eventos().filter(e => e.dispositivo.includes(d));
  };

  // Método oculto para presentación: Se activa con Ctrl + Shift + C
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'c') {
      this.simularCaida();
    }
  }

  // Método temporal para probar HU-10 sin tocar la Base de Datos
  simularCaida() {
    window.alert('¡ALERTA CRÍTICA!\nSe ha detectado una caída del paciente. Atiéndalo inmediatamente.');
    const existe = this.eventos().find(e => e.descripcion.includes('Caída detectada'));
    if (!existe) {
      this.eventos.update(evs => [
        { id: Date.now(), tipo: 'Alerta', descripcion: 'Caída detectada por la pulsera', dispositivo: 'Pulsera BLE-023', hora: new Date().toLocaleTimeString().substring(0,5) },
        ...evs
      ]);
    }
  }

  // ─── Modal de Gráficas ──────────────────────────────────────────────

  abrirModalGraficas() {
    this.mostrarModalGraficas.set(true);
    setTimeout(() => this.renderizarGrafica(), 100);
  }

  cerrarModalGraficas() {
    this.mostrarModalGraficas.set(false);
    if (this.chartBPMInstance) {
      this.chartBPMInstance.destroy();
      this.chartBPMInstance = null;
    }
    if (this.chartSpO2Instance) {
      this.chartSpO2Instance.destroy();
      this.chartSpO2Instance = null;
    }
  }

  renderizarGrafica() {
    const canvasBPM = document.getElementById('chartBPM') as HTMLCanvasElement;
    const canvasSpO2 = document.getElementById('chartSpO2') as HTMLCanvasElement;
    
    if (!canvasBPM || !canvasSpO2) return;

    if (this.chartBPMInstance) this.chartBPMInstance.destroy();
    if (this.chartSpO2Instance) this.chartSpO2Instance.destroy();

    const dailyData = new Map<string, { bpm: number[], spo2: number[], fecha: Date }>();
    
    this.historial().forEach(h => {
      if (!h.fechaMedicion) return;
      const d = new Date(h.fechaMedicion);
      if (isNaN(d.getTime())) return;
      
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      if (!dailyData.has(dateStr)) {
        dailyData.set(dateStr, { bpm: [], spo2: [], fecha: d });
      }
      
      const entry = dailyData.get(dateStr)!;
      if (h.frecuenciaCardiaca) entry.bpm.push(h.frecuenciaCardiaca);
      if (h.spo2) entry.spo2.push(h.spo2);
    });

    const sortedDays = Array.from(dailyData.values())
      .sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
      .slice(-7); // Últimos 7 días con datos

    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const labels = sortedDays.map(d => {
       const name = diasSemana[d.fecha.getDay()];
       const dayNum = String(d.fecha.getDate()).padStart(2, '0');
       return `${name} ${dayNum}`;
    });

    const dataBPM = sortedDays.map(d => {
      if (d.bpm.length === 0) return 0;
      return Math.round(d.bpm.reduce((a, b) => a + b, 0) / d.bpm.length);
    });

    const dataSpO2 = sortedDays.map(d => {
      if (d.spo2.length === 0) return 0;
      return Math.round(d.spo2.reduce((a, b) => a + b, 0) / d.spo2.length);
    });

    this.chartBPMInstance = new Chart(canvasBPM, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Frecuencia Cardíaca',
          data: dataBPM,
          borderColor: '#C0452A',
          backgroundColor: 'rgba(192, 69, 42, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        interaction: { mode: 'index', intersect: false },
        scales: {
          y: { suggestedMin: 50, suggestedMax: 130 }
        }
      }
    });

    this.chartSpO2Instance = new Chart(canvasSpO2, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'SpO2',
          data: dataSpO2,
          borderColor: '#52B788',
          backgroundColor: 'rgba(82, 183, 136, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        interaction: { mode: 'index', intersect: false },
        scales: {
          y: { suggestedMin: 85, suggestedMax: 100 }
        }
      }
    });
  }
}
