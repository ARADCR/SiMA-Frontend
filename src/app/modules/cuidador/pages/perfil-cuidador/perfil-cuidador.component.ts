import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type Tab = 'info' | 'credenciales' | 'solicitudes' | 'resenas';

interface Credencial {
  id: number; tipo: string; nombre: string; fecha: string;
  estado: 'verificado' | 'pendiente' | 'rechazado';
}

interface Solicitud {
  id: number; familia: string; adulto: string; initials: string;
  fecha: string; mensaje: string;
}

interface Resena {
  id: number; familia: string; initials: string; puntos: number;
  texto: string; fecha: string;
}

@Component({
  selector: 'app-perfil-cuidador',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil-cuidador.component.html',
  styleUrls: ['./perfil-cuidador.component.scss']
})
export class PerfilCuidadorComponent {
  activeTab = signal<Tab>('info');

  tabs: { id: Tab; label: string }[] = [
    { id: 'info', label: 'Información' },
    { id: 'credenciales', label: 'Credenciales' },
    { id: 'solicitudes', label: 'Solicitudes' },
    { id: 'resenas', label: 'Reseñas' },
  ];

  especialidades = ['Adultos mayores', 'Diabetes tipo 2', 'Hipertensión', 'Movilidad reducida', 'Demencia leve'];

  stars = [1, 2, 3, 4, 5];

  credenciales: Credencial[] = [
    { id: 1, tipo: 'Certificación', nombre: 'Técnico en cuidados de salud — CONALEP', fecha: '15/01/2024', estado: 'verificado' },
    { id: 2, tipo: 'Identificación', nombre: 'INE / Credencial de elector', fecha: '10/03/2024', estado: 'verificado' },
    { id: 3, tipo: 'Antecedentes', nombre: 'No antecedentes penales — PGJDF', fecha: '05/05/2024', estado: 'pendiente' },
  ];

  solicitudes: Solicitud[] = [
    { id: 1, familia: 'Familia García', adulto: 'Luis García', initials: 'FG', fecha: '27/06/2026',
      mensaje: 'Buscamos cuidador con experiencia en hipertensión para nuestro padre de 80 años. Turno matutino de lunes a viernes.' },
    { id: 2, familia: 'Familia Ramírez', adulto: 'Carmen Ramírez', initials: 'FR', fecha: '25/06/2026',
      mensaje: 'Necesitamos apoyo para adulta mayor con demencia leve. Turno vespertino.' },
  ];

  resenas: Resena[] = [
    { id: 1, familia: 'Familia Rodríguez', initials: 'FR', puntos: 5,
      texto: 'Carlos es increíblemente profesional y dedicado. Mi madre está muy cómoda con él y siempre nos informa de cualquier cambio.', fecha: 'Jun 2026' },
    { id: 2, familia: 'Familia Martínez', initials: 'FM', puntos: 5,
      texto: 'Puntual, respetuoso y muy atento. Lo recomendamos ampliamente a cualquier familia que necesite cuidados de calidad.', fecha: 'May 2026' },
    { id: 3, familia: 'Familia Pérez', initials: 'FP', puntos: 4,
      texto: 'Muy buen cuidador. Tiene mucha experiencia y se nota. A veces tarda en responder mensajes pero en persona es excelente.', fecha: 'Abr 2026' },
  ];

  credBadgeClass(e: string): string { return `badge badge-${e}`; }
  credLabel(e: string): string {
    return e === 'verificado' ? 'Verificado' : e === 'pendiente' ? 'Pendiente' : 'Rechazado';
  }

  starFill(s: number, puntos: number): string {
    return s <= puntos ? '#F4A261' : '#E2EAF0';
  }
}
