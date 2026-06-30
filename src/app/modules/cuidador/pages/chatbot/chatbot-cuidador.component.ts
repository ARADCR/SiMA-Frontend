import { Component, signal, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Mensaje {
  id: number;
  tipo: 'usuario' | 'bot';
  texto: string;
  hora: string;
}

const RESPUESTAS_BOT: Record<string, string> = {
  default: 'Entiendo tu consulta. Como asistente de SiMA puedo ayudarte con información sobre medicamentos, síntomas comunes en adultos mayores, y protocolos de cuidado. ¿Podrías darme más detalles?',
  medicamento: 'Los medicamentos deben administrarse en los horarios indicados por el médico. Si un paciente olvida una toma, consulta con el familiar o médico antes de doblar la dosis. ¿Sobre qué medicamento tienes dudas?',
  presion: 'Para monitorear la presión arterial, registra los valores antes de la toma de medicamentos antihipertensivos. Valores normales: sistólica 90-130 mmHg, diastólica 60-85 mmHg. Valores superiores a 140/90 deben reportarse.',
  caida: 'En caso de caída: 1) No mover al paciente de inmediato. 2) Verificar consciencia. 3) Evaluar dolor o deformidad. 4) Contactar al familiar y médico. 5) Si hay pérdida de consciencia, llamar a emergencias (911).',
  diabetes: 'Para pacientes diabéticos: registrar glucosa en ayunas (70-130 mg/dL) y 2h postprandial (<180 mg/dL). Administrar insulina/metformina según pauta. Reportar hipoglucemia (<70 mg/dL) inmediatamente.',
  dolor: 'Ante dolor en el paciente: evalúa localización, intensidad (escala 1-10) y duración. Registra la observación en la plataforma. Si el dolor es agudo o acompañado de otros síntomas, notifica al familiar y busca atención médica.',
};

function getBotResponse(texto: string): string {
  const t = texto.toLowerCase();
  if (t.includes('medicamento') || t.includes('pastilla') || t.includes('toma')) return RESPUESTAS_BOT['medicamento'];
  if (t.includes('presion') || t.includes('presión') || t.includes('hipertension') || t.includes('tensión')) return RESPUESTAS_BOT['presion'];
  if (t.includes('caida') || t.includes('caída') || t.includes('cayó')) return RESPUESTAS_BOT['caida'];
  if (t.includes('diabetes') || t.includes('glucosa') || t.includes('insulina')) return RESPUESTAS_BOT['diabetes'];
  if (t.includes('dolor') || t.includes('duele')) return RESPUESTAS_BOT['dolor'];
  return RESPUESTAS_BOT['default'];
}

@Component({
  selector: 'app-chatbot-cuidador',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot-cuidador.component.html',
  styleUrls: ['./chatbot-cuidador.component.scss']
})
export class ChatbotCuidadorComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') private msgsEl!: ElementRef<HTMLDivElement>;

  inputTexto = '';
  convActiva = 1;
  escribiendo = signal(false);

  sugerencias = [
    '¿Qué hacer si un paciente cae?',
    '¿Cómo controlar la presión arterial?',
    '¿Qué es una hipoglucemia?',
    '¿Cuándo llamar a emergencias?',
  ];

  conversaciones = [
    { id: 1, titulo: 'Consulta de hoy', fecha: 'Hace 5 min' },
    { id: 2, titulo: 'Manejo de diabetes', fecha: 'Ayer' },
    { id: 3, titulo: 'Presión arterial alta', fecha: '25/06/2026' },
  ];

  mensajes = signal<Mensaje[]>([
    {
      id: 1, tipo: 'bot',
      texto: '¡Hola Carlos! Soy el asistente de SiMA. Puedo ayudarte con dudas sobre el cuidado de tus pacientes, protocolos médicos y manejo de medicamentos. ¿En qué puedo ayudarte?',
      hora: '13:45'
    },
  ]);

  ngAfterViewChecked(): void {
    if (this.msgsEl) {
      const el = this.msgsEl.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  enviar(): void {
    const txt = this.inputTexto.trim();
    if (!txt) return;
    const hora = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    this.mensajes.update(m => [...m, { id: Date.now(), tipo: 'usuario', texto: txt, hora }]);
    this.inputTexto = '';
    this.escribiendo.set(true);
    setTimeout(() => {
      this.escribiendo.set(false);
      const resp = getBotResponse(txt);
      this.mensajes.update(m => [...m, {
        id: Date.now() + 1, tipo: 'bot', texto: resp,
        hora: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1200);
  }

  enviarSugerencia(s: string): void {
    this.inputTexto = s;
    this.enviar();
  }

  nuevaConversacion(): void {
    const id = this.conversaciones.length + 1;
    this.conversaciones.unshift({ id, titulo: `Conversación ${id}`, fecha: 'Ahora' });
    this.convActiva = id;
    this.mensajes.set([{
      id: 1, tipo: 'bot',
      texto: 'Nueva conversación iniciada. ¿En qué puedo ayudarte?',
      hora: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    }]);
  }
}
