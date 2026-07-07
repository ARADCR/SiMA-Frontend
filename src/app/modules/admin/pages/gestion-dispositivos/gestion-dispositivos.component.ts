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
  
  // Form state
  identificadorFisico = '';
  tipoDispositivo: 'pastillero_esp32' | 'pulsera_inteligente' = 'pastillero_esp32';
  idAdulto: number | null = null;
  
  toastMsg = '';

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
    this.showModal = true;
  }

  abrirModalEdicion(dispositivo: DispositivoIot) {
    this.isEdit = true;
    this.modalDispositivoId = dispositivo.idDispositivo;
    this.identificadorFisico = dispositivo.identificadorFisico;
    this.tipoDispositivo = dispositivo.tipoDispositivo;
    this.idAdulto = dispositivo.idAdulto || null;
    this.showModal = true;
  }

  cerrarModal() {
    this.showModal = false;
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

  desasignar(dispositivo: DispositivoIot) {
    if (confirm('¿Confirmar desasignación? El dispositivo quedará libre para ser reasignado.')) {
      this.dispositivoService.desasignar(dispositivo.idDispositivo).subscribe({
        next: (res) => {
          this.mostrarToast(res.message || res.mensaje || 'Dispositivo desasignado');
          this.cargarDispositivos();
        },
        error: (err) => this.mostrarToast(err.error?.mensaje || 'Error al desasignar')
      });
    }
  }

  mostrarToast(msg: string) {
    this.toastMsg = msg;
    setTimeout(() => this.toastMsg = '', 4000);
  }
}
