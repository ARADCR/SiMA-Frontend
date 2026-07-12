import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DispositivoIotService } from '../../../../core/services/dispositivo-iot.service';
import { DispositivoIot, DispositivoIotRequest } from '../../../../core/models/dispositivo-iot.model';
import { AdultoMayorService } from '../../../../core/services/adulto-mayor.service';

@Component({
  selector: 'app-gestion-dispositivos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-dispositivos.component.html',
  styleUrls: ['./gestion-dispositivos.component.scss']
})
export class GestionDispositivosComponent implements OnInit {
  dispositivos: DispositivoIot[] = [];
  adultos: any[] = [];
  filtroActual: 'todos' | 'asignados' | 'libres' = 'todos';
  
  // Modals state
  showModal = false;
  isEdit = false;
  modalDispositivoId: number | null = null;
  
  // Modal de asignación rápida
  showAsignarModal = false;
  dispositivoParaAsignar: DispositivoIot | null = null;
  idAdultoAsignar: number | null = null;
  searchAdultoAsignar = '';
  dropdownAdultoAsignarOpen = false;

  // Modal confirmación desasignar
  showConfirmModal = false;
  dispositivoParaDesasignar: DispositivoIot | null = null;
  desasignando = false;
  
  // Form state
  identificadorFisico = '';
  tipoDispositivo: 'pastillero_esp32' | 'pulsera_inteligente' = 'pastillero_esp32';
  idAdulto: number | null = null;
  searchAdultoRegistro = '';
  dropdownAdultoRegistroOpen = false;
  
  toastMsg = '';
  toastTipo: 'success' | 'error' | 'info' = 'info';

  constructor(
    private dispositivoService: DispositivoIotService,
    private adultoService: AdultoMayorService
  ) {}

  ngOnInit(): void {
    this.cargarDispositivos();
    this.cargarAdultos();
  }

