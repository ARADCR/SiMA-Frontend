import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';

export interface RecordatorioMedicamento {
  idMedicamento: number;
  nombre: string;
  dosis: string;
  hora: string;
  idAlerta: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private eventSource: EventSource | null = null;
  private recordatorioSubject = new Subject<RecordatorioMedicamento>();

  constructor(private authService: AuthService, private zone: NgZone) {}

  /**
   * Inicia la conexión SSE con el backend para recibir notificaciones en tiempo real.
   */
  conectar(): void {
    if (this.eventSource) {
      return; // Ya está conectado
    }

    const token = this.authService.obtenerToken();
    if (!token) return;

    // Conectar usando el token como query param (soportado por EventSource nativo)
    const url = `${environment.apiUrl}/notifications/subscribe?token=${token}`;
    this.eventSource = new EventSource(url);

    this.eventSource.onopen = () => {
      console.log('Conexión SSE establecida con éxito.');
    };

    // Escuchar eventos de INIT (opcional)
    this.eventSource.addEventListener('INIT', (event: MessageEvent) => {
      console.log('SSE Init:', event.data);
    });

    // Escuchar eventos de RECORDATORIO_MEDICAMENTO
    this.eventSource.addEventListener('RECORDATORIO_MEDICAMENTO', (event: MessageEvent) => {
      // EventSource callbacks se ejecutan fuera de la zona de Angular a veces, 
      // aseguramos que corran dentro de la zona para actualizar la UI
      this.zone.run(() => {
        try {
          const data = JSON.parse(event.data) as RecordatorioMedicamento;
          this.recordatorioSubject.next(data);
        } catch (e) {
          console.error('Error parseando payload de notificación', e);
        }
      });
    });

    this.eventSource.onerror = (error) => {
      console.error('Error en conexión SSE', error);
      // EventSource intentará reconectar automáticamente, pero si el token expiró fallará
      if (this.eventSource?.readyState === EventSource.CLOSED) {
        this.desconectar();
      }
    };
  }

  desconectar(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      console.log('Conexión SSE cerrada.');
    }
  }

  get recordatorios$(): Observable<RecordatorioMedicamento> {
    return this.recordatorioSubject.asObservable();
  }
}
