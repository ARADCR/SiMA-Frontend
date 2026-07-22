import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService, AnalisisPerfilResponse } from '../../../../core/services/ai.service';
import { CuidadorPerfilService, DatosContactoCuidador, ResenaResponse, CredencialResponse, CrearCredencialRequest } from '../../../../core/services/cuidador-perfil.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { VinculacionService, SolicitudVinculacion } from '../../../../core/services/vinculacion.service';
import { computed } from '@angular/core';

type Tab = 'info' | 'credenciales' | 'solicitudes' | 'resenas';

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
  private authService = inject(AuthService);
  private vinculacionService = inject(VinculacionService);

  activeTab = signal<Tab>('info');

  perfilNombre = signal<string>('');
  perfilApellido = signal<string>('');

  nombreCuidador = computed(() => {
    if (this.perfilNombre() && this.perfilApellido()) {
      return `${this.perfilNombre()} ${this.perfilApellido()}`;
    }
    return this.authService.usuarioActual?.nombre || 'Cuidador';
  });
  inicialesCuidador = computed(() => {
    const parts = this.nombreCuidador().trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  });

  stats = signal({
    pacientes: 0,
    calificacion: 0.0,
    tomasRegistradas: 0,
    cumplimiento: 0
  });

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

  // Credenciales
  credenciales = signal<CredencialResponse[]>([]);
  modalCredencialOpen = signal(false);
  subiendoCredencial = signal(false);
  credencialPayload: CrearCredencialRequest = {
    tipo: 'Certificación',
    nombre: '',
    archivoFalsoNombre: ''
  };

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

    this.cuidadorPerfilService.obtenerStats().subscribe({
      next: (statsData) => {
        this.stats.set(statsData);
      },
      error: () => { /* mantiene los valores en 0 */ }
    });

    this.cuidadorPerfilService.obtenerResenas().subscribe({
      next: (data) => this.resenas.set(data),
      error: () => {}
    });

    this.vinculacionService.getPendientes().subscribe({
      next: (res) => {
        if (res.data) {
          this.solicitudes.set(res.data);
        }
      },
      error: () => {}
    });

    this.cargarCredenciales();
  }

  private cargarCredenciales(): void {
    this.cuidadorPerfilService.obtenerCredenciales().subscribe({
      next: (data) => this.credenciales.set(data),
      error: () => {}
    });
  }

  private cargarDatosContacto(): void {
    this.cuidadorPerfilService.obtenerPerfil().subscribe({
      next: (datos) => {
        this.perfilNombre.set(datos.nombre || '');
        this.perfilApellido.set(datos.apellido || '');
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
    
    // Smooth scroll to the form
    setTimeout(() => {
      const formEl = document.querySelector('.info-section.full-width');
      if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
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

  abrirModalCredencial(): void {
    this.credencialPayload = { tipo: 'Certificación', nombre: '', archivoFalsoNombre: '' };
    this.modalCredencialOpen.set(true);
  }

  cerrarModalCredencial(): void {
    this.modalCredencialOpen.set(false);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.credencialPayload.archivoFalsoNombre = file.name;
    }
  }

  subirCredencial(): void {
    if (!this.credencialPayload.nombre.trim()) return;

    this.subiendoCredencial.set(true);
    this.cuidadorPerfilService.subirCredencial(this.credencialPayload).subscribe({
      next: (nueva) => {
        this.credenciales.update(c => [nueva, ...c]);
        this.subiendoCredencial.set(false);
        this.cerrarModalCredencial();
      },
      error: () => {
        this.subiendoCredencial.set(false);
        alert('Ocurrió un error al subir el documento. Intentá nuevamente.');
      }
    });
  }

  solicitudes = signal<SolicitudVinculacion[]>([]);

  aceptarSolicitud(id: number): void {
    this.vinculacionService.responderSolicitud(id, true).subscribe({
      next: () => {
        this.solicitudes.update(sols => sols.filter(s => s.idSolicitud !== id));
      },
      error: () => alert('Ocurrió un error al aceptar la solicitud.')
    });
  }

  rechazarSolicitud(id: number): void {
    this.vinculacionService.responderSolicitud(id, false).subscribe({
      next: () => {
        this.solicitudes.update(sols => sols.filter(s => s.idSolicitud !== id));
      },
      error: () => alert('Ocurrió un error al rechazar la solicitud.')
    });
  }

  getInitials(nombreFamiliar: string): string {
    if (!nombreFamiliar) return 'F';
    const parts = nombreFamiliar.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  resenas = signal<ResenaResponse[]>([]);

  credBadgeClass(e: string): string { return `badge badge-${e}`; }
  credLabel(e: string): string {
    return e === 'verificado' ? 'Verificado' : e === 'pendiente' ? 'Pendiente' : 'Rechazado';
  }

  starFill(s: number, puntos: number): string {
    return s <= puntos ? '#F4A261' : '#E2EAF0';
  }
}
