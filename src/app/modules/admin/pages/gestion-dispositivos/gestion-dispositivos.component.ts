import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { DispositivoIotService } from '../../../../core/services/dispositivo-iot.service';
import { AdultoMayorService }    from '../../../../core/services/adulto-mayor.service';
import { DispositivoIot, DispositivoCreate, TipoDispositivo, EstadoDispositivo } from '../../../../core/models/dispositivo-iot.model';
import { AdultoMayor } from '../../../../core/models/adulto-mayor.model';

type ModalMode = 'create' | 'edit' | null;

/**
 * Componente para la administración y asignación de dispositivos IoT.
 * Implementación para HU-18: Registrar y asignar dispositivos IoT a un adulto mayor.
 */
@Component({
  selector: 'app-gestion-dispositivos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './gestion-dispositivos.component.html',
  styleUrl: './gestion-dispositivos.component.scss'
})
export class GestionDispositivosComponent implements OnInit {
  private fb      = inject(FormBuilder);
  private svc     = inject(DispositivoIotService);
  private adultoSvc = inject(AdultoMayorService);

  // ─── State ────────────────────────────────────────────────────────────────
  dispositivos  = signal<DispositivoIot[]>([]);
  adultos       = signal<AdultoMayor[]>([]);
  loading       = signal(true);
  saving        = signal(false);
  error         = signal<string | null>(null);
  toast         = signal<{ msg: string; type: 'success' | 'error' } | null>(null);

  modalMode     = signal<ModalMode>(null);
  selected      = signal<DispositivoIot | null>(null);
  confirmDelete = signal<DispositivoIot | null>(null);

  filtroTexto   = signal('');
  filtroEstado  = signal<EstadoDispositivo | ''>('');

  readonly tiposDispositivo: { value: TipoDispositivo; label: string }[] = [
    { value: 'pulsera',       label: 'Pulsera inteligente' },
    { value: 'sensor_cama',   label: 'Sensor de cama' },
    { value: 'boton_panico',  label: 'Botón de pánico' },
    { value: 'glucometro',    label: 'Glucómetro' },
    { value: 'tensimetro',    label: 'Tensiómetro' },
    { value: 'camara',        label: 'Cámara' },
    { value: 'otro',          label: 'Otro' },
  ];

  readonly estadosDispositivo: { value: EstadoDispositivo; label: string }[] = [
    { value: 'activo',        label: 'Activo' },
    { value: 'inactivo',      label: 'Inactivo' },
    { value: 'mantenimiento', label: 'Mantenimiento' },
    { value: 'desconectado',  label: 'Desconectado' },
  ];

  form!: FormGroup;

  // ─── Computed ─────────────────────────────────────────────────────────────
  dispositivosFiltrados = computed(() => {
    const txt    = this.filtroTexto().toLowerCase();
    const estado = this.filtroEstado();
    return this.dispositivos().filter(d => {
      const matchTxt = !txt ||
        d.nombre.toLowerCase().includes(txt) ||
        (d.numeroSerie ?? '').toLowerCase().includes(txt) ||
        (d.adultoMayorNombre ?? '').toLowerCase().includes(txt);
      const matchEstado = !estado || d.estado === estado;
      return matchTxt && matchEstado;
    });
  });

