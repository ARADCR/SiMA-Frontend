import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Evento { id: number; tipo: string; descripcion: string; hora: string; dispositivo: string; }

@Component({
  selector: 'app-actividad-iot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './actividad-iot.component.html',
  styleUrls: ['./actividad-iot.component.scss']
})
export class ActividadIotComponent {
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

  eventosFiltrados = () => {
    if (!this.tipoEvento) return this.eventos();
    const d = this.tipoEvento === 'pastillero' ? 'Pastillero' : 'Pulsera';
    return this.eventos().filter(e => e.dispositivo.includes(d));
  };
}
