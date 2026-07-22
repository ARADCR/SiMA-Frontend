import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService, AdminReportesResponse, ReporteHistorial } from '../../../../core/services/dashboard.service';
import { AdultoMayorService } from '../../../../core/services/adulto-mayor.service';
import { AdultoMayor } from '../../../../core/models/adulto-mayor.model';

@Component({
  selector: 'app-reportes-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes-admin.component.html',
  styleUrls: ['./reportes-admin.component.scss']
})
export class ReportesAdminComponent implements OnInit {
  isLoading = signal(true);

  readonly stats = signal<Omit<AdminReportesResponse, 'historial'>>({
    cumplimientoPromedio: 0,
    tomasRegistradasSemana: 0,
    alertasGeneradas: 0,
    alertasActivas: 0,
    cuidadoresActivos: 0
  });

  readonly historial = signal<ReporteHistorial[]>([]);
  readonly adultos = signal<AdultoMayor[]>([]);

  // Modal State
  showModal = signal(false);
  isSaving = signal(false);

  // Toast notifications
  toastMessage = signal('');
  toastType = signal<'success' | 'error'>('success');
  toastVisible = signal(false);

  // Delete Modal State
  showDeleteModal = signal(false);
  reportToDelete = signal<number | null>(null);

  // Download tracking
  downloadingId = signal<number | null>(null);

  formReporte = {
    nombre: '',
    tipo: 'Mensual',
    tipoReporte: 'General',
    adultoMayorId: '',
    fechaInicio: '',
    fechaFin: ''
  };

  constructor(
    private dashboardService: DashboardService,
    private adultoService: AdultoMayorService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
    this.cargarAdultos();
  }

  cargarDatos(): void {
    this.isLoading.set(true);
    this.dashboardService.getAdminReportes().subscribe({
      next: (res) => {
        this.stats.set({
          cumplimientoPromedio: res.cumplimientoPromedio,
          tomasRegistradasSemana: res.tomasRegistradasSemana,
          alertasGeneradas: res.alertasGeneradas,
          alertasActivas: res.alertasActivas,
          cuidadoresActivos: res.cuidadoresActivos
        });
        this.historial.set(res.historial);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading reportes', err);
        this.isLoading.set(false);
        this.showToast('Error al cargar las estadísticas del sistema.', 'error');
      }
    });
  }

  cargarAdultos(): void {
    this.adultoService.getAllAdmin().subscribe({
      next: (data) => this.adultos.set(data),
      error: (err) => console.error('Error al cargar adultos mayores', err)
    });
  }

  actualizarNombreSugerido(): void {
    const tipoRep = this.formReporte.tipoReporte === 'General'
      ? 'Monitoreo General'
      : this.formReporte.tipoReporte === 'Medicacion'
        ? 'Cumplimiento de Medicación'
        : 'Alertas e Incidentes';

    let pac = 'Todos los Adultos';
    if (this.formReporte.adultoMayorId) {
      const selected = this.adultos().find(a => a.idAdulto === Number(this.formReporte.adultoMayorId));
      if (selected) {
        pac = `${selected.nombre} ${selected.apellido}`;
      }
    }

    const periodo = this.formReporte.tipo;
    this.formReporte.nombre = `${tipoRep} — ${pac} — ${periodo}`;
  }

  abrirModal(): void {
    this.formReporte = {
      nombre: '',
      tipo: 'Mensual',
      tipoReporte: 'General',
      adultoMayorId: '',
      fechaInicio: '',
      fechaFin: ''
    };
    this.actualizarNombreSugerido();
    this.showModal.set(true);
  }

  cerrarModal(): void {
    this.showModal.set(false);
    this.isSaving.set(false);
  }

  guardarReporte(): void {
    if (!this.formReporte.nombre.trim()) return;

    // Validate custom date range
    if (this.formReporte.tipo === 'Personalizado') {
      if (!this.formReporte.fechaInicio || !this.formReporte.fechaFin) {
        this.showToast('Selecciona las fechas de inicio y fin para el rango personalizado.', 'error');
        return;
      }
      if (this.formReporte.fechaInicio > this.formReporte.fechaFin) {
        this.showToast('La fecha de inicio no puede ser posterior a la fecha de fin.', 'error');
        return;
      }
    }

    this.isSaving.set(true);

    // Build payload — omit adultoMayorId when empty to avoid backend null issues
    const payload: Record<string, any> = {
      nombre: this.formReporte.nombre,
      tipo: this.formReporte.tipo,
      tipoReporte: this.formReporte.tipoReporte
    };

    if (this.formReporte.adultoMayorId) {
      payload['adultoMayorId'] = Number(this.formReporte.adultoMayorId);
    }

    if (this.formReporte.tipo === 'Personalizado') {
      payload['fechaInicio'] = this.formReporte.fechaInicio;
      payload['fechaFin'] = this.formReporte.fechaFin;
    }

    this.dashboardService.createReporte(payload).subscribe({
      next: () => {
        this.cerrarModal();
        this.cargarDatos();
        this.showToast('Reporte generado exitosamente. Ya puedes descargarlo en PDF.', 'success');
      },
      error: (err) => {
        console.error('Error al generar reporte', err);
        this.isSaving.set(false);
        this.showToast('Ocurrió un error al generar el reporte. Inténtalo de nuevo.', 'error');
      }
    });
  }

  descargarReporte(id: number, nombre: string): void {
    this.downloadingId.set(id);
    this.dashboardService.downloadReporte(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${nombre.replace(/[\s\—]+/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.downloadingId.set(null);
        this.showToast('PDF descargado correctamente.', 'success');
      },
      error: (err) => {
        console.error('Error al descargar el archivo PDF', err);
        this.downloadingId.set(null);
        this.showToast('Error al descargar el PDF. Inténtalo de nuevo.', 'error');
      }
    });
  }

  confirmarEliminar(id: number): void {
    this.reportToDelete.set(id);
    this.showDeleteModal.set(true);
  }

  cancelarEliminar(): void {
    this.showDeleteModal.set(false);
    this.reportToDelete.set(null);
  }

  ejecutarEliminar(): void {
    const id = this.reportToDelete();
    if (id === null) return;

    this.dashboardService.deleteReporte(id).subscribe({
      next: () => {
        this.showToast('Reporte eliminado exitosamente.', 'success');
        this.cancelarEliminar();
        this.cargarDatos();
      },
      error: (err) => {
        console.error('Error al eliminar el reporte', err);
        this.showToast('Ocurrió un error al eliminar el reporte.', 'error');
        this.cancelarEliminar();
      }
    });
  }

  // Toast notification helper
  private showToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.toastVisible.set(true);
    setTimeout(() => this.toastVisible.set(false), 4000);
  }

  closeToast(): void {
    this.toastVisible.set(false);
  }
}
