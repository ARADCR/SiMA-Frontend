import { Component, inject, signal, computed, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { RegistroTomaService, RegistroTomaResponse } from '../../../../core/services/registro-toma.service';

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
export class DashboardFamiliarComponent implements OnInit {
  protected auth = inject(AuthService);
  private registroTomaService = inject(RegistroTomaService);

  adultoActivo = signal<number>(1);
  toast = signal<string | null>(null);

  adultos: Adulto[] = [
    { id: 1, nombre: 'Elena Rodríguez', initials: 'ER', activo: true },
    { id: 2, nombre: 'José Rodríguez', initials: 'JR', activo: true },
  ];

  medicamentosHoy = signal<TodayMed[]>([]);

  alertas = signal<Alerta[]>([
    { id: 1, titulo: 'Toma omitida', descripcion: 'Omeprazol 20mg no fue tomado a las 07:00. Sin confirmación del pastillero.', tipo: 'urgente', hora: 'Hace 6 horas', resuelta: false },
    { id: 2, titulo: 'Ritmo cardíaco elevado', descripcion: 'Se detectó un pico de 108 BPM a las 11:30 que duró 12 minutos.', tipo: 'moderado', hora: 'Hace 2 horas', resuelta: false },
  ]);

  alertasActivas = computed(() => this.alertas().filter(a => !a.resuelta));

  tomadas = computed(() => this.medicamentosHoy().filter(m => m.estado === 'tomado').length);
  totalMeds = computed(() => this.medicamentosHoy().length);
  cumplimientoPct = computed(() => {
    const total = this.totalMeds();
    if (total === 0) return 0;
    return Math.round((this.tomadas() / total) * 100);
  });
  proxima = computed(() => this.medicamentosHoy().find(m => m.estado === 'pendiente') ?? null);

  observaciones = [
    { cuidador: 'Carlos Mendoza', initials: 'CM', hora: 'Hoy, 11:45', texto: 'La señora Elena desayunó bien y caminó por el jardín durante 20 minutos. Buen ánimo.' },
    { cuidador: 'Carlos Mendoza', initials: 'CM', hora: 'Hoy, 08:30', texto: 'Presión arterial matutina: 130/85. Dentro de rango esperado.' },
  ];

  constructor() {
    effect(() => {
      const idAdulto = this.adultoActivo();
      this.cargarTomasDelDia(idAdulto);
    });
  }

  ngOnInit() {
    // Initialization done in effect
  }

  cargarTomasDelDia(idAdulto: number) {
    this.registroTomaService.getTomasDelDia(idAdulto).subscribe({
      next: (res: RegistroTomaResponse[]) => {
        const meds = res.map(toma => ({
          nombre: toma.horario.medicamento.nombre,
          dosis: toma.horario.medicamento.dosis,
          hora: toma.horario.horaProgramada.substring(0, 5),
          estado: (toma.estado === 'confirmado_manual' ? 'tomado' : toma.estado) as TodayMed['estado']
        }));
        this.medicamentosHoy.set(meds);
      },
      error: err => {
        console.error('Error al cargar tomas', err);
        this.showToast('Error al cargar medicamentos del día');
      }
    });
  }

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
