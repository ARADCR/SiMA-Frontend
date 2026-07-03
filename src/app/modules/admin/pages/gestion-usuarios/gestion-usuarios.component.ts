import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { Usuario, UsuarioCreate, UsuarioUpdate } from '../../../../core/models/usuario.model';

type ModalMode = 'create' | 'edit' | null;

/**
 * Componente para la administración de usuarios del sistema.
 * Implementación para HU-17: Crear, editar o eliminar cuentas de familiares/cuidadores.
 */
@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './gestion-usuarios.component.html',
  styleUrl: './gestion-usuarios.component.scss'
})
export class GestionUsuariosComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(UsuarioService);

  // ─── State ────────────────────────────────────────────────────────────────
  usuarios = signal<Usuario[]>([]);
  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);
  toast = signal<{ msg: string; type: 'success' | 'error' } | null>(null);

  modalMode = signal<ModalMode>(null);
  selectedUser = signal<Usuario | null>(null);
  confirmDelete = signal<Usuario | null>(null);
  showPassword = signal(false);

  filtroTexto = signal('');
  filtroRol = signal<number | ''>('');
  filtroEstado = signal<'todos' | 'activos' | 'inactivos'>('todos');

  // idRol -> nombreRol, según tu DataSeeder: 1=Administrador, 2=Familiar, 3=Cuidador, 4=Adulto Mayor
  readonly roles: { idRol: number; nombreRol: string }[] = [
    { idRol: 2, nombreRol: 'Familiar' },
    { idRol: 3, nombreRol: 'Cuidador' },
    { idRol: 1, nombreRol: 'Administrador' },
    { idRol: 4, nombreRol: 'Adulto Mayor' },
  ];

  form!: FormGroup;

  // ─── Computed ─────────────────────────────────────────────────────────────
  usuariosFiltrados = computed(() => {
    const txt = this.filtroTexto().toLowerCase();
    const rol = this.filtroRol();
    const estado = this.filtroEstado();
    return this.usuarios().filter(u => {
      const matchTxt = !txt ||
        u.nombre.toLowerCase().includes(txt) ||
        u.apellido.toLowerCase().includes(txt) ||
        u.correo.toLowerCase().includes(txt);
      const matchRol = rol === '' || u.idRol === rol;
      const matchEstado = estado === 'todos' ||
        (estado === 'activos' && u.activo) ||
        (estado === 'inactivos' && !u.activo);
      return matchTxt && matchRol && matchEstado;
    });
  });

  stats = computed(() => {
    const all = this.usuarios();
    return {
      total: all.length,
      activos: all.filter(u => u.activo).length,
      familiares: all.filter(u => u.idRol === 2).length,
      cuidadores: all.filter(u => u.idRol === 3).length,
    };
  });

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.buildForm();
    this.cargarUsuarios();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8),
      Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).*$/)]],
      idRol: [2, Validators.required],
    });
  }

  // ─── API ──────────────────────────────────────────────────────────────────
  private cargarUsuarios(): void {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: r => {
        this.usuarios.set(r.data ?? []);
        this.loading.set(false);
      },
      error: e => {
        this.error.set(e.mensaje ?? 'Error al cargar usuarios');
        this.loading.set(false);
      }
    });
  }

  // ─── Modal ────────────────────────────────────────────────────────────────
  openCreate(): void {
    this.form.reset({ idRol: 2 });
    this.setPasswordRequired(true);
    this.showPassword.set(false);
    this.selectedUser.set(null);
    this.modalMode.set('create');
  }

  openEdit(u: Usuario): void {
    this.selectedUser.set(u);
    this.setPasswordRequired(false);
    this.form.patchValue({ nombre: u.nombre, apellido: u.apellido, correo: u.correo, idRol: u.idRol, password: '' });
    this.showPassword.set(false);
    this.modalMode.set('edit');
  }

  closeModal(): void { this.modalMode.set(null); }

  private setPasswordRequired(required: boolean): void {
    const ctrl = this.form.get('password')!;
    if (required) {
      ctrl.setValidators([Validators.required, Validators.minLength(8),
      Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).*$/)]);
    } else {
      ctrl.setValidators([Validators.minLength(8),
      Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).*$/)]);
    }
    ctrl.updateValueAndValidity();
  }

  // ─── Submit ───────────────────────────────────────────────────────────────
  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);

    const val = this.form.value;
    if (this.modalMode() === 'create') {
      const payload: UsuarioCreate = {
        nombre: val.nombre, apellido: val.apellido,
        correo: val.correo, password: val.password, idRol: val.idRol
      };
      this.svc.create(payload).subscribe({
        next: () => { this.showToast('Usuario creado exitosamente', 'success'); this.closeModal(); this.cargarUsuarios(); },
        error: e => { this.showToast(e.mensaje ?? 'Error al crear usuario', 'error'); this.saving.set(false); }
      });
    } else {
      const u = this.selectedUser()!;
      const payload: UsuarioUpdate = { nombre: val.nombre, apellido: val.apellido, correo: val.correo, idRol: val.idRol };
      if (val.password) payload.password = val.password;
      this.svc.update(u.idUsuario, payload).subscribe({
        next: () => { this.showToast('Usuario actualizado', 'success'); this.closeModal(); this.cargarUsuarios(); },
        error: e => { this.showToast(e.mensaje ?? 'Error al actualizar', 'error'); this.saving.set(false); }
      });
    }
  }

  // ─── Toggle activo ────────────────────────────────────────────────────────
  toggleActivo(u: Usuario): void {
    const obs = u.activo ? this.svc.desactivar(u.idUsuario) : this.svc.activar(u.idUsuario);
    obs.subscribe({
      next: () => {
        this.showToast(u.activo ? 'Usuario desactivado' : 'Usuario activado', 'success');
        this.cargarUsuarios();
      },
      error: e => this.showToast(e.mensaje ?? 'Error', 'error')
    });
  }

  // ─── Delete ───────────────────────────────────────────────────────────────
  pedirConfirmacion(u: Usuario): void { this.confirmDelete.set(u); }
  cancelarEliminar(): void { this.confirmDelete.set(null); }

  confirmarEliminar(): void {
    const u = this.confirmDelete();
    if (!u) return;
    this.svc.delete(u.idUsuario).subscribe({
      next: () => { this.showToast('Usuario eliminado', 'success'); this.confirmDelete.set(null); this.cargarUsuarios(); },
      error: e => { this.showToast(e.mensaje ?? 'Error al eliminar', 'error'); this.confirmDelete.set(null); }
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

  rolColor(idRol: number): string {
    return { 1: 'primary', 2: 'info', 3: 'warning', 4: 'neutral' }[idRol] || 'neutral';
  }

  iniciales(u: Usuario): string {
    return (u.nombre.charAt(0) + u.apellido.charAt(0)).toUpperCase();
  }
}