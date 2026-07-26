import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';

type EstadoCredencial = 'pendiente' | 'aprobado' | 'rechazado';

interface Credencial {
  id: number;
  cuidador: string;
  initials: string;
  avatarBg: string;
  tipo: string;
  documento: string;
  fecha: string;
  estado: EstadoCredencial;
  archivoUrl: string;
}

@Component({
  selector: 'app-credenciales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './credenciales.component.html',
  styleUrls: ['./credenciales.component.scss']
})
export class CredencialesComponent implements OnInit {
  private apiService = inject(ApiService);
  
  seleccionado = signal<Credencial | null>(null);
  comentario = signal('');
  toast = signal<{ msg: string; type: 'success' | 'error' } | null>(null);
  credenciales = signal<Credencial[]>([]);

  ngOnInit() {
    this.cargarCredenciales();
  }

  cargarCredenciales() {
    this.apiService.get<any>('/admin/credenciales').subscribe({
      next: (res) => {
        if (res.data) {
          this.credenciales.set(res.data);
        }
      }
    });
  }

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

  cambiarEstado(c: Credencial, nuevoEstado: EstadoCredencial, msjExito: string, msjError: string) {
    this.apiService.post<any>(`/admin/credenciales/${c.id}/estado`, { estado: nuevoEstado }).subscribe({
      next: () => {
        this.credenciales.update(list => list.map(x => x.id === c.id ? { ...x, estado: nuevoEstado } : x));
        this.seleccionado.update(s => s ? { ...s, estado: nuevoEstado } : s);
        this.showToast(msjExito, 'success');
      },
      error: () => {
        this.showToast(msjError, 'error');
      }
    });
  }

  aprobar(c: Credencial): void {
    this.cambiarEstado(c, 'aprobado', `Credencial de ${c.cuidador} aprobada`, 'Error al aprobar credencial');
  }

  rechazar(c: Credencial): void {
    this.cambiarEstado(c, 'rechazado', `Credencial de ${c.cuidador} rechazada`, 'Error al rechazar credencial');
  }

  revertir(c: Credencial): void {
    this.cambiarEstado(c, 'pendiente', 'Documento revertido a pendiente', 'Error al revertir documento');
  }

  private showToast(msg: string, type: 'success' | 'error'): void {
    this.toast.set({ msg, type });
    setTimeout(() => this.toast.set(null), 3500);
  }

  verDocumento(c: Credencial): void {
    if (c.archivoUrl && (c.archivoUrl.startsWith('http') || c.archivoUrl.startsWith('blob:') || c.archivoUrl.startsWith('data:'))) {
      window.open(c.archivoUrl, '_blank');
    } else {
      this.showToast('Archivo simulado. En producción se abriría: ' + c.archivoUrl, 'error');
    }
  }
}
