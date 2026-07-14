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

  pacienteFiltro = '';

  tomas = signal<Toma[]>([]);
  toast = signal<{ msg: string; type: 'success' | 'error' } | null>(null);

  tomasFiltradas = computed(() =>
    this.pacienteFiltro
      ? this.tomas().filter(t => t.paciente === this.pacienteFiltro)
      : this.tomas()
  );

  pacientesUnicos = computed(() => {
    const seen = new Set<string>();
    return this.tomas().filter(t => {
      if (seen.has(t.paciente)) return false;
      seen.add(t.paciente);
      return true;
    });
  });

  completadas = computed(() => this.tomas().filter(t => t.estado === 'tomado').length);
  pendientes = computed(() => this.tomas().filter(t => t.estado === 'pendiente').length);
  omitidas = computed(() => this.tomas().filter(t => t.estado === 'omitido').length);

  private readonly colors = ['#2E86AB', '#52B788', '#E76F51', '#F4A261', '#457B9D', '#1D3557'];

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
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
        this.tomas.set(allTomas);
      },
      error: err => {
        console.error('Error al cargar datos', err);
        this.showToast('Error al cargar tomas', 'error');
      }
    });
  }

  registrar(t: Toma, estado: EstadoToma): void {
    if (estado !== 'tomado') return; // We only support marking as 'tomado' via API in this view for now

    const request: RegistroTomaRequest = {
      idRegistro: t.id,
      metodoConfirmacion: 'manual_cuidador'
    };

    this.registroTomaService.confirmarToma(request).subscribe({
      next: () => {
        this.tomas.update(list => list.map(x => x.id === t.id ? { ...x, estado: 'tomado' } : x));
        this.showToast(`Toma de ${t.medicamento} registrada correctamente`, 'success');
      },
      error: (err) => {
        console.error('Error al confirmar', err);
        this.showToast(`Error al confirmar toma de ${t.medicamento}`, 'error');
      }
    });
  }

  revertir(t: Toma): void {
    // Note: the backend does not currently support reverting a confirmation. 
    // This just updates the frontend state.
    this.tomas.update(list => list.map(x => x.id === t.id ? { ...x, estado: 'pendiente' } : x));
    this.showToast('Toma revertida a pendiente (solo visual)', 'success');
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
