import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { VinculacionService, SolicitudVinculacion } from '../../../../core/services/vinculacion.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificaciones.component.html',
  styleUrls: ['./notificaciones.component.scss']
})
export class NotificacionesComponent implements OnInit, OnDestroy {
  private vinculacionService = inject(VinculacionService);
  private notificationService = inject(NotificationService);

  solicitudes = signal<SolicitudVinculacion[]>([]);
  toast = signal<{msg: string, type: string} | null>(null);
  loading = signal(false);

  private sseSubscription: Subscription | null = null;

  ngOnInit() {
    this.cargarSolicitudes();

    // Conectar al stream SSE e iniciar escucha de eventos de vinculación
    this.notificationService.conectar();
    this.sseSubscription = this.notificationService.vinculacion$.subscribe(evento => {
      if (evento.tipo === 'NUEVA_SOLICITUD') {
        this.cargarSolicitudes();
        this.showToast('📬 Nueva solicitud de cuidado recibida.', 'success');
      }
    });
  }

  ngOnDestroy() {
    this.sseSubscription?.unsubscribe();
    // No desconectamos el SSE global aquí — otros componentes pueden usarlo
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
          this.showToast(`Solicitud ${aceptar ? 'aceptada' : 'rechazada'} exitosamente.`, 'success');
          this.cargarSolicitudes(); // Recargar la lista
        }
      },
      error: (err) => {
        this.showToast('Error: ' + (err.error?.message || 'No se pudo responder la solicitud.'), 'error');
      }
    });
  }

  showToast(msg: string, type: 'success' | 'error' | 'info' = 'success') {
    this.toast.set({ msg, type });
    setTimeout(() => this.toast.set(null), 3000);
  }
}
