import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService, AnalisisPerfilResponse } from '../../../../core/services/ai.service';
import { CuidadorPerfilService, DatosContactoCuidador } from '../../../../core/services/cuidador-perfil.service';

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
export class PerfilCuidadorComponent implements OnInit {
  private aiService = inject(AiService);
  private cuidadorPerfilService = inject(CuidadorPerfilService);

  activeTab = signal<Tab>('info');

  descripcionPerfil = '';
  analizando = signal(false);
  analisisResultado = signal<AnalisisPerfilResponse | null>(null);
  analisisError = signal<string | null>(null);
  tagsEditables = signal<string[]>([]);
  perfilGuardado = signal(false);

  especialidadesMostradas = signal<string[]>([]);
  experienciaMostrada = signal('');
  bioMostrada = signal('');

  // Datos de contacto y condiciones (HU-27)
  editandoContacto = signal(false);
  contactoGuardado = signal(false);
  contactoError = signal<string | null>(null);
  correo = signal('');
  telefono = signal<string | null>(null);
  ciudad = signal<string | null>(null);
  tarifaHora = signal<number | null>(null);
  disponibilidad = signal<string | null>(null);

  formCorreo = '';
  formTelefono: string | null = null;
  formCiudad: string | null = null;
  formTarifaHora: number | null = null;
  formDisponibilidad: string | null = null;

  ngOnInit(): void {
    this.aiService.obtenerPerfilCuidador().subscribe({
      next: (perfil) => {
        if (!perfil.perfilAnalizado) return;
        this.descripcionPerfil = perfil.descripcionPerfil ?? '';
        if (perfil.especialidades.length > 0) this.especialidadesMostradas.set(perfil.especialidades);
        if (perfil.experiencia) this.experienciaMostrada.set(perfil.experiencia);
        if (perfil.resumenIa) this.bioMostrada.set(perfil.resumenIa);
        this.tagsEditables.set(perfil.tags);
      },
      error: () => { /* mantiene los valores por defecto si falla la carga */ }
    });

    this.cargarDatosContacto();
  }

  private cargarDatosContacto(): void {
    this.cuidadorPerfilService.obtenerPerfil().subscribe({
      next: (datos) => {
        this.correo.set(datos.correo);
        this.telefono.set(datos.telefono);
        this.ciudad.set(datos.ciudad);
        this.tarifaHora.set(datos.tarifaHora);
        this.disponibilidad.set(datos.disponibilidad);
      },
      error: () => { /* si falla la carga, no se muestran datos de contacto */ }
    });
  }

  editarPerfil(): void {
    this.formCorreo = this.correo();
    this.formTelefono = this.telefono();
    this.formCiudad = this.ciudad();
    this.formTarifaHora = this.tarifaHora();
    this.formDisponibilidad = this.disponibilidad();
    this.contactoError.set(null);
    this.editandoContacto.set(true);
  }

  cancelarEdicion(): void {
    this.editandoContacto.set(false);
    this.contactoError.set(null);
  }

  guardarDatosContacto(): void {
    const datos: DatosContactoCuidador = {
      correo: this.formCorreo,
      telefono: this.formTelefono,
      ciudad: this.formCiudad,
      tarifaHora: this.formTarifaHora,
      disponibilidad: this.formDisponibilidad
    };

    this.contactoError.set(null);

    this.cuidadorPerfilService.actualizarPerfil(datos).subscribe({
      next: (respuesta) => {
        this.correo.set(respuesta.correo);
        this.telefono.set(respuesta.telefono);
        this.ciudad.set(respuesta.ciudad);
        this.tarifaHora.set(respuesta.tarifaHora);
        this.disponibilidad.set(respuesta.disponibilidad);
        this.editandoContacto.set(false);
        this.contactoGuardado.set(true);
        setTimeout(() => this.contactoGuardado.set(false), 3000);
      },
      error: (err) => {
        this.contactoError.set(err?.mensaje || 'No se pudo guardar el perfil. Intentá nuevamente.');
      }
    });
  }

  analizarConIA(): void {
    const texto = this.descripcionPerfil.trim();
    if (!texto) return;

    this.analizando.set(true);
    this.analisisError.set(null);
    this.perfilGuardado.set(false);

    this.aiService.analizarPerfil(texto).subscribe({
      next: (resultado) => {
        this.analizando.set(false);
        this.analisisResultado.set(resultado);
        this.tagsEditables.set([...resultado.tagsRecomendados]);
      },
      error: () => {
        this.analizando.set(false);
        this.analisisError.set('No se pudo analizar el perfil en este momento. Intentá nuevamente en unos minutos.');
      }
    });
  }

  quitarTag(tag: string): void {
    this.tagsEditables.update(tags => tags.filter(t => t !== tag));
  }

  guardarPerfil(): void {
    this.aiService.actualizarPerfilCuidador(this.tagsEditables()).subscribe({
      next: () => {
        const r = this.analisisResultado();
        if (r) {
          if (r.especialidadesDetectadas.length > 0) this.especialidadesMostradas.set([...r.especialidadesDetectadas]);
          if (r.experienciaEstimada) this.experienciaMostrada.set(r.experienciaEstimada);
          if (r.resumenGenerado) this.bioMostrada.set(r.resumenGenerado);
        }
        this.perfilGuardado.set(true);
        setTimeout(() => this.perfilGuardado.set(false), 3000);
      },
      error: () => this.analisisError.set('No se pudo guardar el perfil. Intentá nuevamente.')
    });
  }

  tabs: { id: Tab; label: string }[] = [
    { id: 'info', label: 'Información' },
    { id: 'credenciales', label: 'Credenciales' },
    { id: 'solicitudes', label: 'Solicitudes' },
    { id: 'resenas', label: 'Reseñas' },
  ];

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
