import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsuarioService } from '../../../../core/services/usuario.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="registro-page">
      <div class="registro-container">
        <div class="brand">
          <div class="brand-icon">S</div>
          <h1 class="brand-name">SiMA</h1>
        </div>
        <div class="registro-card">
          <h2>Crear cuenta</h2>
          <p class="sub">Completa los datos para registrarte</p>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <div class="form-group">
                <label>Nombre</label>
                <input type="text" formControlName="nombre" placeholder="Juan" id="registro-nombre"/>
              </div>
              <div class="form-group">
                <label>Apellido</label>
                <input type="text" formControlName="apellido" placeholder="Pérez" id="registro-apellido"/>
              </div>
            </div>
            <div class="form-group">
              <label>Correo electrónico</label>
              <input type="email" formControlName="email" placeholder="juan@ejemplo.com" id="registro-email"/>
            </div>
            <div class="form-group">
              <label>Contraseña</label>
              <input type="password" formControlName="password" placeholder="••••••••" id="registro-password"/>
            </div>
            <div class="form-group">
              <label>Rol</label>
              <select formControlName="rol" id="registro-rol">
                <option value="Familiar">Familiar</option>
                <option value="Cuidador">Cuidador</option>
              </select>
            </div>
            @if (error) { <p class="error">{{ error }}</p> }
            <button type="submit" [disabled]="cargando" id="registro-submit-btn">
              {{ cargando ? 'Registrando...' : 'Registrarse' }}
            </button>
          </form>
          <p class="login-link">¿Ya tienes cuenta? <a routerLink="/auth/login">Inicia sesión</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .registro-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0f172a; padding: 2rem; }
    .registro-container { width: 100%; max-width: 480px; display: flex; flex-direction: column; gap: 2rem; }
    .brand { display: flex; align-items: center; gap: 1rem; justify-content: center; }
    .brand-icon { width: 48px; height: 48px; background: linear-gradient(135deg, #4f46e5, #06b6d4); border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.25rem; font-weight: 900; }
    .brand-name { font-size: 2rem; font-weight: 900; background: linear-gradient(135deg, #4f46e5, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .registro-card { background: rgba(30,41,59,0.8); border: 1px solid #475569; border-radius: 1rem; padding: 2rem; }
    h2 { font-size: 1.5rem; font-weight: 700; color: #f1f5f9; margin-bottom: 0.25rem; }
    .sub { color: #94a3b8; font-size: 0.875rem; margin-bottom: 1.5rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
    label { font-size: 0.875rem; font-weight: 600; color: #94a3b8; }
    input, select { padding: 0.75rem 1rem; background: #334155; border: 1px solid #475569; border-radius: 0.5rem; color: #f1f5f9; font-size: 0.875rem; outline: none; transition: all 0.15s; }
    input:focus, select:focus { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79,70,229,0.15); }
    .error { color: #ef4444; font-size: 0.875rem; margin-bottom: 1rem; }
    button { width: 100%; padding: 0.875rem; background: linear-gradient(135deg, #4f46e5, #06b6d4); color: white; border: none; border-radius: 0.5rem; font-size: 1rem; font-weight: 700; cursor: pointer; transition: all 0.15s; }
    button:hover:not(:disabled) { opacity: 0.9; }
    button:disabled { opacity: 0.7; cursor: not-allowed; }
    .login-link { text-align: center; margin-top: 1rem; font-size: 0.875rem; color: #94a3b8; }
    .login-link a { color: #818cf8; }
    .login-link a:hover { text-decoration: underline; }
  `]
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
