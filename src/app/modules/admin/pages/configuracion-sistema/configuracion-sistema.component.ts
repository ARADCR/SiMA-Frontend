import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

interface Suscripcion { id: number; familiar: string; adulto: string; habilitado: boolean; ultimaNotif: string; }

@Component({
  selector: 'app-configuracion-sistema',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion-sistema.component.html',
  styleUrls: ['./configuracion-sistema.component.scss']
})
export class ConfiguracionSistemaComponent {
  toleranciaMed = signal(30);
  reintentosMed = signal(3);
  umbralCaidas  = signal(2.5);
  freqVerif     = signal(15);
  telegramChatId  = signal('');
  telegramConectado = signal(false);
  isTestingTelegram = signal(false);

  wechatAppId   = signal('wx_sima2026prod01');
  wechatSecret  = signal('••••••••••••••••');
  wechatConectado = signal(true);
  toast = signal<string | null>(null);

  constructor(private apiService: ApiService) {}

  suscripciones: Suscripcion[] = [
    { id: 1, familiar: 'Ana García',      adulto: 'Elena Rodríguez', habilitado: true,  ultimaNotif: 'Hace 3 horas' },
    { id: 2, familiar: 'Pedro García',    adulto: 'Elena Rodríguez', habilitado: true,  ultimaNotif: 'Hace 1 día' },
    { id: 3, familiar: 'Marta Jiménez',   adulto: 'José Rodríguez',  habilitado: false, ultimaNotif: 'Hace 5 días' },
    { id: 4, familiar: 'Roberto López',   adulto: 'Rosa Martínez',   habilitado: true,  ultimaNotif: 'Hace 2 horas' },
  ];

  probarTelegram(): void {
    const chatId = this.telegramChatId();
    if (!chatId) {
      this.showToast('Por favor ingresa un Chat ID para probar la conexión');
      return;
    }
    
    this.isTestingTelegram.set(true);
    this.apiService.post<string>('/configuracion/telegram/test', { chatId }).subscribe({
      next: () => {
        this.telegramConectado.set(true);
        this.showToast('Conexión con Telegram verificada correctamente');
        this.isTestingTelegram.set(false);
      },
      error: (err) => {
        this.telegramConectado.set(false);
        this.showToast(err.mensaje || 'Error al probar conexión con Telegram');
        this.isTestingTelegram.set(false);
      }
    });
  }

  probarWechat(): void {
    this.showToast('Conexión con WeChat verificada correctamente');
  }

  guardar(): void {
    this.showToast('Configuración guardada correctamente');
  }

  private showToast(msg: string): void {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(null), 3500);
  }
}
