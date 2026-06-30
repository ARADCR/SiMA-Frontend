import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Alerta {
  id: number;
  titulo: string;
  descripcion: string;
  tipo: 'urgente' | 'moderado' | 'info';
  estado: 'activa' | 'resuelta';
  adulto: string;
  hora: string;
}

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alertas.component.html',
  styleUrls: ['./alertas.component.scss']
})
export class AlertasComponent {
  buscar = signal('');
  filtroTipo = signal('');
  filtroEstado = signal('');
  toast = signal<string | null>(null);

  alertas = signal<Alerta[]>([
    { id: 1, titulo: 'Toma omitida', descripcion: 'Omeprazol 20mg no fue tomado a las 07:00. Sin confirmación del pastillero ni registro manual.', tipo: 'urgente', estado: 'activa', adulto: 'Elena Rodríguez', hora: 'Hoy, 07:30' },
    { id: 2, titulo: 'Ritmo cardíaco elevado', descripcion: 'Se detectó un pico de 108 BPM a las 11:30 que duró 12 minutos. Fuera del rango normal (60–100 BPM).', tipo: 'moderado', estado: 'activa', adulto: 'Elena Rodríguez', hora: 'Hoy, 11:30' },
    { id: 3, titulo: 'Stock bajo de medicamento', descripcion: 'Metformina 850mg tiene menos de 5 unidades en existencia.', tipo: 'info', estado: 'activa', adulto: 'José Rodríguez', hora: 'Ayer, 15:00' },
    { id: 4, titulo: 'Toma omitida', descripcion: 'Losartán 50mg no fue tomado en la dosis de las 20:00.', tipo: 'urgente', estado: 'resuelta', adulto: 'Elena Rodríguez', hora: '25 jun, 20:30' },
    { id: 5, titulo: 'Dispositivo desconectado', descripcion: 'El pastillero ESP32 perdió conexión WiFi durante 3 horas.', tipo: 'moderado', estado: 'resuelta', adulto: 'José Rodríguez', hora: '24 jun, 03:00' },
  ]);

  alertasFiltradas = computed(() => {
    const q = this.buscar().toLowerCase();
    return this.alertas().filter(a => {
      const matchQ = !q || a.titulo.toLowerCase().includes(q) || a.descripcion.toLowerCase().includes(q) || a.adulto.toLowerCase().includes(q);
      const matchTipo = !this.filtroTipo() || a.tipo === this.filtroTipo();
      const matchEstado = !this.filtroEstado() || a.estado === this.filtroEstado();
      return matchQ && matchTipo && matchEstado;
    });
  });

  marcarResuelta(id: number): void {
    this.alertas.update(list => list.map(a => a.id === id ? { ...a, estado: 'resuelta' } : a));
    this.showToast('Alerta marcada como resuelta');
  }

  tipoLabel(tipo: string): string {
    if (tipo === 'urgente') return 'Urgente';
    if (tipo === 'moderado') return 'Moderado';
    return 'Info';
  }

  private showToast(msg: string): void {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(null), 3500);
  }
}
