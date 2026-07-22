import { Component, signal, OnInit, OnDestroy, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertaService } from '../../../../core/services/alerta.service';
import { AdultoMayorService } from '../../../../core/services/adulto-mayor.service';
import { AiService, AnalisisIotIAResponse } from '../../../../core/services/ai.service';
import { LecturaPulseraService } from '../../../../core/services/lectura-pulsera.service';
import { LecturaPulsera } from '../../../../core/models/lectura-pulsera.model';
import { Subscription, interval, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables, ChartConfiguration } from 'chart.js';
Chart.register(...registerables);

interface Evento { id: number; tipo: string; descripcion: string; hora: string; dispositivo: string; }

@Component({
  selector: 'app-actividad-iot',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './actividad-iot.component.html',
  styleUrls: ['./actividad-iot.component.scss']
})
export class ActividadIotComponent implements OnInit, OnDestroy {
  private alertaService = inject(AlertaService);
  private adultoMayorService = inject(AdultoMayorService);
  private aiService = inject(AiService);
  private lecturaPulseraService = inject(LecturaPulseraService);
  private subs: Subscription = new Subscription();

  // Pacientes / Adultos Mayores
  adultos = signal<any[]>([]);
  idAdultoSeleccionado = signal<number | null>(null);
  nombreAdultoSeleccionado = signal<string>('');

  tipoEvento = '';

  // Análisis IA de anomalías IoT (HU-26)
  analisisIot = signal<AnalisisIotIAResponse | null>(null);
  cargandoAnalisisIot = signal<boolean>(false);
  errorAnalisisIot = signal<string | null>(null);

  // Lecturas de Pulsera
  ultimaLectura = signal<LecturaPulsera | null>(null);
  historialLecturas = signal<LecturaPulsera[]>([]);
  cargandoLecturas = signal<boolean>(false);
  errorLecturas = signal<string | null>(null);

  // Modal Gráficas
  mostrarModalGraficas = signal<boolean>(false);
  graficaFC = signal<ChartConfiguration<'line'>['data'] | null>(null);
  graficaSpO2 = signal<ChartConfiguration<'line'>['data'] | null>(null);
  graficaPresion = signal<ChartConfiguration<'line'>['data'] | null>(null);
  graficaPasos = signal<ChartConfiguration<'bar'>['data'] | null>(null);
  
  graficasOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { display: true }, y: { display: true } }
  };

  // Pastillero (Estático a solicitud)
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

  eventos = signal<Evento[]>([
    { id: 1, tipo: 'Toma confirmada', descripcion: 'Compartimento 1 abierto — Metformina 500mg',        dispositivo: 'Pastillero ESP32-001', hora: '08:02' },
    { id: 2, tipo: 'Toma confirmada', descripcion: 'Compartimento 4 abierto — Atorvastatina 20mg',      dispositivo: 'Pastillero ESP32-001', hora: '08:03' },
    { id: 4, tipo: 'Alerta',          descripcion: 'Toma omitida — Vitamina D 12:00 no fue registrada', dispositivo: 'Pastillero ESP32-001', hora: '12:30' },
  ]);

  ngOnInit() {
    // Polling de alertas de caída (HU-10)
    this.subs.add(
      interval(10000).subscribe(() => {
        this.alertaService.getActivas().subscribe(alertas => {
          const caida = alertas.find(a => a.tipo === 'caida_detectada');
          if (caida) {
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

    // Polling automático de lecturas de la pulsera en tiempo real cada 3 segundos sin refrescar la página
    this.subs.add(
      interval(3000).subscribe(() => {
        const id = this.idAdultoSeleccionado();
        if (id) {
          this.cargarLecturasPulsera(id, true);
        }
      })
    );

    // Carga de lista real de adultos mayores vinculados desde la BD
    this.adultoMayorService.getMisPacientes().subscribe({
      next: lista => {
        if (lista && lista.length > 0) {
          this.adultos.set(lista);
          const primerAdulto = lista[0];
          this.seleccionarAdulto(primerAdulto.idAdulto);
        }
      },
      error: () => {}
    });
  }

  onAdultoChange(event: any) {
    const id = Number(event.target.value);
    if (id) {
      this.seleccionarAdulto(id);
    }
  }

  seleccionarAdulto(idAdulto: number) {
    this.idAdultoSeleccionado.set(idAdulto);
    const encontrado = this.adultos().find(a => a.idAdulto === idAdulto);
    if (encontrado) {
      const nombreCompleto = `${encontrado.nombre || ''} ${encontrado.apellido || ''}`.trim();
      this.nombreAdultoSeleccionado.set(nombreCompleto);
    }
    this.cargarAnalisisIot(idAdulto);
    this.cargarLecturasPulsera(idAdulto);
  }

  cargarLecturasPulsera(idAdulto: number, silencioso: boolean = false) {
    if (!silencioso) {
      this.cargandoLecturas.set(true);
      this.errorLecturas.set(null);
    }

    forkJoin({
      ultima: this.lecturaPulseraService.obtenerUltimaLectura(idAdulto).pipe(
        catchError(err => {
          if (err.status === 404) return of(null);
          throw err;
        })
      ),
      historial: this.lecturaPulseraService.obtenerHistorial(idAdulto).pipe(
        catchError(err => {
          if (err.status === 404) return of([]);
          throw err;
        })
      )
    }).subscribe({
      next: (res) => {
        this.ultimaLectura.set(res.ultima);
        this.historialLecturas.set(res.historial || []);
        if (!res.ultima && (!res.historial || res.historial.length === 0)) {
           this.errorLecturas.set('No hay lecturas registradas para este adulto mayor.');
        } else {
           this.errorLecturas.set(null);
           if (this.mostrarModalGraficas()) {
             this.prepararDatosGraficas(); // Actualizar la gráfica en vivo si el modal está abierto
           }
        }
        if (!silencioso) this.cargandoLecturas.set(false);
      },
      error: (err) => {
        if (!silencioso) {
          this.errorLecturas.set('Ocurrió un error al cargar las lecturas de la pulsera.');
          this.cargandoLecturas.set(false);
        }
      }
    });
  }

  actualizarLecturas() {
    const id = this.idAdultoSeleccionado();
    if (id) {
      this.cargarLecturasPulsera(id);
    }
  }

  abrirModalGraficas() {
    this.prepararDatosGraficas();
    this.mostrarModalGraficas.set(true);
  }

  cerrarModalGraficas() {
    this.mostrarModalGraficas.set(false);
  }

  prepararDatosGraficas() {
    const historial = this.historialLecturas();
    if (!historial || historial.length === 0) return;

    // Ordenar de forma cronológica ascendente
    const ordenado = [...historial].sort((a, b) => new Date(a.fechaMedicion).getTime() - new Date(b.fechaMedicion).getTime());
    
    const labels = ordenado.map(l => {
      const date = new Date(l.fechaMedicion);
      const dia = String(date.getDate()).padStart(2, '0');
      const mes = String(date.getMonth() + 1).padStart(2, '0');
      const horas = String(date.getHours()).padStart(2, '0');
      const minutos = String(date.getMinutes()).padStart(2, '0');
      return `${dia}/${mes} ${horas}:${minutos}`;
    });

    const dataFC = ordenado.map(l => l.frecuenciaCardiaca || null);
    const dataSpO2 = ordenado.map(l => l.spo2 || null);
    const dataPasos = ordenado.map(l => l.pasosDiarios || null);
    const dataSis = ordenado.map(l => l.presionSistolica || null);
    const dataDias = ordenado.map(l => l.presionDiastolica || null);

    this.graficaFC.set({
      labels: labels,
      datasets: [{ data: dataFC, label: 'Frecuencia Cardíaca (BPM)', borderColor: '#C0452A', backgroundColor: 'rgba(192,69,42,0.1)', fill: true, tension: 0.4 }]
    });
    this.graficaSpO2.set({
      labels: labels,
      datasets: [{ data: dataSpO2, label: 'SpO2 (%)', borderColor: '#2E86AB', backgroundColor: 'rgba(46,134,171,0.1)', fill: true, tension: 0.4 }]
    });
    this.graficaPresion.set({
      labels: labels,
      datasets: [
        { data: dataSis, label: 'P. Sistólica', borderColor: '#B47B12', backgroundColor: 'transparent', fill: false, tension: 0.4, borderDash: [5, 5] },
        { data: dataDias, label: 'P. Diastólica', borderColor: '#F4A261', backgroundColor: 'transparent', fill: false, tension: 0.4, borderDash: [5, 5] }
      ]
    });
    this.graficaPasos.set({
      labels: labels,
      datasets: [{ data: dataPasos, label: 'Pasos', backgroundColor: '#52B788' }]
    });
  }

  cargarAnalisisIot(idAdulto: number): void {
    this.cargandoAnalisisIot.set(true);
    this.errorAnalisisIot.set(null);
    this.aiService.getAnalisisIot(idAdulto).subscribe({
      next: data => {
        this.analisisIot.set(data);
        this.cargandoAnalisisIot.set(false);
      },
      error: () => {
        this.errorAnalisisIot.set('No se pudo cargar el análisis IA de los datos IoT.');
        this.cargandoAnalisisIot.set(false);
      }
    });
  }

  iconoSeveridad(severidad: string): string {
    switch (severidad) {
      case 'critica': return '🔴';
      case 'alta': return '🟠';
      case 'media': return '🟡';
      default: return '🟢';
    }
  }

  iconoTendencia(direccion: string): string {
    switch (direccion) {
      case 'subiendo': return '↑';
      case 'bajando': return '↓';
      default: return '→';
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  eventosFiltrados = () => {
    if (!this.tipoEvento) return this.eventos();
    const d = this.tipoEvento === 'pastillero' ? 'Pastillero' : 'Pulsera';
    return this.eventos().filter(e => e.dispositivo.includes(d));
  };

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'c') {
      this.simularCaida();
    }
  }

  simularCaida() {
    const existe = this.eventos().find(e => e.descripcion.includes('Caída detectada'));
    if (!existe) {
      this.eventos.update(evs => [
        { id: Date.now(), tipo: 'Alerta', descripcion: 'Caída detectada por la pulsera', dispositivo: 'Pulsera BLE-023', hora: new Date().toLocaleTimeString().substring(0,5) },
        ...evs
      ]);
    }
  }
}
