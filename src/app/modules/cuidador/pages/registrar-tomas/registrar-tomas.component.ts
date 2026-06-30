import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type EstadoToma = 'pendiente' | 'tomado' | 'omitido';

interface Toma {
  id: number; paciente: string; initials: string; avatarColor: string;
  medicamento: string; dosis: string; hora: string; estado: EstadoToma;
}

@Component({
  selector: 'app-registrar-tomas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registrar-tomas.component.html',
  styleUrls: ['./registrar-tomas.component.scss']
})
export class RegistrarTomasComponent {
  pacienteFiltro = '';

  tomas = signal<Toma[]>([
    { id: 1, paciente: 'Elena Rodríguez', initials: 'ER', avatarColor: '#2E86AB', medicamento: 'Metformina 500mg', dosis: '1 tableta', hora: '08:00', estado: 'tomado' },
    { id: 2, paciente: 'Elena Rodríguez', initials: 'ER', avatarColor: '#2E86AB', medicamento: 'Atorvastatina', dosis: '20mg', hora: '08:00', estado: 'tomado' },
    { id: 3, paciente: 'José Martínez', initials: 'JM', avatarColor: '#52B788', medicamento: 'Enalapril 10mg', dosis: '1 tableta', hora: '09:00', estado: 'tomado' },
    { id: 4, paciente: 'Rosa Pérez', initials: 'RP', avatarColor: '#E76F51', medicamento: 'Omeprazol 20mg', dosis: '1 cápsula', hora: '09:30', estado: 'omitido' },
    { id: 5, paciente: 'Luis García', initials: 'LG', avatarColor: '#F4A261', medicamento: 'Losartán 50mg', dosis: '1 tableta', hora: '13:30', estado: 'pendiente' },
    { id: 6, paciente: 'Elena Rodríguez', initials: 'ER', avatarColor: '#2E86AB', medicamento: 'Metformina 500mg', dosis: '1 tableta', hora: '14:00', estado: 'pendiente' },
    { id: 7, paciente: 'José Martínez', initials: 'JM', avatarColor: '#52B788', medicamento: 'Amlodipina 5mg', dosis: '1 tableta', hora: '15:00', estado: 'pendiente' },
    { id: 8, paciente: 'Rosa Pérez', initials: 'RP', avatarColor: '#E76F51', medicamento: 'Calcio + Vit D', dosis: '1 tableta', hora: '16:00', estado: 'pendiente' },
  ]);

  toast = signal<{ msg: string; type: 'success' | 'error' } | null>(null);

  tomasFiltradas = computed(() =>
    this.pacienteFiltro
      ? this.tomas().filter(t => t.paciente === this.pacienteFiltro)
      : this.tomas()
  );

  completadas = computed(() => this.tomas().filter(t => t.estado === 'tomado').length);
  pendientes = computed(() => this.tomas().filter(t => t.estado === 'pendiente').length);
  omitidas = computed(() => this.tomas().filter(t => t.estado === 'omitido').length);

  registrar(t: Toma, estado: EstadoToma): void {
    this.tomas.update(list => list.map(x => x.id === t.id ? { ...x, estado } : x));
    const msg = estado === 'tomado'
      ? `Toma de ${t.medicamento} registrada correctamente`
      : `Toma de ${t.medicamento} marcada como omitida`;
    this.showToast(msg, estado === 'tomado' ? 'success' : 'error');
  }

  revertir(t: Toma): void {
    this.tomas.update(list => list.map(x => x.id === t.id ? { ...x, estado: 'pendiente' } : x));
    this.showToast('Toma revertida a pendiente', 'success');
  }

  badgeClass(e: EstadoToma): string {
    return e === 'tomado' ? 'badge badge-green'
      : e === 'omitido' ? 'badge badge-red'
      : 'badge badge-yellow';
  }

  badgeLabel(e: EstadoToma): string {
    return e === 'tomado' ? 'Completada'
      : e === 'omitido' ? 'Omitida'
      : 'Pendiente';
  }

  private showToast(msg: string, type: 'success' | 'error'): void {
    this.toast.set({ msg, type });
    setTimeout(() => this.toast.set(null), 3500);
  }
}
