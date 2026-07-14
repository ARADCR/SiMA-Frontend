import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VinculacionService, SolicitudVinculacion } from '../../../../core/services/vinculacion.service';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificaciones.component.html',
  styleUrls: ['./notificaciones.component.scss']
})
export class NotificacionesComponent implements OnInit {
  private vinculacionService = inject(VinculacionService);

  solicitudes = signal<SolicitudVinculacion[]>([]);
  toast = signal<string | null>(null);
  loading = signal(false);

  ngOnInit() {
    this.cargarSolicitudes();
  }

  cargarSolicitudes() {
    this.loading.set(true);
    this.vinculacionService.getPendientes().subscribe({
      next: (res) => {
        if (res.success) {
          this.solicitudes.set(res.data);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar solicitudes', err);
        this.loading.set(false);
      }
    });
  }

  responder(idSolicitud: number, aceptar: boolean) {
    this.vinculacionService.responderSolicitud(idSolicitud, aceptar).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast(`Solicitud ${aceptar ? 'aceptada' : 'rechazada'} exitosamente.`);
          this.cargarSolicitudes(); // Recargar la lista
        }
      },
      error: (err) => {
        this.showToast('Error: ' + (err.error?.message || 'No se pudo responder la solicitud.'));
      }
    });
  }

  showToast(msg: string) {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(null), 3000);
  }
}
