import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);

  form: FormGroup = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  cargando   = false;
  error      = '';
  mostrarPass = false;

  get emailCtrl()    { return this.form.get('email')!; }
  get passwordCtrl() { return this.form.get('password')!; }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.cargando = true;
    this.error    = '';

    this.auth.login(this.form.value).subscribe({
      next: () => {
        this.cargando = false;
        this.auth.redirigirPorRol();
      },
      error: (err) => {
        this.cargando = false;
        this.error = err?.mensaje || 'Credenciales incorrectas. Inténtalo de nuevo.';
      }
    });
  }

  toggleMostrarPass(): void {
    this.mostrarPass = !this.mostrarPass;
  }
}
