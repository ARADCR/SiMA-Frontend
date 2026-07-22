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

export interface EventoVinculacion {
  tipo: 'NUEVA_SOLICITUD' | 'SOLICITUD_ACEPTADA' | 'SOLICITUD_RECHAZADA';
  mensaje: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private eventSource: EventSource | null = null;
  private recordatorioSubject = new Subject<RecordatorioMedicamento>();
  private vinculacionSubject = new Subject<EventoVinculacion>();

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

    // Conectar usando el token como query param.
    // withCredentials: false evita el conflicto CORS cuando el backend tiene allowCredentials(true)
    const url = `${environment.apiUrl}/notifications/subscribe?token=${encodeURIComponent(token)}`;
    console.log('[SSE] Conectando a:', url.replace(token, token.substring(0, 20) + '...'));
    this.eventSource = new EventSource(url, { withCredentials: false });

    this.eventSource.onopen = () => {
      console.log('Conexión SSE establecida con éxito.');
    };

    // Escuchar eventos de INIT (opcional)
    this.eventSource.addEventListener('INIT', (event: MessageEvent) => {
      console.log('SSE Init:', event.data);
    });

    // Escuchar eventos de RECORDATORIO_MEDICAMENTO
    this.eventSource.addEventListener('RECORDATORIO_MEDICAMENTO', (event: MessageEvent) => {
      this.zone.run(() => {
        try {
          const data = JSON.parse(event.data) as RecordatorioMedicamento;
          this.recordatorioSubject.next(data);
        } catch (e) {
          console.error('Error parseando payload de notificación', e);
        }
      });
    });

    // Escuchar eventos de vinculación (solicitudes entre Familiar y Cuidador)
    const eventosVinculacion: EventoVinculacion['tipo'][] = [
      'NUEVA_SOLICITUD',
      'SOLICITUD_ACEPTADA',
      'SOLICITUD_RECHAZADA'
    ];

    eventosVinculacion.forEach(tipo => {
      this.eventSource!.addEventListener(tipo, (event: MessageEvent) => {
        this.zone.run(() => {
          this.vinculacionSubject.next({ tipo, mensaje: event.data });
        });
      });
    });

    this.eventSource.onerror = (error) => {
      console.error('[SSE] Error de conexión. readyState:', this.eventSource?.readyState, error);
      if (this.eventSource?.readyState === EventSource.CLOSED) {
        console.warn('[SSE] Conexión cerrada definitivamente. Desconectando.');
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

  get vinculacion$(): Observable<EventoVinculacion> {
    return this.vinculacionSubject.asObservable();
  }
}
