import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { AdultoMayorService } from '../../../../core/services/adulto-mayor.service';
import { AdultoMayor, AdultoMayorCreate, AdultoMayorUpdate } from '../../../../core/models/adulto-mayor.model';

type ModalMode = 'create' | 'edit' | null;

@Component({
  selector: 'app-lista-adultos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './lista-adultos.component.html',
  styleUrl: './lista-adultos.component.scss'
})
export class ListaAdultosComponent implements OnInit {
  private adultoSvc = inject(AdultoMayorService);
  private fb = inject(FormBuilder);

  adultos = signal<AdultoMayor[]>([]);
  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);
  toast = signal<{ msg: string; type: 'success' | 'error' } | null>(null);
  
  modalMode = signal<ModalMode>(null);
  selected = signal<AdultoMayor | null>(null);

  form!: FormGroup;

  ngOnInit(): void {
    this.buildForm();
    this.cargarAdultos();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      fechaNacimiento: ['', Validators.required],
      condicionesMedicas: [''],
      contactoMedico: ['']
    });
  }

  cargarAdultos(): void {
    this.loading.set(true);
    // Para Familiar, obtiene sus adultos. Asumiendo que el ID del familiar viene del token JWT
    // getMisPacientes enviará la solicitud y el backend resolverá por token.
    this.adultoSvc.getMisPacientes().subscribe({
      next: (data) => {
        this.adultos.set(data);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(e.mensaje ?? 'Error al cargar adultos mayores');
        this.loading.set(false);
      }
    });
  }

  openCreate(): void {
    this.form.reset();
    this.selected.set(null);
    this.modalMode.set('create');
  }

  openEdit(adulto: AdultoMayor): void {
    this.selected.set(adulto);
    this.form.patchValue({
      nombre: adulto.nombre,
      apellido: adulto.apellido,
      fechaNacimiento: adulto.fechaNacimiento,
      condicionesMedicas: adulto.condicionesMedicas,
      contactoMedico: adulto.contactoMedico
    });
    this.modalMode.set('edit');
  }

  closeModal(): void {
    this.modalMode.set(null);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const val = this.form.value;

    if (this.modalMode() === 'create') {
      const payload: AdultoMayorCreate = val;
      this.adultoSvc.create(payload).subscribe({
        next: () => {
          this.showToast('Adulto mayor registrado', 'success');
          this.closeModal();
          this.cargarAdultos();
        },
        error: (e) => {
          this.showToast(e.mensaje ?? 'Error', 'error');
          this.saving.set(false);
        }
      });
    } else if (this.modalMode() === 'edit' && this.selected()) {
      const payload: AdultoMayorUpdate = val;
      this.adultoSvc.update(this.selected()!.idAdulto, payload).subscribe({
        next: () => {
          this.showToast('Adulto mayor actualizado', 'success');
          this.closeModal();
          this.cargarAdultos();
        },
        error: (e) => {
          this.showToast(e.mensaje ?? 'Error', 'error');
          this.saving.set(false);
        }
      });
    }
  }

  private showToast(msg: string, type: 'success' | 'error'): void {
    this.saving.set(false);
    this.toast.set({ msg, type });
    setTimeout(() => this.toast.set(null), 4000);
  }

  f(name: string): AbstractControl { return this.form.get(name)!; }
  isInvalid(name: string): boolean { const c = this.f(name); return c.invalid && c.touched; }
}
