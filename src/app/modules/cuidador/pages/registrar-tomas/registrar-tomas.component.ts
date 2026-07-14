import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdultoMayorService } from '../../../../core/services/adulto-mayor.service';
import { MedicamentoService } from '../../../../core/services/medicamento.service';
import { AdultoMayor } from '../../../../core/models/adulto-mayor.model';
import { Toma as TomaBackend, EstadoToma } from '../../../../core/models/medicamento.model';

interface TomaUI {
  idRegistro: number;
  paciente: string;
  initials: string;
  avatarColor: string;
  medicamento: string;
  dosis: string;
  hora: string;
  estado: EstadoToma;
  original: TomaBackend;
}

@Component({
  selector: 'app-registrar-tomas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registrar-tomas.component.html',
  styleUrls: ['./registrar-tomas.component.scss']
})
export class RegistrarTomasComponent implements OnInit {
  private adultoSvc = inject(AdultoMayorService);
  private medSvc = inject(MedicamentoService);

  pacienteFiltro = '';
  adultos = signal<AdultoMayor[]>([]);
  tomas = signal<TomaUI[]>([]);
  isSaving = signal(false);

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.adultoSvc.getMisPacientes().subscribe({
      next: (list) => {
        this.adultos.set(list);
        
        if (list.length === 0) return;

        const ids = list.map(a => a.idAdulto);
        this.medSvc.getTomasMultiples(ids).subscribe({
          next: (tomasList) => {
            const nuevasTomas: TomaUI[] = [];
            const colors = ['#2E86AB', '#52B788', '#E76F51', '#F4A261', '#6C63FF'];

            tomasList.forEach((tomasPaciente, i) => {
              if (tomasPaciente.length === 0) return;
              
              const adultoId = tomasPaciente[0].idAdulto;
              const adultoIndex = list.findIndex(a => a.idAdulto === adultoId);
              const a = list[adultoIndex !== -1 ? adultoIndex : 0];
              const color = colors[(adultoIndex !== -1 ? adultoIndex : i) % colors.length];
              
              tomasPaciente.forEach(t => {
                nuevasTomas.push({
                  idRegistro: t.idRegistro,
                  paciente: `${a.nombre} ${a.apellido}`,
                  initials: `${a.nombre.charAt(0)}${a.apellido.charAt(0)}`.toUpperCase(),
                  avatarColor: color,
                  medicamento: t.nombreMedicamento,
                  dosis: t.dosis,
                  hora: new Date(t.fechaHoraProgramada).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'}),
                  estado: t.estado,
                  original: t
                });
              });
            });

            // Ordenar por hora
            nuevasTomas.sort((a, b) => a.original.fechaHoraProgramada.localeCompare(b.original.fechaHoraProgramada));
            this.tomas.set(nuevasTomas);
          },
          error: (err) => console.error('Error al cargar tomas múltiples', err)
        });
      },
      error: (err) => console.error('Error al cargar pacientes:', err)
    });
  }

  toast = signal<{ msg: string; type: 'success' | 'error' } | null>(null);

  tomasFiltradas = computed(() =>
    this.pacienteFiltro
      ? this.tomas().filter(t => t.paciente === this.pacienteFiltro)
      : this.tomas()
  );

  completadas = computed(() => this.tomas().filter(t => t.estado === 'tomado').length);
  pendientes = computed(() => this.tomas().filter(t => t.estado === 'pendiente').length);
  omitidas = computed(() => this.tomas().filter(t => t.estado === 'omitido').length);

  registrar(t: TomaUI, estado: EstadoToma): void {
    if (this.isSaving()) return;
    this.isSaving.set(true);

    this.medSvc.registrarToma(t.idRegistro, { estado }).subscribe({
      next: () => {
        this.tomas.update(list => list.map(x => x.idRegistro === t.idRegistro ? { ...x, estado } : x));
        const msg = estado === 'tomado'
          ? `Toma de ${t.medicamento} registrada correctamente`
          : `Toma de ${t.medicamento} marcada como omitida`;
        this.showToast(msg, estado === 'tomado' ? 'success' : 'error');
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error('Error al registrar toma', err);
        this.showToast('Error al registrar la toma', 'error');
        this.isSaving.set(false);
      }
    });
  }

  revertir(t: TomaUI): void {
    if (this.isSaving()) return;
    this.isSaving.set(true);
    
    this.medSvc.registrarToma(t.idRegistro, { estado: 'pendiente' }).subscribe({
      next: () => {
        this.tomas.update(list => list.map(x => x.idRegistro === t.idRegistro ? { ...x, estado: 'pendiente' } : x));
        this.showToast('Toma revertida a pendiente', 'success');
        this.isSaving.set(false);
      },
      error: () => {
        this.showToast('Error al revertir la toma', 'error');
        this.isSaving.set(false);
      }
    });
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
