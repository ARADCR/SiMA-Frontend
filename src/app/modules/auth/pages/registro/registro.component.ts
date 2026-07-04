import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsuarioService } from '../../../../core/services/usuario.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss']
})
export class RegistroComponent {
  private fb      = inject(FormBuilder);
  private usuario = inject(UsuarioService);
  private router  = inject(Router);

  form: FormGroup = this.fb.group({
    nombre:   ['', Validators.required],
    apellido: ['', Validators.required],
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rol:      ['Familiar', Validators.required]
  });

  cargando = false;
  error    = '';

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.cargando = true;
    this.usuario.create(this.form.value).subscribe({
      next: () => { this.cargando = false; this.router.navigate(['/auth/login']); },
      error: err => { this.cargando = false; this.error = err?.mensaje || 'Error al registrar.'; }
    });
  }
}
