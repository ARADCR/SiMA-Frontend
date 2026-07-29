import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';

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
  umbralCaidas = signal(2.5);
  freqVerif = signal(15);
  telegramChatId = signal('');
  telegramConectado = signal(false);
  isTestingTelegram = signal(false);

  toast = signal<string | null>(null);

  suscripciones = signal<Suscripcion[]>([]);

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    // Cargar perfil admin
    this.apiService.get<any>('/usuarios/me').subscribe({
      next: (res) => {
        if (res.data && res.data.telegramChatId) {
          this.telegramChatId.set(res.data.telegramChatId);
          this.telegramConectado.set(true);
        }
      },
      error: () => {}
    });

    // Cargar suscripciones
    this.apiService.get<any>('/configuracion/telegram/suscripciones').subscribe({
      next: (res) => {
        if (res.data) {
          this.suscripciones.set(res.data);
        }
      },
      error: () => {}
    });

    // Cargar configuración general
    this.apiService.get<any>('/configuracion/general').subscribe({
      next: (res) => {
        if (res.data) {
          if (res.data.toleranciaMed) this.toleranciaMed.set(Number(res.data.toleranciaMed));
          if (res.data.reintentosMed) this.reintentosMed.set(Number(res.data.reintentosMed));
          if (res.data.umbralCaidas) this.umbralCaidas.set(Number(res.data.umbralCaidas));
          if (res.data.freqVerif) this.freqVerif.set(Number(res.data.freqVerif));
        }
      },
      error: () => {}
    });
  }

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
      error: (err: { mensaje?: string }) => {
        this.telegramConectado.set(false);
        this.showToast(err.mensaje || 'Error al probar conexión con Telegram');
        this.isTestingTelegram.set(false);
      }
    });
  }

  guardar(): void {
    const generalConfig = {
      toleranciaMed: this.toleranciaMed().toString(),
      reintentosMed: this.reintentosMed().toString(),
      umbralCaidas: this.umbralCaidas().toString(),
      freqVerif: this.freqVerif().toString()
    };

    // Guardar configuración general
    this.apiService.post<any>('/configuracion/general', generalConfig).subscribe({
      next: () => {
        // Después de guardar general, guardar telegram si hay chatId
        const chatId = this.telegramChatId();
        if (chatId) {
          this.apiService.post<any>('/configuracion/telegram/save', { chatId }).subscribe({
            next: () => this.showToast('Configuración guardada correctamente'),
            error: () => this.showToast('Error al guardar el Chat ID de Telegram')
          });
        } else {
          this.showToast('Configuración general guardada correctamente');
        }
      },
      error: () => this.showToast('Error al guardar configuración general')
    });
  }

  private showToast(msg: string): void {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(null), 3500);
  }
}
