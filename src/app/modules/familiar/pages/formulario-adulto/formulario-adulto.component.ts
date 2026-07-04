import { Component, OnInit, OnChanges, SimpleChanges, inject, signal, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AdultoMayorService } from '../../../../core/services/adulto-mayor.service';

@Component({
  selector: 'app-formulario-adulto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formulario-adulto.component.html',
  styleUrls: ['./formulario-adulto.component.scss']
})
export class FormularioAdultoComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  private adultoService = inject(AdultoMayorService);

  @Input() idAdulto: number | null = null;
  @Output() close = new EventEmitter<boolean>();

  form!: FormGroup;
  cargando = signal<boolean>(false);
  guardando = signal<boolean>(false);
  errorMsg = signal<string | null>(null);

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idAdulto']) {
      if (this.idAdulto) {
        this.cargarDatosAdulto(this.idAdulto);
      } else {
        if (this.form) this.form.reset();
      }
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      curp: ['', [Validators.pattern(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z\d]\d$/i)]],
      fechaNacimiento: ['', [Validators.required, this.fechaPasadaValidator]],
      condicionesMedicas: [''],
      contactoMedico: ['']
    });
  }

  private fechaPasadaValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const date = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today ? { futureDate: true } : null;
  }

  private cargarDatosAdulto(id: number): void {
    this.cargando.set(true);
    this.adultoService.getById(id).subscribe({
      next: (adulto) => {
        this.form.patchValue({
          nombre: adulto.nombre,
          apellido: adulto.apellido,
          fechaNacimiento: adulto.fechaNacimiento,
          condicionesMedicas: adulto.condicionesMedicas,
          contactoMedico: adulto.contactoMedico,
          // Nota: CURP no está en la respuesta actual del backend según el análisis inicial,
          // pero lo dejamos preparado en el form por si se agrega.
        });
        this.cargando.set(false);
      },
      error: (err) => {
        this.errorMsg.set('No se pudo cargar la información del adulto mayor.');
        this.cargando.set(false);
      }
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.errorMsg.set(null);
    const dto = this.form.value;

    const req$ = this.idAdulto 
      ? this.adultoService.update(this.idAdulto, dto)
      : this.adultoService.create(dto);

    req$.subscribe({
      next: () => {
        this.guardando.set(false);
        this.close.emit(true);
      },
      error: (err) => {
        this.guardando.set(false);
        this.errorMsg.set(err.error?.message || 'Ocurrió un error al guardar los datos.');
      }
    });
  }

  cerrar(): void {
    this.close.emit(false);
  }
}
