import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AdultoMayorService } from '../../../../core/services/adulto-mayor.service';
import { AdultoMayor, AdultoMayorUpdate } from '../../../../core/models/adulto-mayor.model';

@Component({
  selector: 'app-detalle-adulto',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './detalle-adulto.component.html',
  styleUrl:    './detalle-adulto.component.scss'
})
export class DetalleAdultoComponent implements OnInit {
  private route    = inject(ActivatedRoute);
  private fb       = inject(FormBuilder);
  private svc      = inject(AdultoMayorService);

  adulto   = signal<AdultoMayor | null>(null);
  loading  = signal(true);
  saving   = signal(false);
  editMode = signal(false);
  error    = signal<string | null>(null);
  toast    = signal<{ msg: string; type: 'success' | 'error' } | null>(null);

  form!: FormGroup;

  ngOnInit(): void {
    this.buildForm();
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) this.cargar(id);
  }

  private buildForm(): void {
    this.form = this.fb.group({
      nombre:         ['', [Validators.required, Validators.minLength(2)]],
      apellido:       ['', [Validators.required, Validators.minLength(2)]],
      fechaNacimiento:['', Validators.required],
      condicionesMedicas: [''],
      contactoMedico: ['']
    });
  }

  private cargar(id: number): void {
    this.loading.set(true);
    this.svc.getById(id).subscribe({
      next: a => {
        this.adulto.set(a);
        this.cargarForm(a);
        this.loading.set(false);
      },
      error: e => { this.error.set(e.mensaje ?? 'Error al cargar'); this.loading.set(false); }
    });
  }

  private cargarForm(a: AdultoMayor): void {
    this.form.patchValue({
      nombre: a.nombre, apellido: a.apellido,
      fechaNacimiento: a.fechaNacimiento?.substring(0, 10) ?? '',
      condicionesMedicas: a.condicionesMedicas ?? '',
      contactoMedico: a.contactoMedico ?? ''
    });
  }

  toggleEdit(): void {
    if (this.editMode()) {
      const a = this.adulto();
      if (a) this.cargarForm(a);
    }
    this.editMode.set(!this.editMode());
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const a = this.adulto();
    if (!a) return;
    this.saving.set(true);

    const payload: AdultoMayorUpdate = { ...this.form.value };
    this.svc.update(a.idAdulto, payload).subscribe({
      next: updated => {
        this.adulto.set(updated);
        this.editMode.set(false);
        this.showToast('Datos actualizados correctamente', 'success');
      },
      error: e => this.showToast(e.mensaje ?? 'Error al guardar', 'error')
    });
  }

  private showToast(msg: string, type: 'success' | 'error'): void {
    this.saving.set(false);
    this.toast.set({ msg, type });
    setTimeout(() => this.toast.set(null), 4000);
  }

  f(name: string): AbstractControl { return this.form.get(name)!; }
  isInvalid(name: string): boolean { const c = this.f(name); return c.invalid && c.touched; }

  calcEdad(fecha?: string): number {
    if (!fecha) return 0;
    const hoy = new Date();
    const nac = new Date(fecha);
    let edad  = hoy.getFullYear() - nac.getFullYear();
    const m   = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
  }

  iniciales(a: AdultoMayor): string {
    return (a.nombre.charAt(0) + a.apellido.charAt(0)).toUpperCase();
  }
}
