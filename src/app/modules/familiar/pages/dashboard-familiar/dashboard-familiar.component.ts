import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

interface TodayMed {
  nombre: string;
  dosis: string;
  hora: string;
  estado: 'tomado' | 'pendiente' | 'omitido';
}

interface Alerta {
  id: number;
  titulo: string;
  descripcion: string;
  tipo: 'urgente' | 'moderado';
  hora: string;
  resuelta: boolean;
}

interface Adulto {
  id: number;
  nombre: string;
  initials: string;
  activo: boolean;
}

@Component({
  selector: 'app-dashboard-familiar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-familiar.component.html',
  styleUrls: ['./dashboard-familiar.component.scss']
})
export class DashboardFamiliarComponent {
  protected auth = inject(AuthService);

  adultoActivo = signal<number>(1);
  toast = signal<string | null>(null);

  adultos: Adulto[] = [
    { id: 1, nombre: 'Elena Rodríguez', initials: 'ER', activo: true },
    { id: 2, nombre: 'José Rodríguez', initials: 'JR', activo: true },
  ];

  medicamentosHoy: TodayMed[] = [
    { nombre: 'Losartán 50mg', dosis: '1 tableta', hora: '08:00', estado: 'tomado' },
    { nombre: 'Metformina 850mg', dosis: '1 tableta', hora: '08:00', estado: 'tomado' },
    { nombre: 'Atorvastatina 20mg', dosis: '1 tableta', hora: '12:00', estado: 'tomado' },
    { nombre: 'Metformina 850mg', dosis: '1 tableta', hora: '14:00', estado: 'pendiente' },
  ];

  alertas = signal<Alerta[]>([
    { id: 1, titulo: 'Toma omitida', descripcion: 'Omeprazol 20mg no fue tomado a las 07:00. Sin confirmación del pastillero.', tipo: 'urgente', hora: 'Hace 6 horas', resuelta: false },
    { id: 2, titulo: 'Ritmo cardíaco elevado', descripcion: 'Se detectó un pico de 108 BPM a las 11:30 que duró 12 minutos.', tipo: 'moderado', hora: 'Hace 2 horas', resuelta: false },
  ]);

  alertasActivas = computed(() => this.alertas().filter(a => !a.resuelta));

  tomadas = computed(() => this.medicamentosHoy.filter(m => m.estado === 'tomado').length);
  totalMeds = computed(() => this.medicamentosHoy.length);
  cumplimientoPct = computed(() => Math.round((this.tomadas() / this.totalMeds()) * 100));
  proxima = computed(() => this.medicamentosHoy.find(m => m.estado === 'pendiente') ?? null);

  observaciones = [
    { cuidador: 'Carlos Mendoza', initials: 'CM', hora: 'Hoy, 11:45', texto: 'La señora Elena desayunó bien y caminó por el jardín durante 20 minutos. Buen ánimo.' },
    { cuidador: 'Carlos Mendoza', initials: 'CM', hora: 'Hoy, 08:30', texto: 'Presión arterial matutina: 130/85. Dentro de rango esperado.' },
  ];

  seleccionarAdulto(id: number): void {
    this.adultoActivo.set(id);
  }

  marcarResuelta(id: number): void {
    this.alertas.update(list => list.map(a => a.id === id ? { ...a, resuelta: true } : a));
    this.showToast('Alerta marcada como resuelta');
  }

  private showToast(msg: string): void {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(null), 3500);
  }

  adultoActivoObj = computed(() => this.adultos.find(a => a.id === this.adultoActivo()) ?? this.adultos[0]);
}