  cargarDispositivos() {
    this.dispositivoService.listar().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.dispositivos = res.data;
        }
      },
      error: (err) => this.mostrarToast(err.error?.mensaje || 'Error al cargar dispositivos')
    });
  }

  cargarAdultos() {
    this.adultoService.getAllAdmin().subscribe({
      next: (adultos) => {
        if (adultos) {
          this.adultos = adultos;
        }
      },
      error: (err) => this.mostrarToast('Error al cargar adultos')
    });
  }

  get adultosFiltradosAsignar() {
    if (!this.searchAdultoAsignar) return this.adultos;
    const term = this.searchAdultoAsignar.toLowerCase();
    return this.adultos.filter(a => 
      a.nombre.toLowerCase().includes(term) || 
      a.apellido.toLowerCase().includes(term)
    );
  }

  get adultosFiltradosRegistro() {
    if (!this.searchAdultoRegistro) return this.adultos;
    const term = this.searchAdultoRegistro.toLowerCase();
    return this.adultos.filter(a => 
      a.nombre.toLowerCase().includes(term) || 
      a.apellido.toLowerCase().includes(term)
    );
  }

  getNombreAdulto(id: number | null): string {
    if (!id) return '— Seleccionar paciente —';
    const a = this.adultos.find(x => x.idAdulto === id);
    return a ? `${a.nombre} ${a.apellido}` : '— Seleccionar paciente —';
  }

  get dispositivosFiltrados() {
    if (this.filtroActual === 'asignados') {
      return this.dispositivos.filter(d => d.idAdulto !== null);
    }
    if (this.filtroActual === 'libres') {
      return this.dispositivos.filter(d => d.idAdulto === null);
    }
    return this.dispositivos;
  }

  setFiltro(filtro: 'todos' | 'asignados' | 'libres') {
    this.filtroActual = filtro;
  }

  abrirModalRegistro() {
    this.isEdit = false;
    this.modalDispositivoId = null;
    this.identificadorFisico = '';
    this.tipoDispositivo = 'pastillero_esp32';
    this.idAdulto = null;
    this.searchAdultoRegistro = '';
    this.dropdownAdultoRegistroOpen = false;
    this.showModal = true;
  }

  abrirModalEdicion(dispositivo: DispositivoIot) {
    this.isEdit = true;
    this.modalDispositivoId = dispositivo.idDispositivo;
    this.identificadorFisico = dispositivo.identificadorFisico;
    this.tipoDispositivo = dispositivo.tipoDispositivo;
    this.idAdulto = dispositivo.idAdulto || null;
    this.searchAdultoRegistro = '';
    this.dropdownAdultoRegistroOpen = false;
    this.showModal = true;
  }

  cerrarModal() {
    this.showModal = false;
    this.dropdownAdultoRegistroOpen = false;
  }

  seleccionarAdultoRegistro(id: number | null) {
    this.idAdulto = id;
    this.dropdownAdultoRegistroOpen = false;
    this.searchAdultoRegistro = '';
  }

  guardarDispositivo() {
    if (!this.identificadorFisico.trim()) {
      this.mostrarToast('El identificador físico es obligatorio');
      return;
    }

    const req: DispositivoIotRequest = {
      identificadorFisico: this.identificadorFisico,
      tipoDispositivo: this.tipoDispositivo,
      idAdulto: this.idAdulto
    };

    if (this.isEdit && this.modalDispositivoId) {
      this.dispositivoService.actualizar(this.modalDispositivoId, req).subscribe({
        next: (res) => {
          this.mostrarToast(res.message || res.mensaje || 'Dispositivo actualizado exitosamente');
          this.cerrarModal();
          this.cargarDispositivos();
        },
        error: (err) => this.mostrarToast(err.error?.mensaje || 'Error al actualizar')
      });
    } else {
      this.dispositivoService.registrar(req).subscribe({
        next: (res) => {
          this.mostrarToast(res.message || res.mensaje || 'Dispositivo registrado exitosamente');
          this.cerrarModal();
          this.cargarDispositivos();
        },
        error: (err) => this.mostrarToast(err.error?.mensaje || 'Error al registrar')
      });
    }
  }

  abrirModalAsignar(dispositivo: DispositivoIot) {
    this.dispositivoParaAsignar = dispositivo;
    this.idAdultoAsignar = null;
    this.searchAdultoAsignar = '';
    this.dropdownAdultoAsignarOpen = false;
    this.showAsignarModal = true;
  }

  cerrarModalAsignar() {
    this.showAsignarModal = false;
    this.dispositivoParaAsignar = null;
    this.idAdultoAsignar = null;
    this.dropdownAdultoAsignarOpen = false;
  }

  seleccionarAdultoAsignar(id: number | null) {
    this.idAdultoAsignar = id;
    this.dropdownAdultoAsignarOpen = false;
    this.searchAdultoAsignar = '';
  }

  confirmarAsignacion() {
    if (!this.dispositivoParaAsignar || !this.idAdultoAsignar) {
      this.mostrarToast('Debe seleccionar un paciente');
      return;
    }
    
    this.dispositivoService.asignar(this.dispositivoParaAsignar.idDispositivo, this.idAdultoAsignar).subscribe({
      next: (res) => {
        this.mostrarToast(res.message || res.mensaje || 'Dispositivo asignado exitosamente');
        this.cerrarModalAsignar();
        this.cargarDispositivos();
      },
      error: (err) => {
        this.mostrarToast(err.error?.mensaje || 'Error al asignar');
      }
    });
  }

  abrirModalDesasignar(dispositivo: DispositivoIot) {
    this.dispositivoParaDesasignar = dispositivo;
    this.showConfirmModal = true;
  }

  cerrarModalDesasignar() {
    this.showConfirmModal = false;
    this.dispositivoParaDesasignar = null;
    this.desasignando = false;
  }

  confirmarDesasignacion() {
    if (!this.dispositivoParaDesasignar) return;
    this.desasignando = true;
    
    this.dispositivoService.desasignar(this.dispositivoParaDesasignar.idDispositivo).subscribe({
      next: (res) => {
        this.mostrarToast(res.message || res.mensaje || 'Dispositivo desasignado exitosamente');
        this.cerrarModalDesasignar();
        this.cargarDispositivos();
      },
      error: (err) => {
        this.mostrarToast(err.error?.mensaje || 'Error al desasignar');
        this.desasignando = false;
      }
    });
  }

  mostrarToast(msg: string) {
    this.toastMsg = msg;
    setTimeout(() => this.toastMsg = '', 4000);
  }
}
