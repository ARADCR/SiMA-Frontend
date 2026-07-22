import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VinculacionService, CuidadorPublic } from '../../../../core/services/vinculacion.service';
import { AdultoMayorService } from '../../../../core/services/adulto-mayor.service';
import { AdultoMayor } from '../../../../core/models/adulto-mayor.model';
import { AiService, CuidadorRankeado, MatchCuidadorResponse } from '../../../../core/services/ai.service';

@Component({
  selector: 'app-buscar-cuidador',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './buscar-cuidador.component.html',
  styleUrls: ['./buscar-cuidador.component.scss']
})
export class BuscarCuidadorComponent implements OnInit {
  private vinculacionService = inject(VinculacionService);
  private adultoService = inject(AdultoMayorService);
  private aiService = inject(AiService);

  busquedaIA = '';
  iaMensaje  = signal<string | null>(null);
  buscandoIA = signal(false);
  rankeados  = signal<Map<number, CuidadorRankeado>>(new Map());
  filtroEsp  = signal<string[]>([]);
  filtroDisp = '';
  filtroCalif = '0';
  ordenar    = 'cal';
  adultoBusquedaId = signal<number | null>(null);

  especialidades = ['Adultos mayores', 'Diabetes', 'Fisioterapia', 'Alzheimer/demencia', 'Rehabilitación', 'Enfermería'];

  cuidadores = signal<CuidadorPublic[]>([]);
  adultos = signal<AdultoMayor[]>([]);

  // Modal state
  modalOpen = signal(false);
  perfilModalOpen = signal(false);
  cuidadorSeleccionado = signal<CuidadorPublic | null>(null);
  adultoSeleccionadoId = signal<number | null>(null);
  toast = signal<{msg: string, type: string} | null>(null);
  matchResult = signal<MatchCuidadorResponse | null>(null);
  matchCargando = signal(false);

  ngOnInit() {
    this.cargarCuidadores();
    this.cargarAdultos();
  }

  cargarCuidadores() {
    this.vinculacionService.getCuidadoresDisponibles().subscribe({
      next: (res) => {
        if (res.success) {
          this.cuidadores.set(res.data);
        }
      },
      error: (err) => console.error('Error al cargar cuidadores', err)
    });
  }

  cargarAdultos() {
    this.adultoService.getMisPacientes().subscribe({
      next: (adultos) => {
        this.adultos.set(adultos);
        if (adultos.length > 0) this.adultoBusquedaId.set(adultos[0].idAdulto);
      },
      error: (err) => console.error('Error al cargar adultos', err)
    });
  }

  rankeado(idUsuario: number): CuidadorRankeado | undefined {
    return this.rankeados().get(idUsuario);
  }

  cuidadoresFiltrados = computed(() => {
    const rankeados = this.rankeados();
    let res = [...this.cuidadores()];

    if (rankeados.size > 0) {
      res = res.filter(c => rankeados.has(c.idUsuario));
      res.sort((a, b) => (rankeados.get(b.idUsuario)?.scoreRelevancia ?? 0) - (rankeados.get(a.idUsuario)?.scoreRelevancia ?? 0));
      return res;
    }

    if (this.filtroEsp().length > 0) {
      res = res.filter(c => this.filtroEsp().some(e =>
        c.especialidad.toLowerCase().includes(e.toLowerCase())
      ));
    }
    const min = parseFloat(this.filtroCalif);
    if (min > 0) res = res.filter(c => c.calificacion >= min);
    if (this.ordenar === 'cal') res.sort((a, b) => b.calificacion - a.calificacion);
    else if (this.ordenar === 'precio') res.sort((a, b) => parseInt(a.precio.replace(/\D/g, '')) - parseInt(b.precio.replace(/\D/g, '')));
    else if (this.ordenar === 'exp') res.sort((a, b) => parseInt(b.experiencia) - parseInt(a.experiencia));
    return res;
  });

  starsArr(cal: number): boolean[] {
    return [1, 2, 3, 4, 5].map(i => i <= Math.round(cal));
  }

  toggleEsp(e: string): void {
    this.filtroEsp.update(list => list.includes(e) ? list.filter(x => x !== e) : [...list, e]);
  }

  buscarIA(): void {
    const q = this.busquedaIA.trim();
    const idAdulto = this.adultoBusquedaId();
    if (!q || !idAdulto) return;

    this.buscandoIA.set(true);
    this.aiService.buscarCuidadorIA(q, idAdulto).subscribe({
      next: (resp) => {
        this.buscandoIA.set(false);
        this.iaMensaje.set(resp.resumenBusqueda);
        this.rankeados.set(new Map(resp.cuidadoresRankeados.map(c => [c.idUsuario, c])));
      },
      error: () => {
        this.buscandoIA.set(false);
        this.iaMensaje.set('No se pudo procesar la búsqueda en este momento. Intentá nuevamente en unos minutos.');
        this.rankeados.set(new Map());
      }
    });
  }

  resetFiltros(): void {
    this.filtroEsp.set([]);
    this.filtroDisp = '';
    this.filtroCalif = '0';
    this.iaMensaje.set(null);
    this.busquedaIA = '';
    this.rankeados.set(new Map());
  }

  getInitials(nombre: string, apellido: string): string {
    return (nombre.charAt(0) + (apellido ? apellido.charAt(0) : '')).toUpperCase();
  }

  abrirModalSolicitud(cuidador: CuidadorPublic) {
    this.cuidadorSeleccionado.set(cuidador);
    if (this.adultos().length === 1) {
      this.adultoSeleccionadoId.set(this.adultos()[0].idAdulto);
    } else {
      this.adultoSeleccionadoId.set(null);
    }
    this.modalOpen.set(true);
  }

  cerrarModal() {
    this.modalOpen.set(false);
    this.perfilModalOpen.set(false);
    this.cuidadorSeleccionado.set(null);
    this.adultoSeleccionadoId.set(null);
    this.matchResult.set(null);
  }

  abrirPerfil(cuidador: CuidadorPublic) {
    this.cuidadorSeleccionado.set(cuidador);
    this.perfilModalOpen.set(true);
    this.matchResult.set(null);

    const idAdulto = this.adultoBusquedaId() ?? (this.adultos().length > 0 ? this.adultos()[0].idAdulto : null);
    if (idAdulto) {
      this.matchCargando.set(true);
      this.aiService.matchCuidador(cuidador.idUsuario, idAdulto).subscribe({
        next: (resp) => { this.matchCargando.set(false); this.matchResult.set(resp); },
        error: () => { this.matchCargando.set(false); this.matchResult.set(null); }
      });
    }
  }

  abrirModalDesdePerfil() {
    this.perfilModalOpen.set(false);
    if (this.cuidadorSeleccionado()) {
      this.abrirModalSolicitud(this.cuidadorSeleccionado()!);
    }
  }

  enviarSolicitud() {
    if (!this.adultoSeleccionadoId() || !this.cuidadorSeleccionado()) return;
    
    this.vinculacionService.enviarSolicitud(this.adultoSeleccionadoId()!, this.cuidadorSeleccionado()!.idUsuario)
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.showToast('Solicitud enviada. Esperando respuesta del cuidador.', 'success');
            this.cerrarModal();
          }
        },
        error: (err) => {
          this.showToast('Error: ' + (err.error?.message || 'No se pudo enviar la solicitud.'), 'error');
          this.cerrarModal();
        }
      });
  }

  showToast(msg: string, type: 'success' | 'error' | 'info' = 'success') {
    this.toast.set({ msg, type });
    setTimeout(() => this.toast.set(null), 3000);
  }
}
