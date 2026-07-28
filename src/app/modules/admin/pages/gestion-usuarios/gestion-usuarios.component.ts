import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../../core/services/usuario.service';
import {
  Usuario,
  UsuarioCreate,
  UsuarioUpdate,
  NombreRol,
  ROLES_DISPONIBLES
} from '../../../../core/models/usuario.model';

type ModalMode = 'crear' | 'editar' | null;

interface UsuarioForm {
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
  confirmPassword: string;
  idRol: number;
  telegramChatId: string;
}

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-usuarios.component.html',
  styleUrls: ['./gestion-usuarios.component.scss']
})
export class GestionUsuariosComponent implements OnInit {

  readonly rolesDisponibles = ROLES_DISPONIBLES;

  filtroTexto = signal('');
  filtroRol = signal<NombreRol | ''>('');
  filtroEstado = signal<'activo' | 'inactivo' | ''>('');
  modalMode = signal<ModalMode>(null);
  selectedUser = signal<Usuario | null>(null);
  isLoading = signal(false);
  toast = signal<{ msg: string; type: 'success' | 'error' } | null>(null);
  showDeleteModal = false;
  usuarioParaEliminar: Usuario | null = null;
  eliminando = false;

  form = signal<UsuarioForm>({
    nombre: '', apellido: '', correo: '',
    password: '', confirmPassword: '',
    idRol: 2, telegramChatId: ''
  });

  formErrors = signal<Partial<Record<keyof UsuarioForm, string>>>({});

  usuarios = signal<Usuario[]>([]);

  usuariosFiltrados = computed(() => {
    const txt = this.filtroTexto().toLowerCase();
    const rol = this.filtroRol();
    const est = this.filtroEstado();
    return this.usuarios().filter(u => {
      const matchTxt = !txt ||
        u.nombre.toLowerCase().includes(txt) ||
        u.apellido.toLowerCase().includes(txt) ||
        u.correo.toLowerCase().includes(txt);
      const matchRol = !rol || u.nombreRol === rol;
      const matchEst = !est || (est === 'activo' ? u.activo : !u.activo);
      return matchTxt && matchRol && matchEst;
    });
  });

