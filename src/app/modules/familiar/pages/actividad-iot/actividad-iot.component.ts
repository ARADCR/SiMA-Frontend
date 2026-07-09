import { Component, signal, OnInit, OnDestroy, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertaService } from '../../../../core/services/alerta.service';
import { Subscription, interval } from 'rxjs';

interface Evento { id: number; tipo: string; descripcion: string; hora: string; dispositivo: string; }

@Component({
  selector: 'app-actividad-iot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './actividad-iot.component.html',
  styleUrls: ['./actividad-iot.component.scss']
})
export class ActividadIotComponent implements OnInit, OnDestroy {
  private alertaService = inject(AlertaService);
  private subs: Subscription = new Subscription();
  adultoSel  = 'Elena Rodríguez';
  tipoEvento = '';

  compartimentos = [
    { id: 1, nombre: 'Metformina',    hora: '08:00', estado: 'tomado' },
    { id: 2, nombre: 'Atorvastatina', hora: '08:00', estado: 'tomado' },
    { id: 3, nombre: 'Metformina',    hora: '14:00', estado: 'pendiente' },
    { id: 4, nombre: 'Enalapril',     hora: '08:00', estado: 'tomado' },
    { id: 5, nombre: 'Vitamina D',    hora: '12:00', estado: 'omitido' },
    { id: 6, nombre: 'Calcio',        hora: '20:00', estado: 'pendiente' },
    { id: 7, nombre: 'Metformina',    hora: '20:00', estado: 'pendiente' },
  ];

  eventos = signal<Evento[]>([
    { id: 1, tipo: 'Toma confirmada', descripcion: 'Compartimento 1 abierto — Metformina 500mg',        dispositivo: 'Pastillero ESP32-001', hora: '08:02' },
    { id: 2, tipo: 'Toma confirmada', descripcion: 'Compartimento 4 abierto — Atorvastatina 20mg',      dispositivo: 'Pastillero ESP32-001', hora: '08:03' },
    { id: 3, tipo: 'Medición',        descripcion: 'Ritmo cardíaco: 72 BPM · SpO₂: 98.2%',             dispositivo: 'Pulsera BLE-023',       hora: '09:00' },
    { id: 4, tipo: 'Alerta',          descripcion: 'Toma omitida — Vitamina D 12:00 no fue registrada', dispositivo: 'Pastillero ESP32-001', hora: '12:30' },
    { id: 5, tipo: 'Medición',        descripcion: 'Ritmo cardíaco: 68 BPM · Pasos: 2,340',             dispositivo: 'Pulsera BLE-023',       hora: '13:00' },
  ]);

  // Señales de métricas (HU-09)
  bpm = signal<number>(72);
  spo2 = signal<number>(98.2);
  temp = signal<number>(36.5);
  pasos = signal<number>(2340);
  bateriaPastillero = signal<number>(78);
  bateriaPulsera = signal<number>(34);

  ngOnInit() {
    // Simulación de monitoreo de actividad (HU-09)
    this.subs.add(
      interval(5000).subscribe(() => {
        this.bpm.update(v => v + (Math.floor(Math.random() * 5) - 2));
        this.pasos.update(v => v + Math.floor(Math.random() * 15));
        
        // Mantener dentro de rangos normales
        if (this.bpm() < 60) this.bpm.set(60);
        if (this.bpm() > 100) this.bpm.set(100);
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
}
