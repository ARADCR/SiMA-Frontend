import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdultoMayorService } from '../../../../core/services/adulto-mayor.service';
import { AdultoMayor, AdultoMayorCreate, AdultoMayorUpdate } from '../../../../core/models/adulto-mayor.model';

interface AdultoForm {
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  condicionesMedicas: string;
  contactoMedico: string;
}

@Component({
  selector: 'app-gestion-adultos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-adultos.component.html',
  styleUrls: ['./gestion-adultos.component.scss']
})
export class GestionAdultosComponent implements OnInit {
  adultos: AdultoMayor[] = [];
  busqueda = '';
  estadoFiltro: 'todos' | 'activo' | 'inactivo' = 'todos';

  // Modal crear/editar
  showModal = false;
  isEdit = false;
  editandoId: number | null = null;
  form: AdultoForm = this.formVacio();
  guardando = false;

  // Modal eliminar
  showDeleteModal = false;
  adultoParaEliminar: AdultoMayor | null = null;
  eliminando = false;

  // Toast
  toastMsg = '';
  toastTipo: 'success' | 'error' = 'success';

  constructor(private adultoService: AdultoMayorService) {}

  ngOnInit(): void {
    this.cargarAdultos();
  }

  cargarAdultos(): void {
    this.adultoService.getAllAdmin().subscribe({
      next: (data) => this.adultos = data,
      error: (err) => this.mostrarToast(err.mensaje || 'Error al cargar adultos mayores', 'error')
    });
  }

  // ── Filtros ──────────────────────────────────────────────────────

  get adultosFiltrados(): AdultoMayor[] {
    const txt = this.busqueda.toLowerCase();
    return this.adultos.filter(a => {
      const matchTxt = !txt
        || `${a.nombre} ${a.apellido}`.toLowerCase().includes(txt)
        || (a.familiarNombre || '').toLowerCase().includes(txt)
        || (a.condicionesMedicas || '').toLowerCase().includes(txt);
      const matchEst = this.estadoFiltro === 'todos'
        || (this.estadoFiltro === 'activo' ? a.activo : !a.activo);
      return matchTxt && matchEst;
    });
  }

  get totalRegistrados(): number { return this.adultos.length; }
  get totalActivos(): number { return this.adultos.filter(a => a.activo).length; }
  get totalInactivos(): number { return this.adultos.filter(a => !a.activo).length; }
  get conFamiliar(): number { return this.adultos.filter(a => !!a.familiarNombre).length; }

  setFiltro(filtro: 'todos' | 'activo' | 'inactivo'): void {
    this.estadoFiltro = filtro;
  }

  // ── Helpers ──────────────────────────────────────────────────────

  getInitials(a: AdultoMayor): string {
    return ((a.nombre?.[0] || '') + (a.apellido?.[0] || '')).toUpperCase();
  }

  getAvatarColor(a: AdultoMayor): string {
    const colors = ['#2E86AB', '#52B788', '#E76F51', '#F4A261', '#6C63FF', '#9B5DE5', '#00BBF9', '#00F5D4'];
    return colors[(a.idAdulto || 0) % colors.length];
  }

  calcularEdad(fechaNac: string): number | null {
    if (!fechaNac) return null;
    const hoy = new Date();
    const nac = new Date(fechaNac);
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
  }

  // ── Modal Crear / Editar ─────────────────────────────────────────

  abrirModalCrear(): void {
    this.isEdit = false;
    this.editandoId = null;
    this.form = this.formVacio();
    this.showModal = true;
  }

  abrirModalEditar(a: AdultoMayor): void {
    this.isEdit = true;
    this.editandoId = a.idAdulto;
    this.form = {
      nombre: a.nombre,
      apellido: a.apellido,
      fechaNacimiento: a.fechaNacimiento ? a.fechaNacimiento.substring(0, 10) : '',
      condicionesMedicas: a.condicionesMedicas || '',
      contactoMedico: a.contactoMedico || ''
    };
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.guardando = false;
  }

  guardar(): void {
    if (!this.form.nombre.trim() || !this.form.apellido.trim()) {
      this.mostrarToast('Nombre y apellido son obligatorios', 'error');
      return;
    }
    this.guardando = true;

    if (this.isEdit && this.editandoId) {
      const dto: AdultoMayorUpdate = {
        nombre: this.form.nombre,
        apellido: this.form.apellido,
        fechaNacimiento: this.form.fechaNacimiento || undefined,
        condicionesMedicas: this.form.condicionesMedicas || undefined,
        contactoMedico: this.form.contactoMedico || undefined
      };
      this.adultoService.update(this.editandoId, dto).subscribe({
        next: () => {
          this.mostrarToast('Adulto mayor actualizado exitosamente', 'success');
          this.cerrarModal();
          this.cargarAdultos();
        },
        error: (err) => {
          this.mostrarToast(err.mensaje || 'Error al actualizar', 'error');
          this.guardando = false;
        }
      });
    } else {
      const dto: AdultoMayorCreate = {
        nombre: this.form.nombre,
        apellido: this.form.apellido,
        fechaNacimiento: this.form.fechaNacimiento || undefined as any,
        condicionesMedicas: this.form.condicionesMedicas || undefined,
        contactoMedico: this.form.contactoMedico || undefined
      };
      this.adultoService.create(dto).subscribe({
        next: () => {
          this.mostrarToast('Adulto mayor registrado exitosamente', 'success');
          this.cerrarModal();
          this.cargarAdultos();
        },
        error: (err) => {
          this.mostrarToast(err.mensaje || 'Error al registrar', 'error');
          this.guardando = false;
        }
      });
    }
  }

  // ── Modal Estado (Activar/Desactivar) ──────────────────────────

  abrirModalEstado(a: AdultoMayor): void {
    this.adultoParaEliminar = a;
    this.showDeleteModal = true;
  }

  cerrarModalEstado(): void {
    this.showDeleteModal = false;
    this.adultoParaEliminar = null;
    this.eliminando = false;
  }

  confirmarEstado(): void {
    if (!this.adultoParaEliminar) return;
    this.eliminando = true;
    
    if (this.adultoParaEliminar.activo) {
      this.adultoService.delete(this.adultoParaEliminar.idAdulto).subscribe({
        next: () => {
          this.mostrarToast('Adulto mayor desactivado exitosamente', 'success');
          this.cerrarModalEstado();
          this.cargarAdultos();
        },
        error: (err) => {
          this.mostrarToast(err.mensaje || 'Error al desactivar', 'error');
          this.eliminando = false;
        }
      });
    } else {
      this.adultoService.reactivar(this.adultoParaEliminar.idAdulto).subscribe({
        next: () => {
          this.mostrarToast('Adulto mayor reactivado exitosamente', 'success');
          this.cerrarModalEstado();
          this.cargarAdultos();
        },
        error: (err) => {
          this.mostrarToast(err.mensaje || 'Error al reactivar', 'error');
          this.eliminando = false;
        }
      });
    }
  }

  // ── Toast ────────────────────────────────────────────────────────

  private mostrarToast(msg: string, tipo: 'success' | 'error' = 'success'): void {
    this.toastMsg = msg;
    this.toastTipo = tipo;
    setTimeout(() => this.toastMsg = '', 4000);
  }

  private formVacio(): AdultoForm {
    return { nombre: '', apellido: '', fechaNacimiento: '', condicionesMedicas: '', contactoMedico: '' };
  }
}
