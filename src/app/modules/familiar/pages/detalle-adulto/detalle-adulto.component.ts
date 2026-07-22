import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { AdultoMayorService } from '../../../../core/services/adulto-mayor.service';
import { MedicamentoService } from '../../../../core/services/medicamento.service';
import { HistorialService } from '../../../../core/services/historial.service';
import { AlertaService } from '../../../../core/services/alerta.service';
import { DispositivoIotService } from '../../../../core/services/dispositivo-iot.service';
import { LecturaPulseraService } from '../../../../core/services/lectura-pulsera.service';
import { FormularioAdultoComponent } from '../formulario-adulto/formulario-adulto.component';
import { catchError, forkJoin, of } from 'rxjs';

type Tab = 'medicamentos' | 'historial' | 'alertas' | 'dispositivo';

interface Medicamento { nombre: string; dosis: string; horario: string; estado: string; }
interface Evento { fecha: string; tipo: string; descripcion: string; metodo: string; }
interface Alerta { id?: number; titulo: string; descripcion: string; tipo: string; hora: string; resuelta: boolean; }
interface Dispositivo { nombre: string; id: string; tipo: string; estado: string; bateria: number | null; sync: string; }

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
  private lecturaPulseraService = inject(LecturaPulseraService);

  tabActiva = signal<Tab>('medicamentos');
  toast = signal<string | null>(null);

  adulto: any = null;
  cargando = signal<boolean>(true);
  showModal = signal<boolean>(false);

  medicamentos: Medicamento[] = [];
  historial: Evento[] = [];
  alertas = signal<Alerta[]>([]);

  dispositivos = signal<Dispositivo[]>([]);

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
    forkJoin({
      dispositivos: this.dispSvc.listarPorAdulto(id).pipe(catchError(() => of({ data: [] }))),
      ultimaPulsera: this.lecturaPulseraService.obtenerUltimaLectura(id).pipe(catchError(() => of(null)))
    }).subscribe(({ dispositivos, ultimaPulsera }) => {
      const list = (dispositivos && dispositivos.data) ? dispositivos.data : [];
      let result: Dispositivo[] = [];

      if (list.length > 0) {
        result = list.map((d: any) => {
          const esPulsera = d.tipoDispositivo !== 'pastillero_esp32';
          if (esPulsera && ultimaPulsera) {
            return {
              nombre: 'Pulsera Inteligente',
              tipo: 'pulsera',
              id: ultimaPulsera.identificadorFisico || d.identificadorFisico || 'Sin ID',
              estado: 'online',
              bateria: ultimaPulsera.nivelBateria !== null ? ultimaPulsera.nivelBateria : 100,
              sync: ultimaPulsera.fechaRecepcion ? this.formatearFecha(ultimaPulsera.fechaRecepcion) : (ultimaPulsera.fechaMedicion ? this.formatearFecha(ultimaPulsera.fechaMedicion) : 'Hace pocos minutos')
            };
          } else if (esPulsera) {
            return {
              nombre: 'Pulsera Inteligente',
              tipo: 'pulsera',
              id: d.identificadorFisico || 'Sin ID',
              estado: d.activo ? 'online' : 'offline',
              bateria: null,
              sync: d.ultimaConexion ? this.formatearFecha(d.ultimaConexion) : 'Sin sincronización'
            };
          } else {
            return {
              nombre: 'Pastillero ESP32',
              tipo: 'pastillero',
              id: d.identificadorFisico || 'Sin ID',
              estado: d.activo ? 'online' : 'offline',
              bateria: 85,
              sync: d.ultimaConexion ? this.formatearFecha(d.ultimaConexion) : 'Hace pocos minutos'
            };
          }
        });
      }

      // Si no se encontró pulsera en el listado pero existe una lectura real de pulsera en la BD
      const tienePulseraEnLista = result.some(d => d.tipo === 'pulsera');
      if (!tienePulseraEnLista && ultimaPulsera) {
        result.push({
          nombre: 'Pulsera Inteligente',
          tipo: 'pulsera',
          id: ultimaPulsera.identificadorFisico || 'FF:FF:FF:F2:02:00',
          estado: 'online',
          bateria: ultimaPulsera.nivelBateria !== null ? ultimaPulsera.nivelBateria : 100,
          sync: ultimaPulsera.fechaRecepcion ? this.formatearFecha(ultimaPulsera.fechaRecepcion) : this.formatearFecha(ultimaPulsera.fechaMedicion)
        });
      }

      this.dispositivos.set(result);
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
