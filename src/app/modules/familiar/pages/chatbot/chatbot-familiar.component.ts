import { Component, signal, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Mensaje { id: number; tipo: 'usuario' | 'bot'; texto: string; hora: string; }

const RESPUESTAS: Record<string, string> = {
  default:     'Entiendo tu consulta. Como asistente de SiMA puedo ayudarte con información sobre el cuidado de tu familiar. ¿Podrías darme más detalles sobre tu situación?',
  medicamento: 'Los medicamentos deben administrarse en los horarios exactos indicados. Si tu familiar omitió una toma, consulta con el médico antes de cambiar la dosis. Puedes registrar y ver el historial de tomas en la sección "Medicamentos".',
  alerta:      'Para gestionar alertas, ve a la sección "Dashboard" donde verás las alertas activas. Puedes marcarlas como resueltas una vez atendidas. Para alertas urgentes, contacta directamente al cuidador o al médico.',
  cuidador:    'Para buscar un cuidador certificado, usa la sección "Buscar Cuidador" donde encontrarás profesionales verificados por SiMA con calificaciones y especialidades.',
  dispositivo: 'Los dispositivos IoT (pulsera y pastillero) se sincronizan automáticamente. Puedes ver su estado y las lecturas recientes en la sección "Actividad IoT".',
};

function getBotResponse(texto: string): string {
  const t = texto.toLowerCase();
  if (t.includes('medicamento') || t.includes('pastilla') || t.includes('toma')) return RESPUESTAS['medicamento'];
  if (t.includes('alerta') || t.includes('emergencia') || t.includes('urgente')) return RESPUESTAS['alerta'];
  if (t.includes('cuidador') || t.includes('enfermero') || t.includes('buscar')) return RESPUESTAS['cuidador'];
  if (t.includes('dispositivo') || t.includes('pulsera') || t.includes('pastillero') || t.includes('iot')) return RESPUESTAS['dispositivo'];
  return RESPUESTAS['default'];
}

@Component({
  selector: 'app-chatbot-familiar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot-familiar.component.html',
  styleUrls: ['./chatbot-familiar.component.scss']
})
export class ChatbotFamiliarComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') private msgsEl!: ElementRef<HTMLDivElement>;
  inputTexto = ''; convActiva = 1; escribiendo = signal(false);

  sugerencias = ['¿Cómo buscar un cuidador?', '¿Qué significa una alerta?', '¿Cómo agregar medicamentos?', '¿Qué es el pastillero IoT?'];
  conversaciones = [
    { id: 1, titulo: 'Consulta de hoy',       fecha: 'Hace 2 min' },
    { id: 2, titulo: 'Búsqueda de cuidador',  fecha: 'Ayer' },
  ];
  mensajes = signal<Mensaje[]>([
    { id: 1, tipo: 'bot', texto: '¡Hola! Soy el asistente de SiMA. Estoy aquí para ayudarte con el monitoreo de tu familiar. Puedo explicarte cómo funciona el sistema, ayudarte a interpretar alertas y guiarte en el uso de la plataforma. ¿En qué puedo ayudarte?', hora: '13:45' },
  ]);

  ngAfterViewChecked(): void {
    if (this.msgsEl) { const el = this.msgsEl.nativeElement; el.scrollTop = el.scrollHeight; }
  }

  enviar(): void {
    const txt = this.inputTexto.trim(); if (!txt) return;
    const hora = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    this.mensajes.update(m => [...m, { id: Date.now(), tipo: 'usuario', texto: txt, hora }]);
    this.inputTexto = ''; this.escribiendo.set(true);
    setTimeout(() => {
      this.escribiendo.set(false);
      this.mensajes.update(m => [...m, { id: Date.now() + 1, tipo: 'bot', texto: getBotResponse(txt), hora: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) }]);
    }, 1200);
  }

  enviarSugerencia(s: string): void { this.inputTexto = s; this.enviar(); }

  nuevaConversacion(): void {
    const id = this.conversaciones.length + 1;
    this.conversaciones.unshift({ id, titulo: `Conversación ${id}`, fecha: 'Ahora' });
    this.convActiva = id;
    this.mensajes.set([{ id: 1, tipo: 'bot', texto: 'Nueva conversación iniciada. ¿En qué puedo ayudarte?', hora: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) }]);
  }
}