  stats = computed(() => {
    const all = this.dispositivos();
    return {
      total:          all.length,
      activos:        all.filter(d => d.estado === 'activo').length,
      desconectados:  all.filter(d => d.estado === 'desconectado').length,
      sinAsignar:     all.filter(d => !d.adultoMayorId).length,
    };
  });

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.buildForm();
    this.cargar();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      nombre:       ['', [Validators.required, Validators.minLength(2)]],
      tipo:         ['pulsera', Validators.required],
      modelo:       [''],
      numeroSerie:  [''],
      adultoMayorId:[''],
    });
  }

  private cargar(): void {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: r => {
        this.dispositivos.set(r.data ?? []);
        this.loading.set(false);
      },
      error: e => { this.error.set(e.mensaje ?? 'Error al cargar'); this.loading.set(false); }
    });
    this.adultoSvc.getAll().subscribe({
      next: r => this.adultos.set(r.data ?? []),
      error: () => {}
    });
  }

  // ─── Modal ────────────────────────────────────────────────────────────────
  openCreate(): void {
    this.form.reset({ tipo: 'pulsera' });
    this.selected.set(null);
    this.modalMode.set('create');
  }

  openEdit(d: DispositivoIot): void {
    this.selected.set(d);
    this.form.patchValue({
      nombre: d.nombre, tipo: d.tipo,
      modelo: d.modelo ?? '', numeroSerie: d.numeroSerie ?? '',
      adultoMayorId: d.adultoMayorId ?? '',
    });
    this.modalMode.set('edit');
  }

  closeModal(): void { this.modalMode.set(null); }

  // ─── Submit ───────────────────────────────────────────────────────────────
  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const val = this.form.value;

    const payload: DispositivoCreate = {
      nombre: val.nombre, tipo: val.tipo,
      modelo: val.modelo || undefined,
      numeroSerie: val.numeroSerie || undefined,
      adultoMayorId: val.adultoMayorId ? Number(val.adultoMayorId) : undefined,
    };

    if (this.modalMode() === 'create') {
      this.svc.create(payload).subscribe({
        next: () => { this.showToast('Dispositivo registrado', 'success'); this.closeModal(); this.cargar(); },
        error: e  => { this.showToast(e.mensaje ?? 'Error', 'error'); this.saving.set(false); }
      });
    } else {
      this.svc.update(this.selected()!.id, payload).subscribe({
        next: () => { this.showToast('Dispositivo actualizado', 'success'); this.closeModal(); this.cargar(); },
        error: e  => { this.showToast(e.mensaje ?? 'Error', 'error'); this.saving.set(false); }
      });
    }
  }

  // ─── Delete ───────────────────────────────────────────────────────────────
  pedirConfirmacion(d: DispositivoIot): void { this.confirmDelete.set(d); }
  cancelarEliminar(): void { this.confirmDelete.set(null); }
  confirmarEliminar(): void {
    const d = this.confirmDelete();
    if (!d) return;
    this.svc.delete(d.id).subscribe({
      next: () => { this.showToast('Dispositivo eliminado', 'success'); this.confirmDelete.set(null); this.cargar(); },
      error: e  => { this.showToast(e.mensaje ?? 'Error', 'error'); this.confirmDelete.set(null); }
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  private showToast(msg: string, type: 'success' | 'error'): void {
    this.saving.set(false);
    this.toast.set({ msg, type });
    setTimeout(() => this.toast.set(null), 4000);
  }

  f(name: string): AbstractControl { return this.form.get(name)!; }
  isInvalid(name: string): boolean { const c = this.f(name); return c.invalid && c.touched; }

  estadoClass(estado: EstadoDispositivo): string {
    return { activo: 'success', inactivo: 'warning', mantenimiento: 'info', desconectado: 'danger' }[estado] ?? 'primary';
  }

  tipoLabel(tipo: TipoDispositivo): string {
    return this.tiposDispositivo.find(t => t.value === tipo)?.label ?? tipo;
  }

  batteryColor(nivel?: number): string {
    if (nivel === undefined) return '#64748b';
    if (nivel > 50) return '#10b981';
    if (nivel > 20) return '#f59e0b';
    return '#ef4444';
  }

  getNombreAdulto(id?: number): string {
    if (!id) return 'No asignado';
    const a = this.adultos().find(x => x.idAdulto === id);
    return a ? `${a.nombre} ${a.apellido}` : 'Desconocido';
  }

  tipoIcon(tipo: TipoDispositivo): string {
    const icons: Record<TipoDispositivo, string> = {
      pulsera:      'M12 1C8.14 1 5 4.14 5 8c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 5.5 12 5.5s2.5 1.12 2.5 2.5S13.38 10.5 12 10.5z',
      sensor_cama:  'M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3v5h2v2h2v-2h10v2h2v-2h2v-5c0-1.66-1.34-3-3-3z',
      boton_panico: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
      glucometro:   'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z',
      tensimetro:   'M10.5 2c-2.5 0-4.5 2-4.5 4.5v7h-1c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h10c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1h-1v-7C15 4 13 2 10.5 2z',
      camara:       'M12 15.2c1.77 0 3.2-1.43 3.2-3.2 0-1.77-1.43-3.2-3.2-3.2-1.77 0-3.2 1.43-3.2 3.2 0 1.77 1.43 3.2 3.2 3.2zM20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z',
      otro:         'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z',
    };
    return icons[tipo] ?? icons.otro;
  }
}
