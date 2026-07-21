import { Component, signal, ElementRef, ViewChild, AfterViewChecked, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../../../core/services/ai.service';
import { AdultoMayorService } from '../../../../core/services/adulto-mayor.service';
import { AdultoMayor } from '../../../../core/models/adulto-mayor.model';

interface Mensaje { id: number; tipo: 'usuario' | 'bot'; texto: string; hora: string; }

const MENSAJE_ERROR = 'El asistente no está disponible en este momento. Intentá nuevamente en unos minutos.';

@Component({
  selector: 'app-chatbot-familiar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot-familiar.component.html',
  styleUrls: ['./chatbot-familiar.component.scss']
})
export class ChatbotFamiliarComponent implements AfterViewChecked, OnInit {
  @ViewChild('messagesContainer') private msgsEl!: ElementRef<HTMLDivElement>;
  inputTexto = ''; convActiva = 1; escribiendo = signal(false);

  adultos = signal<AdultoMayor[]>([]);
  adultoSeleccionado = signal<number | null>(null);

  sugerencias = ['¿Cuándo le toca la próxima pastilla?', '¿Cómo fue la adherencia de esta semana?', '¿Qué dijo el cuidador hoy?', '¿Ha habido alertas recientes?'];
  conversaciones = [
    { id: 1, titulo: 'Consulta de hoy', fecha: 'Hace 2 min' },
  ];
  mensajes = signal<Mensaje[]>([
    { id: 1, tipo: 'bot', texto: '¡Hola! Soy el asistente de SiMA. Puedo contarte sobre medicamentos, tomas, alertas y observaciones del cuidador de tu familiar. ¿En qué puedo ayudarte?', hora: '13:45' },
  ]);

  constructor(private aiService: AiService, private adultoMayorService: AdultoMayorService) {}

  ngOnInit(): void {
    this.adultoMayorService.getMisPacientes().subscribe({
      next: (adultos) => {
        this.adultos.set(adultos);
        if (adultos.length > 0) this.adultoSeleccionado.set(adultos[0].idAdulto);
      },
      error: () => this.adultos.set([])
    });
  }

  ngAfterViewChecked(): void {
    if (this.msgsEl) { const el = this.msgsEl.nativeElement; el.scrollTop = el.scrollHeight; }
  }

  enviar(): void {
    const txt = this.inputTexto.trim();
    const idAdulto = this.adultoSeleccionado();
    if (!txt || !idAdulto) return;

    const hora = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    this.mensajes.update(m => [...m, { id: Date.now(), tipo: 'usuario', texto: txt, hora }]);
    this.inputTexto = '';
    this.escribiendo.set(true);

    this.aiService.chat(idAdulto, txt).subscribe({
      next: (resp) => {
        this.escribiendo.set(false);
        this.mensajes.update(m => [...m, { id: Date.now() + 1, tipo: 'bot', texto: resp.respuesta, hora: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) }]);
      },
      error: () => {
        this.escribiendo.set(false);
        this.mensajes.update(m => [...m, { id: Date.now() + 1, tipo: 'bot', texto: MENSAJE_ERROR, hora: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) }]);
      }
    });
  }

  enviarSugerencia(s: string): void { this.inputTexto = s; this.enviar(); }

  nuevaConversacion(): void {
    const id = this.conversaciones.length + 1;
    this.conversaciones.unshift({ id, titulo: `Conversación ${id}`, fecha: 'Ahora' });
    this.convActiva = id;
    this.mensajes.set([{ id: 1, tipo: 'bot', texto: 'Nueva conversación iniciada. ¿En qué puedo ayudarte?', hora: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) }]);
  }
}
