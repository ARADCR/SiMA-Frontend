import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RegistroTomaService, RegistroTomaResponse, RegistroTomaRequest } from '../../../../core/services/registro-toma.service';
import { AdultoMayorService } from '../../../../core/services/adulto-mayor.service';
import { forkJoin, map, switchMap, of, catchError } from 'rxjs';
import { AdultoMayor } from '../../../../core/models/adulto-mayor.model';

type EstadoToma = 'pendiente' | 'tomado' | 'omitido';

interface Toma {
  id: number;
  paciente: string;
  initials: string;
  avatarColor: string;
  medicamento: string;
  dosis: string;
  hora: string;
  estado: EstadoToma;
  idAdulto: number;
}

@Component({
  selector: 'app-registrar-tomas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registrar-tomas.component.html',
  styleUrls: ['./registrar-tomas.component.scss']
})
export class RegistrarTomasComponent implements OnInit {
  private registroTomaService = inject(RegistroTomaService);
  private adultoMayorService = inject(AdultoMayorService);

  pacienteFiltro = signal('');
  filtroEstado = signal('');
  busqueda = signal('');

  tomas = signal<Toma[]>([]);
  loading = signal(true);
  procesando = signal(false);
  toast = signal<{ msg: string; type: 'success' | 'error' } | null>(null);

  tomasFiltradas = computed(() => {
    let list = this.tomas();
    const paciente = this.pacienteFiltro();
    const estado = this.filtroEstado();
    const query = this.busqueda();
    if (paciente) {
      list = list.filter(t => t.paciente === paciente);
    }
    if (estado) {
      list = list.filter(t => t.estado === estado);
    }
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(t =>
        t.medicamento.toLowerCase().includes(q) ||
        t.paciente.toLowerCase().includes(q) ||
        t.dosis.toLowerCase().includes(q)
      );
    }
    return list;
  });

  pacientesUnicos = computed(() => {
    const seen = new Set<string>();
    return this.tomas().filter(t => {
      if (seen.has(t.paciente)) return false;
      seen.add(t.paciente);
      return true;
    });
  });

  completadas = computed(() => this.tomasFiltradas().filter(t => t.estado === 'tomado').length);
  pendientes = computed(() => this.tomasFiltradas().filter(t => t.estado === 'pendiente').length);
  omitidas = computed(() => this.tomasFiltradas().filter(t => t.estado === 'omitido').length);

  porcentajeProgreso = computed(() => {
    const total = this.tomas().length;
    if (total === 0) return 0;
    const completadas = this.tomas().filter(t => t.estado === 'tomado').length;
    return Math.round((completadas / total) * 100);
  });

  fechaHoy = computed(() => {
    const hoy = new Date();
    return hoy.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  });

  private readonly colors = ['#2E86AB', '#52B788', '#E76F51', '#F4A261', '#457B9D', '#1D3557'];

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.loading.set(true);
    this.adultoMayorService.getMisPacientes().pipe(
      switchMap(adultos => {
        if (!adultos || adultos.length === 0) return of([]);

        const tomasReqs = adultos.map((adulto: any) =>
          this.registroTomaService.getTomasDelDia(adulto.idAdulto).pipe(
            catchError(() => of([] as RegistroTomaResponse[])),
            map((res: RegistroTomaResponse[]) => {
              const name = `${adulto.nombre} ${adulto.apellido}`;
              const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
              const color = this.colors[adulto.idAdulto % this.colors.length];

              return res.map(toma => ({
                id: toma.idRegistro,
                paciente: name,
                initials: initials,
                avatarColor: color,
                medicamento: toma.horario.medicamento.nombre,
                dosis: toma.horario.medicamento.dosis,
                hora: toma.horario.horaProgramada.substring(0, 5),
                estado: (toma.estado === 'confirmado_manual' ? 'tomado' : toma.estado) as EstadoToma,
                idAdulto: adulto.idAdulto
              }));
            })
          )
        );
        return forkJoin(tomasReqs);
      })
    ).subscribe({
      next: (tomasList) => {
        const allTomas = tomasList.flat();
        // Ordenar por hora
        allTomas.sort((a, b) => a.hora.localeCompare(b.hora));
        this.tomas.set(allTomas);
        this.loading.set(false);
      },
      error: err => {
        console.error('Error al cargar datos', err);
        this.showToast('Error al cargar tomas', 'error');
        this.loading.set(false);
      }
    });
  }

  limpiarFiltros(): void {
    this.pacienteFiltro.set('');
    this.filtroEstado.set('');
    this.busqueda.set('');
  }

  registrar(t: Toma, estado: EstadoToma): void {
    if (estado === 'tomado') {
      this.procesando.set(true);
      const request: RegistroTomaRequest = {
        idRegistro: t.id,
        metodoConfirmacion: 'manual_cuidador'
      };

      this.registroTomaService.confirmarToma(request).subscribe({
        next: () => {
          this.tomas.update(list => list.map(x => x.id === t.id ? { ...x, estado: 'tomado' } : x));
          this.showToast(`✓ Toma de ${t.medicamento} registrada correctamente`, 'success');
          this.procesando.set(false);
        },
        error: (err) => {
          console.error('Error al confirmar', err);
          this.showToast(`Error al confirmar toma de ${t.medicamento}`, 'error');
          this.procesando.set(false);
        }
      });
    } else if (estado === 'omitido') {
      // Marcar como omitido localmente
      this.tomas.update(list => list.map(x => x.id === t.id ? { ...x, estado: 'omitido' } : x));
      this.showToast(`Toma de ${t.medicamento} marcada como omitida`, 'error');
    }
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