  constructor(private usuarioService: UsuarioService) { }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.isLoading.set(true);
    this.usuarioService.listar().subscribe({
      next: lista => {
        this.usuarios.set(lista);
        this.isLoading.set(false);
      },
      error: (err: { mensaje?: string }) => {
        this.showToast(err.mensaje ?? 'Error al cargar usuarios', 'error');
        this.isLoading.set(false);
      }
    });
  }

  iniciales(u: Usuario): string {
    return (u.nombre.charAt(0) + u.apellido.charAt(0)).toUpperCase();
  }

  avatarBg(u: Usuario): string {
    const map: Record<NombreRol, string> = {
      Administrador: '#2E86AB',
      Familiar: '#52B788',
      Cuidador: '#F4A261',
      'Adulto Mayor': '#8338EC'
    };
    return map[u.nombreRol] ?? '#9CABB8';
  }

  rolBadge(rol: NombreRol): { bg: string; color: string } {
    const map: Record<NombreRol, { bg: string; color: string }> = {
      Administrador: { bg: '#EBF5FB', color: '#1E5F7A' },
      Familiar: { bg: '#D8F3DC', color: '#1A7A4A' },
      Cuidador: { bg: '#FEF3E2', color: '#B47B12' },
      'Adulto Mayor': { bg: '#F3E8FF', color: '#6B21A8' }
    };
    return map[rol] ?? { bg: '#F0F0F0', color: '#555' };
  }

  openCreate(): void {
    this.form.set({
      nombre: '', apellido: '', correo: '',
      password: '', confirmPassword: '',
      idRol: 2, telegramChatId: ''
    });
    this.formErrors.set({});
    this.selectedUser.set(null);
    this.modalMode.set('crear');
  }

  openEdit(u: Usuario): void {
    this.form.set({
      nombre: u.nombre,
      apellido: u.apellido,
      correo: u.correo,
      password: '',
      confirmPassword: '',
      idRol: u.idRol,
      telegramChatId: u.telegramChatId ?? ''
    });
    this.formErrors.set({});
    this.selectedUser.set(u);
    this.modalMode.set('editar');
  }

  setField<K extends keyof UsuarioForm>(key: K, value: UsuarioForm[K]): void {
    this.form.update(f => ({ ...f, [key]: value }));
  }

  closeModal(): void { this.modalMode.set(null); }

  validarFormulario(): boolean {
    const f = this.form();
    const errors: Partial<Record<keyof UsuarioForm, string>> = {};
    let isValid = true;

    if (!f.nombre.trim()) { errors.nombre = 'El nombre es obligatorio'; isValid = false; }
    if (!f.apellido.trim()) { errors.apellido = 'El apellido es obligatorio'; isValid = false; }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!f.correo.trim()) { 
      errors.correo = 'El correo es obligatorio'; 
      isValid = false; 
    } else if (!emailRegex.test(f.correo)) {
      errors.correo = 'Formato de correo inválido';
      isValid = false;
    }

    if (this.modalMode() === 'crear') {
      if (!f.password) { errors.password = 'La contraseña es obligatoria'; isValid = false; }
      else if (f.password.length < 6) { errors.password = 'Mínimo 6 caracteres'; isValid = false; }
      
      if (f.password !== f.confirmPassword) { errors.confirmPassword = 'Las contraseñas no coinciden'; isValid = false; }
    } else if (this.modalMode() === 'editar') {
      if (f.password && f.password.length < 6) { errors.password = 'Mínimo 6 caracteres'; isValid = false; }
      if (f.password && f.password !== f.confirmPassword) { errors.confirmPassword = 'Las contraseñas no coinciden'; isValid = false; }
    }

    this.formErrors.set(errors);
    
    if (!isValid) {
      this.showToast('Por favor, corrige los errores del formulario', 'error');
    }
    
    return isValid;
  }

  guardar(): void {
    if (!this.validarFormulario()) return;

    const f = this.form();

    if (this.modalMode() === 'crear') {
      const dto: UsuarioCreate = {
        nombre: f.nombre,
        apellido: f.apellido,
        correo: f.correo,
        password: f.password,
        idRol: f.idRol,
        telegramChatId: f.telegramChatId || null
      };
      this.isLoading.set(true);
      this.usuarioService.create(dto).subscribe({
        next: creado => {
          this.usuarios.update(list => [...list, creado]);
          this.showToast('Usuario creado exitosamente', 'success');
          this.closeModal();
          this.isLoading.set(false);
        },
        error: (err: { mensaje?: string }) => {
          this.showToast(err.mensaje ?? 'Error al crear usuario', 'error');
          this.isLoading.set(false);
        }
      });
    } else {
      const u = this.selectedUser();
      if (!u) return;
      const dto: UsuarioUpdate = {
        nombre: f.nombre,
        apellido: f.apellido,
        correo: f.correo,
        password: f.password || null,
        idRol: f.idRol,
        telegramChatId: f.telegramChatId || null
      };
      this.isLoading.set(true);
      this.usuarioService.update(u.idUsuario, dto).subscribe({
        next: actualizado => {
          this.usuarios.update(list =>
            list.map(x => x.idUsuario === u.idUsuario ? actualizado : x)
          );
          this.showToast('Usuario actualizado', 'success');
          this.closeModal();
          this.isLoading.set(false);
        },
        error: (err: { mensaje?: string }) => {
          this.showToast(err.mensaje ?? 'Error al actualizar usuario', 'error');
          this.isLoading.set(false);
        }
      });
    }
  }

  abrirModalEstado(u: Usuario): void {
    this.usuarioParaEliminar = u;
    this.showDeleteModal = true;
  }

  cerrarModalEstado(): void {
    this.showDeleteModal = false;
    this.usuarioParaEliminar = null;
    this.eliminando = false;
  }

  confirmarEstado(): void {
    if (!this.usuarioParaEliminar) return;
    this.eliminando = true;

    if (this.usuarioParaEliminar.activo) {
      this.usuarioService.desactivar(this.usuarioParaEliminar.idUsuario).subscribe({
        next: () => {
          this.usuarios.update(list =>
            list.map(x => x.idUsuario === this.usuarioParaEliminar!.idUsuario ? { ...x, activo: false } : x)
          );
          this.showToast('Usuario desactivado exitosamente', 'success');
          this.cerrarModalEstado();
        },
        error: (err: { mensaje?: string }) => {
          this.showToast(err.mensaje ?? 'Error al desactivar usuario', 'error');
          this.eliminando = false;
        }
      });
    } else {
      this.usuarioService.reactivar(this.usuarioParaEliminar.idUsuario).subscribe({
        next: () => {
          this.usuarios.update(list =>
            list.map(x => x.idUsuario === this.usuarioParaEliminar!.idUsuario ? { ...x, activo: true } : x)
          );
          this.showToast('Usuario reactivado exitosamente', 'success');
          this.cerrarModalEstado();
        },
        error: (err: { mensaje?: string }) => {
          this.showToast(err.mensaje ?? 'Error al reactivar usuario', 'error');
          this.eliminando = false;
        }
      });
    }
  }

  private showToast(msg: string, type: 'success' | 'error'): void {
    this.toast.set({ msg, type });
    setTimeout(() => this.toast.set(null), 4000);
  }
}

