import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VinculacionService, CuidadorPublic } from '../../../../core/services/vinculacion.service';
import { AdultoMayorService } from '../../../../core/services/adulto-mayor.service';
import { AdultoMayor } from '../../../../core/models/adulto-mayor.model';

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

  busquedaIA = '';
  iaMensaje  = signal<string | null>(null);
  filtroEsp  = signal<string[]>([]);
  filtroDisp = '';
  filtroCalif = '0';
  ordenar    = 'cal';

  especialidades = ['Adultos mayores', 'Diabetes', 'Fisioterapia', 'Alzheimer/demencia', 'Rehabilitación', 'Enfermería'];

  cuidadores = signal<CuidadorPublic[]>([]);
  adultos = signal<AdultoMayor[]>([]);
  
  // Modal state
  modalOpen = signal(false);
  perfilModalOpen = signal(false);
  cuidadorSeleccionado = signal<CuidadorPublic | null>(null);
  adultoSeleccionadoId = signal<number | null>(null);
  toast = signal<string | null>(null);

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
      next: (adultos) => this.adultos.set(adultos),
      error: (err) => console.error('Error al cargar adultos', err)
    });
  }

  cuidadoresFiltrados = computed(() => {
    let res = [...this.cuidadores()];
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
    if (!q) return;
    this.iaMensaje.set(`Basado en tu búsqueda "${q}", te recomiendo cuidadores con experiencia en las áreas mencionadas.`);
  }

  resetFiltros(): void {
    this.filtroEsp.set([]);
    this.filtroDisp = '';
    this.filtroCalif = '0';
    this.iaMensaje.set(null);
    this.busquedaIA = '';
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
  }

  abrirPerfil(cuidador: CuidadorPublic) {
    this.cuidadorSeleccionado.set(cuidador);
    this.perfilModalOpen.set(true);
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
            this.showToast('Solicitud enviada. Esperando respuesta del cuidador.');
            this.cerrarModal();
          }
        },
        error: (err) => {
          this.showToast('Error: ' + (err.error?.message || 'No se pudo enviar la solicitud.'));
          this.cerrarModal();
        }
      });
  }

  showToast(msg: string) {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(null), 3000);
  }
}
