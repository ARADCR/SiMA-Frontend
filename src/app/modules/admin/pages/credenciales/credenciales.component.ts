import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type EstadoCredencial = 'pendiente' | 'aprobado' | 'rechazado';

interface Credencial {
  id: number;
  cuidador: string;
  initials: string;
  avatarBg: string;
  tipo: string;
  documento: string;
  fecha: string;
  institucion: string;
  descripcion: string;
  fechaEmision: string;
  vigencia: string;
  estado: EstadoCredencial;
}

@Component({
  selector: 'app-credenciales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './credenciales.component.html',
  styleUrls: ['./credenciales.component.scss']
})
export class CredencialesComponent {
  seleccionado = signal<Credencial | null>(null);
  comentario = signal('');
  toast = signal<{ msg: string; type: 'success' | 'error' } | null>(null);

  credenciales = signal<Credencial[]>([
    {
      id: 1, cuidador: 'Carlos Andrade', initials: 'CA', avatarBg: '#2E86AB',
      tipo: 'Certificación técnica', documento: 'certificacion_conalep_2024.pdf',
      fecha: '20/06/2026', institucion: 'CONALEP Plantel 12',
      descripcion: 'Técnico en Enfermería General. Formación de 2 años en cuidados médicos básicos.',
      fechaEmision: 'Julio 2024', vigencia: 'Permanente', estado: 'pendiente'
    },
    {
      id: 2, cuidador: 'Laura Vega', initials: 'LV', avatarBg: '#52B788',
      tipo: 'Antecedentes no penales', documento: 'antecedentes_pgjdf.pdf',
      fecha: '18/06/2026', institucion: 'PGJDF / Fiscalía CDMX',
      descripcion: 'Carta de antecedentes no penales con vigencia de 90 días.',
      fechaEmision: 'Junio 2026', vigencia: '90 días', estado: 'pendiente'
    },
    {
      id: 3, cuidador: 'Marco Torres', initials: 'MT', avatarBg: '#F4A261',
      tipo: 'Identificación oficial', documento: 'ine_marco_torres.pdf',
      fecha: '15/06/2026', institucion: 'INE México',
      descripcion: 'Credencial para votar vigente. Identificación con fotografía.',
      fechaEmision: 'Enero 2022', vigencia: 'Enero 2030', estado: 'aprobado'
    },
    {
      id: 4, cuidador: 'Sofía Ramos', initials: 'SR', avatarBg: '#E76F51',
      tipo: 'Título universitario', documento: 'titulo_enfermeria.pdf',
      fecha: '10/06/2026', institucion: 'Universidad Nacional Autónoma',
      descripcion: 'Licenciatura en Enfermería con especialización en cuidados geriátricos. 4 años de formación.',
      fechaEmision: 'Junio 2022', vigencia: 'Permanente', estado: 'rechazado'
    },
  ]);

  pendientes = () => this.credenciales().filter(c => c.estado === 'pendiente').length;

  seleccionar(c: Credencial): void {
    this.seleccionado.set(c);
    this.comentario.set('');
  }

  estadoBadgeClass(e: EstadoCredencial): string {
    return 'badge ' + ({ aprobado: 'badge--green', pendiente: 'badge--yellow', rechazado: 'badge--red' }[e] ?? '');
  }

  estadoLabel(e: EstadoCredencial): string {
    return { aprobado: 'Aprobado', pendiente: 'Pendiente', rechazado: 'Rechazado' }[e];
  }

  aprobar(c: Credencial): void {
    this.credenciales.update(list => list.map(x => x.id === c.id ? { ...x, estado: 'aprobado' as const } : x));
    this.seleccionado.update(s => s ? { ...s, estado: 'aprobado' as const } : s);
    this.showToast(`Credencial de ${c.cuidador} aprobada`, 'success');
  }

  rechazar(c: Credencial): void {
    this.credenciales.update(list => list.map(x => x.id === c.id ? { ...x, estado: 'rechazado' as const } : x));
    this.seleccionado.update(s => s ? { ...s, estado: 'rechazado' as const } : s);
    this.showToast(`Credencial de ${c.cuidador} rechazada`, 'error');
  }

  revertir(c: Credencial): void {
    this.credenciales.update(list => list.map(x => x.id === c.id ? { ...x, estado: 'pendiente' as const } : x));
    this.seleccionado.update(s => s ? { ...s, estado: 'pendiente' as const } : s);
    this.showToast('Documento revertido a pendiente', 'success');
  }

  private showToast(msg: string, type: 'success' | 'error'): void {
    this.toast.set({ msg, type });
    setTimeout(() => this.toast.set(null), 3500);
  }
}
