import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { AdultoMayorService } from '../../../../core/services/adulto-mayor.service';
import { MedicamentoService } from '../../../../core/services/medicamento.service';
import { HistorialService } from '../../../../core/services/historial.service';
import { AlertaService } from '../../../../core/services/alerta.service';
import { DispositivoIotService } from '../../../../core/services/dispositivo-iot.service';
import { FormularioAdultoComponent } from '../formulario-adulto/formulario-adulto.component';
import { catchError, forkJoin, of } from 'rxjs';

type Tab = 'medicamentos' | 'historial' | 'alertas' | 'dispositivo';

interface Medicamento { nombre: string; dosis: string; horario: string; estado: string; }
interface Evento { fecha: string; tipo: string; descripcion: string; metodo: string; }
interface Alerta { id?: number; titulo: string; descripcion: string; tipo: string; hora: string; resuelta: boolean; }
interface Dispositivo { nombre: string; id: string; estado: string; bateria: number; sync: string; }

@Component({
  selector: 'app-detalle-adulto',
  standalone: true,
  imports: [CommonModule, RouterModule, FormularioAdultoComponent],
  templateUrl: './detalle-adulto.component.html',
  styleUrls: ['./detalle-adulto.component.scss']
})
export class DetalleAdultoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private adultoService = inject(AdultoMayorService);
  private medService = inject(MedicamentoService);
  private historialSvc = inject(HistorialService);
  private alertaSvc = inject(AlertaService);
  private dispSvc = inject(DispositivoIotService);

  tabActiva = signal<Tab>('medicamentos');
  toast = signal<string | null>(null);

  adulto: any = null;
  cargando = signal<boolean>(true);
  showModal = signal<boolean>(false);

  medicamentos: Medicamento[] = [];
  historial: Evento[] = [];
  alertas = signal<Alerta[]>([]);

  dispositivo: Dispositivo = {
    nombre: 'Ninguno', id: 'Sin registrar',
    estado: 'offline', bateria: 0, sync: 'Nunca'
  };

  tabs: { id: Tab; label: string }[] = [
    { id: 'medicamentos', label: 'Medicamentos' },
    { id: 'historial', label: 'Historial' },
    { id: 'alertas', label: 'Alertas' },
    { id: 'dispositivo', label: 'Dispositivos' },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const numId = Number(id);
      this.cargarAdulto(numId);
      this.cargarMeds(numId);
      this.cargarHistorial(numId);
      this.cargarAlertas(numId);
      this.cargarDispositivo(numId);
    }
  }

  private cargarAdulto(id: number): void {
    this.cargando.set(true);
    this.adultoService.getById(id).subscribe({
      next: (data) => {
        this.adulto = data;
        if (data && data.fechaNacimiento) {
          this.adulto.edad = this.calcularEdad(data.fechaNacimiento);
        } else if (this.adulto) {
          this.adulto.edad = 0;
        }
        this.cargando.set(false);
      },
      error: (err) => {
        this.toast.set('Error al cargar la información del adulto mayor');
        this.cargando.set(false);
      }
    });
  }

  private cargarMeds(id: number): void {
    this.medService.getByAdulto(id).subscribe({
      next: (meds) => {
        this.medicamentos = (meds || []).map(m => ({
          nombre: m.nombre || 'Sin nombre',
          dosis: m.dosis || '',
          horario: m.horarios && m.horarios.length > 0 
            ? m.horarios.map(h => (h.horaProgramada || '').substring(0, 5)).join(' · ')
            : 'Sin horarios programados',
          estado: m.activo ? 'activo' : 'inactivo'
        }));
      },
      error: () => {
        this.medicamentos = [];
      }
    });
  }

  private cargarHistorial(id: number): void {
    this.historialSvc.getHistorial(id, { size: 10 }).subscribe({
      next: (page) => {
        const content = (page && page.content) ? page.content : [];
        this.historial = content.map(e => ({
          fecha: this.formatearFecha(e.fechaHora),
          tipo: e.tipo === 'toma' ? 'Toma' : e.tipo === 'alerta' ? 'Alerta' : 'IoT',
          descripcion: e.descripcion || '',
          metodo: e.tipo === 'toma' 
            ? (e.meta && e.meta['confirmador'] ? String(e.meta['confirmador']) : 'Sistema')
            : (e.tipo === 'actividad_iot' && e.meta && e.meta['tipoDispositivo'] ? String(e.meta['tipoDispositivo']).replace('_', ' ') : 'Sistema')
        }));
      },
      error: () => {
        this.historial = [];
      }
    });
  }

  private cargarAlertas(id: number): void {
    this.alertaSvc.getActivas().subscribe({
      next: (alertas) => {
        const list = alertas || [];
        const filtradas = list.filter(a => a.adultoMayorId === id);
        this.alertas.set(filtradas.map(a => ({
          id: a.id,
          titulo: a.titulo || (a.tipo || '').replace('_', ' '),
          descripcion: a.descripcion || '',
          tipo: a.prioridad === 'alta' || a.prioridad === 'critica' ? 'urgente' : 'moderado',
          hora: this.formatearTiempoRelativo(a.timestamp),
          resuelta: a.estado === 'resuelta'
        })));
      },
      error: () => {
        this.alertas.set([]);
      }
    });
  }

  private cargarDispositivo(id: number): void {
    this.dispSvc.listarPorAdulto(id).subscribe({
      next: (res) => {
        const list = (res && res.data) ? res.data : [];
        if (list.length > 0) {
          const d = list[0];
          this.dispositivo = {
            nombre: d.tipoDispositivo === 'pastillero_esp32' ? 'Pastillero ESP32' : 'Pulsera Inteligente',
            id: d.identificadorFisico || 'Sin ID',
            estado: d.activo ? 'online' : 'offline',
            bateria: d.tipoDispositivo === 'pastillero_esp32' ? 85 : 92,
            sync: 'Hace pocos minutos'
          };
        } else {
          this.dispositivo = {
            nombre: 'Ninguno', id: 'Sin registrar',
            estado: 'offline', bateria: 0, sync: 'Nunca'
          };
        }
      },
      error: () => {
        this.dispositivo = {
          nombre: 'Ninguno', id: 'Sin registrar',
          estado: 'offline', bateria: 0, sync: 'Nunca'
        };
      }
    });
  }

  private calcularEdad(fecha: string): number {
    if (!fecha) return 0;
    const birthDate = new Date(fecha);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  private formatearFecha(fechaStr: string): string {
    if (!fechaStr) return '';
    try {
      const date = new Date(fechaStr);
      return date.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return fechaStr;
    }
  }

  private formatearTiempoRelativo(fechaStr: string): string {
    if (!fechaStr) return '';
    try {
      const date = new Date(fechaStr);
      const diffMs = new Date().getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 60) return `Hace ${diffMins} min`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `Hace ${diffHours} horas`;
      return date.toLocaleDateString();
    } catch (e) {
      return '';
    }
  }

  iniciales(): string {
    if (!this.adulto) return '';
    return (this.adulto.nombre.charAt(0) + this.adulto.apellido.charAt(0)).toUpperCase();
  }

  tipoClass(tipo: string): string {
    if (tipo === 'Toma') return 'badge-green';
    if (tipo === 'Alerta') return 'badge-red';
    if (tipo === 'Omitida') return 'badge-red';
    return 'badge-blue';
  }

  marcarResuelta(idx: number): void {
    const alerta = this.alertas()[idx];
    if (alerta && alerta.id) {
      this.alertaSvc.resolver(alerta.id, 'Resuelta desde detalle de familiar').subscribe({
        next: () => {
          this.alertas.update(list => list.map((a, i) => i === idx ? { ...a, resuelta: true } : a));
          this.toast.set('Alerta marcada como resuelta');
          setTimeout(() => this.toast.set(null), 3500);
        }
      });
    }
  }

  abrirModal(): void {
    this.showModal.set(true);
  }

  cerrarModal(recargar: boolean): void {
    this.showModal.set(false);
    if (recargar && this.adulto) {
      this.toast.set('Perfil actualizado exitosamente');
      this.cargarAdulto(this.adulto.idAdulto);
    }
  }

  formatearFecha(fecha: string | null | undefined): string {
    if (!fecha) return 'Sin sincronización';
    try {
      const date = new Date(fecha);
      if (isNaN(date.getTime())) return 'Sin sincronización';
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
      return 'Sin sincronización';
    }
  }
}
