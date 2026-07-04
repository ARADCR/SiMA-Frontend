import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, FormArray, ValidatorFn, ValidationErrors } from '@angular/forms';
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
      !txt || m.nombre.toLowerCase().includes(txt)
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

    this.adultoSvc.getAll().subscribe({ 
      next: r => {
        const list = r.data ?? [];
        this.adultos.set(list);
        if (!adultoId && list.length > 0) {
          this.adultoActual.set(list[0]);
          this.cargarMedicamentos(list[0].idAdulto);
        } else if (!adultoId) {
          this.loading.set(false);
        }
      }
    });

    if (adultoId) {
      this.adultoSvc.getById(adultoId).subscribe({ next: a => this.adultoActual.set(a) });
      this.cargarMedicamentos(adultoId);
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      nombre:         ['', [Validators.required, Validators.minLength(2)]],
      principioActivo:[''],
      dosis:          ['', Validators.required],
      frecuencia:     ['diario', Validators.required],
      horarios:       this.fb.array([], this.horariosValidator()),
      fechaInicio:    [new Date().toISOString().substring(0, 10), Validators.required],
      fechaFin:       [''],
      instrucciones:  [''],
      stockActual:    [null],
      stockMinimo:    [null],
      prescritoPor:   [''],
      adultoMayorId:  [''],
    });
  }

  get horariosArray(): FormArray {
    return this.form.get('horarios') as FormArray;
  }

  addHorario(hora: string = '08:00'): void {
    if (this.horariosArray.length >= 10) return;
    this.horariosArray.push(this.fb.control(hora, Validators.required));
  }

  removeHorario(index: number): void {
    this.horariosArray.removeAt(index);
  }

  horariosValidator(): ValidatorFn {
    return (formArray: AbstractControl): ValidationErrors | null => {
      if (!(formArray instanceof FormArray)) return null;
      const values = formArray.controls.map(c => c.value);
      if (values.length === 0) return { requerido: true };
      if (values.length > 10) return { maximo: true };
      
      const unique = new Set(values);
      if (unique.size !== values.length) return { duplicado: true };
      return null;
    };
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
    this.horariosArray.clear();
    this.addHorario();
    this.selected.set(null);
    this.modalMode.set('create');
  }

  openEdit(m: Medicamento): void {
    this.selected.set(m);
    
    let freq = 'cada_X_horas';
    if (m.frecuenciaHoras === 24) freq = 'diario';
    else if (m.frecuenciaHoras === 168) freq = 'semanal';

    this.form.patchValue({
      nombre: m.nombre, principioActivo: '',
      dosis: m.dosis, frecuencia: freq,
      fechaInicio: m.creadoEn ? m.creadoEn.substring(0, 10) : new Date().toISOString().substring(0, 10),
      fechaFin: '',
      instrucciones: m.observaciones ?? '',
      stockActual: m.stockActual ?? null, stockMinimo: m.stockMinimo ?? null,
      prescritoPor: m.prescritoPor ?? '',
      adultoMayorId: m.idAdulto || '',
    });
    
    this.horariosArray.clear();
    const horas = m.horarios ?? [];
    if (horas.length > 0) {
      horas.forEach((h: any) => this.addHorario(h.horaProgramada.substring(0, 5)));
    } else {
      this.addHorario();
    }

    this.modalMode.set('edit');
  }

  closeModal(): void { this.modalMode.set(null); }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const val = this.form.value;

    const horasToma = (val.horarios || [])
      .map((h: string) => parseInt(h.split(':')[0], 10))
      .filter((n: number) => !isNaN(n));

    let freqHoras = 24;
    if (val.frecuencia === 'semanal') freqHoras = 168;
    else if (val.frecuencia === 'cada_X_horas') freqHoras = 8; // fallback razonable

    const payload: any = {
      idAdulto: Number(val.adultoMayorId || this.adultoActual()?.idAdulto),
      nombre: val.nombre,
      dosis: val.dosis,
      frecuenciaHoras: freqHoras,
      observaciones: val.instrucciones || undefined,
      horarios: horasToma.length ? horasToma.map((h: number) => ({ horaProgramada: `${h.toString().padStart(2, '0')}:00` })) : []
    };

    if (this.modalMode() === 'create') {
      this.medSvc.create(payload).subscribe({
        next: () => { this.showToast('Medicamento agregado', 'success'); this.closeModal(); this.recargar(); },
        error: e  => { this.showToast(e.mensaje ?? 'Error', 'error'); this.saving.set(false); }
      });
    } else {
      const idMed = this.selected()!.idMedicamento;
      this.medSvc.update(idMed, payload).subscribe({
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
    const idMed = m.idMedicamento;
    this.medSvc.delete(idMed).subscribe({
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

  formatHoras(horarios?: any[]): string {
    if (!horarios?.length) return '—';
    return horarios.map(h => h.horaProgramada.substring(0, 5)).join(' · ');
  }

  stockAlerta(m: Medicamento): boolean {
    return !!m.stockActual && !!m.stockMinimo && m.stockActual <= m.stockMinimo;
  }
}
