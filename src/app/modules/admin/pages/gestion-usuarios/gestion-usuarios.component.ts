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
  wechatOpenid: string;
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
  filtroRol   = signal<NombreRol | ''>('');
  filtroEstado = signal<'activo' | 'inactivo' | ''>('');
  modalMode   = signal<ModalMode>(null);
  selectedUser = signal<Usuario | null>(null);
  isLoading   = signal(false);
  toast       = signal<{ msg: string; type: 'success' | 'error' } | null>(null);

  form = signal<UsuarioForm>({
    nombre: '', apellido: '', correo: '',
    password: '', confirmPassword: '',
    idRol: 2, wechatOpenid: ''
  });

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

  constructor(private usuarioService: UsuarioService) {}

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
      Familiar:      '#52B788',
      Cuidador:      '#F4A261'
    };
    return map[u.nombreRol] ?? '#9CABB8';
  }

  rolBadge(rol: NombreRol): { bg: string; color: string } {
    const map: Record<NombreRol, { bg: string; color: string }> = {
      Administrador: { bg: '#EBF5FB', color: '#1E5F7A' },
      Familiar:      { bg: '#D8F3DC', color: '#1A7A4A' },
      Cuidador:      { bg: '#FEF3E2', color: '#B47B12' }
    };
    return map[rol] ?? { bg: '#F0F0F0', color: '#555' };
  }

  openCreate(): void {
    this.form.set({
      nombre: '', apellido: '', correo: '',
      password: '', confirmPassword: '',
      idRol: 2, wechatOpenid: ''
    });
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
      wechatOpenid: u.wechatOpenid ?? ''
    });
    this.selectedUser.set(u);
    this.modalMode.set('editar');
  }

  setField<K extends keyof UsuarioForm>(key: K, value: UsuarioForm[K]): void {
    this.form.update(f => ({ ...f, [key]: value }));
  }

  closeModal(): void { this.modalMode.set(null); }

  guardar(): void {
    const f = this.form();
    if (!f.nombre.trim() || !f.apellido.trim() || !f.correo.trim()) return;

    if (this.modalMode() === 'crear') {
      if (!f.password) return;
      const dto: UsuarioCreate = {
        nombre: f.nombre,
        apellido: f.apellido,
        correo: f.correo,
        password: f.password,
        idRol: f.idRol,
        wechatOpenid: f.wechatOpenid || null
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
        wechatOpenid: f.wechatOpenid || null
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

  confirmarDesactivar(u: Usuario): void {
    if (!confirm(`¿Desactivar la cuenta de ${u.nombre} ${u.apellido}? El historial se conservará.`)) return;
    this.usuarioService.desactivar(u.idUsuario).subscribe({
      next: () => {
        this.usuarios.update(list =>
          list.map(x => x.idUsuario === u.idUsuario ? { ...x, activo: false } : x)
        );
        this.showToast('Usuario desactivado', 'success');
      },
      error: (err: { mensaje?: string }) => {
        this.showToast(err.mensaje ?? 'Error al desactivar usuario', 'error');
      }
    });
  }

  private showToast(msg: string, type: 'success' | 'error'): void {
    this.toast.set({ msg, type });
    setTimeout(() => this.toast.set(null), 4000);
  }
}

