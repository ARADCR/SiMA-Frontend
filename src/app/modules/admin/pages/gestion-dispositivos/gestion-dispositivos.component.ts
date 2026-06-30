import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type TipoDispositivo = 'pastillero_esp32' | 'pulsera_inteligente';
type EstadoDispositivo = 'en_linea' | 'fuera_de_linea' | 'sin_asignar';

interface Dispositivo {
  id: number;
  mac: string;
  tipo: TipoDispositivo;
  adulto: string;
  estado: EstadoDispositivo;
  fechaRegistro: string;
  ultimaSync: string;
}

interface DispositivoForm {
  mac: string;
  tipo: TipoDispositivo;
  adulto: string;
}

@Component({
  selector: 'app-gestion-dispositivos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-dispositivos.component.html',
  styleUrls: ['./gestion-dispositivos.component.scss']
})
export class GestionDispositivosComponent {
  tabActivo = signal<'todos' | 'sin_asignar'>('todos');
  modalMode = signal<'crear' | null>(null);
  selectedTipo = signal<TipoDispositivo>('pastillero_esp32');
  toast = signal<{ msg: string; type: 'success' | 'error' } | null>(null);

  form = signal<DispositivoForm>({ mac: '', tipo: 'pastillero_esp32', adulto: '' });

  dispositivos = signal<Dispositivo[]>([
    { id: 1, mac: 'AA:BB:CC:11:22:33', tipo: 'pastillero_esp32',    adulto: 'Elena Rodríguez', estado: 'en_linea',       fechaRegistro: '01/03/2026', ultimaSync: 'Hace 5 min'  },
    { id: 2, mac: 'DD:EE:FF:44:55:66', tipo: 'pulsera_inteligente', adulto: 'José Martínez',   estado: 'en_linea',       fechaRegistro: '05/03/2026', ultimaSync: 'Hace 12 min' },
    { id: 3, mac: 'GG:HH:II:77:88:99', tipo: 'pastillero_esp32',    adulto: 'Luis García',     estado: 'fuera_de_linea', fechaRegistro: '10/04/2026', ultimaSync: 'Hace 3 h'    },
    { id: 4, mac: 'JJ:KK:LL:00:11:22', tipo: 'pulsera_inteligente', adulto: 'Manuel Herrera',  estado: 'en_linea',       fechaRegistro: '15/04/2026', ultimaSync: 'Hace 2 min'  },
    { id: 5, mac: 'MM:NN:OO:33:44:55', tipo: 'pastillero_esp32',    adulto: '',                estado: 'sin_asignar',    fechaRegistro: '20/05/2026', ultimaSync: '—'           },
    { id: 6, mac: 'PP:QQ:RR:66:77:88', tipo: 'pulsera_inteligente', adulto: '',                estado: 'sin_asignar',    fechaRegistro: '01/06/2026', ultimaSync: '—'           },
  ]);

  dispositivosFiltrados = computed(() => {
    const tab = this.tabActivo();
    if (tab === 'sin_asignar') return this.dispositivos().filter(d => d.estado === 'sin_asignar');
    return this.dispositivos();
  });

  stats = computed(() => {
    const all = this.dispositivos();
    return {
      total:       all.length,
      enLinea:     all.filter(d => d.estado === 'en_linea').length,
      fueraLinea:  all.filter(d => d.estado === 'fuera_de_linea').length,
      sinAsignar:  all.filter(d => d.estado === 'sin_asignar').length,
    };
  });

  tipoLabel(t: TipoDispositivo): string {
    return t === 'pastillero_esp32' ? 'Pastillero ESP32' : 'Pulsera inteligente';
  }

  estadoLabel(e: EstadoDispositivo): string {
    return { en_linea: 'En línea', fuera_de_linea: 'Fuera de línea', sin_asignar: 'Sin asignar' }[e];
  }

  estadoBadgeClass(e: EstadoDispositivo): string {
    return { en_linea: 'badge--green', fuera_de_linea: 'badge--red', sin_asignar: 'badge--yellow' }[e];
  }

  accionLabel(d: Dispositivo): string {
    return d.estado === 'sin_asignar' ? 'Asignar' : 'Editar';
  }

  openModal(): void {
    this.form.set({ mac: '', tipo: 'pastillero_esp32', adulto: '' });
    this.selectedTipo.set('pastillero_esp32');
    this.modalMode.set('crear');
  }

  setField<K extends keyof DispositivoForm>(key: K, value: DispositivoForm[K]): void {
    this.form.update(f => ({ ...f, [key]: value }));
  }

  closeModal(): void { this.modalMode.set(null); }

  selectTipo(t: TipoDispositivo): void {
    this.selectedTipo.set(t);
    this.form.update(f => ({ ...f, tipo: t }));
  }

  registrar(): void {
    const f = this.form();
    if (!f.mac.trim()) return;
    this.dispositivos.update(list => [...list, {
      id: list.length + 1,
      mac: f.mac,
      tipo: f.tipo,
      adulto: f.adulto,
      estado: f.adulto ? 'en_linea' : 'sin_asignar',
      fechaRegistro: new Date().toLocaleDateString('es-MX'),
      ultimaSync: '—'
    }]);
    this.showToast('Dispositivo registrado correctamente', 'success');
    this.closeModal();
  }

  private showToast(msg: string, type: 'success' | 'error'): void {
    this.toast.set({ msg, type });
    setTimeout(() => this.toast.set(null), 4000);
  }
}
