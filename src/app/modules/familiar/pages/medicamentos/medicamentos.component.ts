import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MedicamentoService } from '../../../../core/services/medicamento.service';
import { AdultoMayorService } from '../../../../core/services/adulto-mayor.service';
import { Medicamento, MedicamentoCreate, FrecuenciaMedicamento } from '../../../../core/models/medicamento.model';
import { AdultoMayor } from '../../../../core/models/adulto-mayor.model';

type ModalMode = 'create' | 'edit' | null;

/**
 * Componente para agregar, editar o eliminar medicamentos de la agenda.
 * Implementación para HU-08: Agregar o editar agenda de medicamentos del adulto.
 */
@Component({
  selector: 'app-medicamentos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './medicamentos.component.html',
  styleUrl:    './medicamentos.component.scss'
})
export class MedicamentosComponent implements OnInit {
  private route      = inject(ActivatedRoute);
  private fb         = inject(FormBuilder);
  private medSvc     = inject(MedicamentoService);
  private adultoSvc  = inject(AdultoMayorService);

  // ─── State ────────────────────────────────────────────────────────────────
  medicamentos  = signal<Medicamento[]>([]);
  adultos       = signal<AdultoMayor[]>([]);
  adultoActual  = signal<AdultoMayor | null>(null);
  loading       = signal(true);
  saving        = signal(false);
  error         = signal<string | null>(null);
  toast         = signal<{ msg: string; type: 'success' | 'error' } | null>(null);
  modalMode     = signal<ModalMode>(null);
  selected      = signal<Medicamento | null>(null);
  confirmDelete = signal<Medicamento | null>(null);
  filtroTexto   = signal('');
  horasInput    = signal('');

  readonly frecuencias: { value: FrecuenciaMedicamento; label: string }[] = [
    { value: 'diario',       label: 'Diario' },
    { value: 'semanal',      label: 'Semanal' },
    { value: 'mensual',      label: 'Mensual' },
    { value: 'cada_X_horas', label: 'Cada X horas' },
  ];

  form!: FormGroup;

  // ─── Computed ─────────────────────────────────────────────────────────────
  medsFiltrados = computed(() => {
    const txt = this.filtroTexto().toLowerCase();
    return this.medicamentos().filter(m =>
      !txt || m.nombre.toLowerCase().includes(txt) ||
      (m.principioActivo ?? '').toLowerCase().includes(txt)
    );
  });

  statsHoy = computed(() => {
    const all = this.medicamentos().filter(m => m.activo);
    return { total: all.length, activos: all.length };
  });

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.buildForm();
    const adultoId = Number(this.route.snapshot.queryParamMap.get('adultoId')
                  ?? this.route.snapshot.paramMap.get('id'));

    this.adultoSvc.getAll().subscribe({ next: r => this.adultos.set(r.data ?? []) });

    if (adultoId) {
      this.adultoSvc.getById(adultoId).subscribe({ next: a => this.adultoActual.set(a) });
      this.cargarMedicamentos(adultoId);
    } else {
      this.loading.set(false);
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      nombre:         ['', [Validators.required, Validators.minLength(2)]],
      principioActivo:[''],
      dosis:          ['', Validators.required],
      frecuencia:     ['diario', Validators.required],
      horasToma:      [''],
      fechaInicio:    [new Date().toISOString().substring(0, 10), Validators.required],
      fechaFin:       [''],
      instrucciones:  [''],
      stockActual:    [null],
      stockMinimo:    [null],
      prescritoPor:   [''],
      adultoMayorId:  [''],
    });
  }

  cargarMedicamentos(adultoId: number): void {
    this.loading.set(true);
    this.medSvc.getByAdulto(adultoId).subscribe({
      next: meds => { this.medicamentos.set(meds); this.loading.set(false); },
      error: e   => { this.error.set(e.mensaje ?? 'Error'); this.loading.set(false); }
    });
  }

  // ─── Modal ────────────────────────────────────────────────────────────────
  openCreate(): void {
    this.form.reset({ frecuencia: 'diario', fechaInicio: new Date().toISOString().substring(0, 10),
                      adultoMayorId: this.adultoActual()?.idAdulto ?? '' });
    this.horasInput.set('');
    this.selected.set(null);
    this.modalMode.set('create');
  }

  openEdit(m: Medicamento): void {
    this.selected.set(m);
    this.form.patchValue({
      nombre: m.nombre, principioActivo: m.principioActivo ?? '',
      dosis: m.dosis, frecuencia: m.frecuencia,
      fechaInicio: m.fechaInicio?.substring(0, 10) ?? '',
      fechaFin: m.fechaFin?.substring(0, 10) ?? '',
      instrucciones: m.instrucciones ?? '',
      stockActual: m.stockActual ?? null, stockMinimo: m.stockMinimo ?? null,
      prescritoPor: m.prescritoPor ?? '',
      adultoMayorId: m.adultoMayorId,
    });
    this.horasInput.set((m.horasToma ?? []).map(h => `${h}:00`).join(', '));
    this.modalMode.set('edit');
  }

  closeModal(): void { this.modalMode.set(null); }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const val = this.form.value;

    const horasToma = this.horasInput()
      .split(',').map(h => parseInt(h.trim().split(':')[0], 10)).filter(n => !isNaN(n));

    const payload: MedicamentoCreate = {
      nombre: val.nombre, principioActivo: val.principioActivo || undefined,
      dosis: val.dosis, frecuencia: val.frecuencia,
      horasToma: horasToma.length ? horasToma : undefined,
      fechaInicio: val.fechaInicio, fechaFin: val.fechaFin || undefined,
      instrucciones: val.instrucciones || undefined,
      stockActual: val.stockActual ?? undefined, stockMinimo: val.stockMinimo ?? undefined,
      adultoMayorId: Number(val.adultoMayorId || this.adultoActual()?.idAdulto),
      prescritoPor: val.prescritoPor || undefined,
    };

    if (this.modalMode() === 'create') {
      this.medSvc.create(payload).subscribe({
        next: () => { this.showToast('Medicamento agregado', 'success'); this.closeModal(); this.recargar(); },
        error: e  => { this.showToast(e.mensaje ?? 'Error', 'error'); this.saving.set(false); }
      });
    } else {
      this.medSvc.update(this.selected()!.id, payload).subscribe({
        next: () => { this.showToast('Medicamento actualizado', 'success'); this.closeModal(); this.recargar(); },
        error: e  => { this.showToast(e.mensaje ?? 'Error', 'error'); this.saving.set(false); }
      });
    }
  }

  private recargar(): void {
    const id = this.adultoActual()?.idAdulto ?? Number(this.form.get('adultoMayorId')?.value);
    if (id) this.cargarMedicamentos(id);
  }

  pedirConfirmacion(m: Medicamento): void { this.confirmDelete.set(m); }
  cancelarEliminar(): void { this.confirmDelete.set(null); }
  confirmarEliminar(): void {
    const m = this.confirmDelete();
    if (!m) return;
    this.medSvc.delete(m.id).subscribe({
      next: () => { this.showToast('Medicamento eliminado', 'success'); this.confirmDelete.set(null); this.recargar(); },
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

  frecuenciaLabel(f: FrecuenciaMedicamento): string {
    return this.frecuencias.find(x => x.value === f)?.label ?? f;
  }

  formatHoras(horas?: number[]): string {
    if (!horas?.length) return '—';
    return horas.map(h => `${h.toString().padStart(2,'0')}:00`).join(' · ');
  }

  stockAlerta(m: Medicamento): boolean {
    return !!m.stockActual && !!m.stockMinimo && m.stockActual <= m.stockMinimo;
  }
}
