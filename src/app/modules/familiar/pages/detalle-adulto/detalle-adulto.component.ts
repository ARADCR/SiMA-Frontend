import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';

type Tab = 'medicamentos' | 'historial' | 'alertas' | 'dispositivo';

interface Medicamento { nombre: string; dosis: string; horario: string; estado: string; }
interface Evento { fecha: string; tipo: string; descripcion: string; metodo: string; }
interface Alerta { titulo: string; descripcion: string; tipo: string; hora: string; resuelta: boolean; }
interface Dispositivo { nombre: string; id: string; estado: string; bateria: number; sync: string; }

@Component({
  selector: 'app-detalle-adulto',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './detalle-adulto.component.html',
  styleUrls: ['./detalle-adulto.component.scss']
})
export class DetalleAdultoComponent implements OnInit {
  private route = inject(ActivatedRoute);

  tabActiva = signal<Tab>('medicamentos');
  toast = signal<string | null>(null);

  adulto = {
    nombre: 'Elena',
    apellido: 'Rodríguez',
    edad: 76,
    curp: 'ROEL760315MDFDRN08',
    fechaNacimiento: '1948-03-15',
    condiciones: 'Diabetes tipo 2 · Hipertensión arterial',
    contactoMedico: 'Dr. Martínez — 55-5678-1234',
    activo: true,
  };

  medicamentos: Medicamento[] = [
    { nombre: 'Losartán 50mg', dosis: '1 tableta', horario: '08:00 · 20:00', estado: 'activo' },
    { nombre: 'Metformina 850mg', dosis: '1 tableta', horario: '08:00 · 14:00 · 20:00', estado: 'activo' },
    { nombre: 'Atorvastatina 20mg', dosis: '1 tableta', horario: '21:00', estado: 'activo' },
    { nombre: 'Omeprazol 20mg', dosis: '1 cápsula', horario: '07:00', estado: 'activo' },
  ];

  historial: Evento[] = [
    { fecha: '27 jun, 12:00', tipo: 'Toma', descripcion: 'Atorvastatina 20mg — 1 tableta tomada', metodo: 'Pastillero ESP32' },
    { fecha: '27 jun, 11:30', tipo: 'Alerta', descripcion: 'Ritmo cardíaco elevado: 108 BPM durante 12 min', metodo: 'Pulsera' },
    { fecha: '27 jun, 08:00', tipo: 'Toma', descripcion: 'Losartán 50mg — 1 tableta tomada', metodo: 'Pastillero ESP32' },
    { fecha: '27 jun, 07:00', tipo: 'Omitida', descripcion: 'Omeprazol 20mg — toma no confirmada', metodo: '—' },
  ];

  alertas = signal<Alerta[]>([
    { titulo: 'Toma omitida', descripcion: 'Omeprazol no fue tomado a las 07:00.', tipo: 'urgente', hora: 'Hace 6 horas', resuelta: false },
    { titulo: 'Ritmo cardíaco elevado', descripcion: 'Pico de 108 BPM a las 11:30, 12 minutos.', tipo: 'moderado', hora: 'Hace 2 horas', resuelta: false },
  ]);

  dispositivo: Dispositivo = {
    nombre: 'Pastillero ESP32', id: 'AA:BB:CC:11:22:33',
    estado: 'online', bateria: 78, sync: 'Hace 2 min'
  };

  tabs: { id: Tab; label: string }[] = [
    { id: 'medicamentos', label: 'Medicamentos' },
    { id: 'historial', label: 'Historial' },
    { id: 'alertas', label: 'Alertas' },
    { id: 'dispositivo', label: 'Dispositivo' },
  ];

  ngOnInit(): void {}

  iniciales(): string {
    return (this.adulto.nombre.charAt(0) + this.adulto.apellido.charAt(0)).toUpperCase();
  }

  tipoClass(tipo: string): string {
    if (tipo === 'Toma') return 'badge-green';
    if (tipo === 'Alerta') return 'badge-red';
    if (tipo === 'Omitida') return 'badge-red';
    return 'badge-blue';
  }

  marcarResuelta(idx: number): void {
    this.alertas.update(list => list.map((a, i) => i === idx ? { ...a, resuelta: true } : a));
    this.toast.set('Alerta marcada como resuelta');
    setTimeout(() => this.toast.set(null), 3500);
  }
}
