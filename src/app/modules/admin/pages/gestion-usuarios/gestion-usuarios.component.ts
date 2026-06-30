import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type RolUsuario = 'Familiar' | 'Cuidador' | 'Administrador';
type ModalMode = 'crear' | 'editar' | null;

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: RolUsuario;
  activo: boolean;
  createdAt: string;
  ultimoAcceso: string;
  wechat: boolean;
}

interface UsuarioForm {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  confirmPassword: string;
  rol: RolUsuario;
  wechatOpenId: string;
}

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-usuarios.component.html',
  styleUrls: ['./gestion-usuarios.component.scss']
})
export class GestionUsuariosComponent {
  readonly roles: RolUsuario[] = ['Familiar', 'Cuidador', 'Administrador'];

  filtroTexto = signal('');
  filtroRol = signal<RolUsuario | ''>('');
  filtroEstado = signal<'activo' | 'inactivo' | ''>('');
  modalMode = signal<ModalMode>(null);
  selectedUser = signal<Usuario | null>(null);
  toast = signal<{ msg: string; type: 'success' | 'error' } | null>(null);

  form = signal<UsuarioForm>({
    nombre: '', apellido: '', email: '',
    password: '', confirmPassword: '',
    rol: 'Familiar', wechatOpenId: ''
  });

  usuarios = signal<Usuario[]>([
    { id: 1, nombre: 'María',   apellido: 'García',   email: 'maria@sima.mx',   rol: 'Familiar',      activo: true,  createdAt: '01/01/2026', ultimoAcceso: 'Hace 2 h',  wechat: true  },
    { id: 2, nombre: 'Carlos',  apellido: 'Andrade',  email: 'carlos@sima.mx',  rol: 'Cuidador',      activo: true,  createdAt: '05/02/2026', ultimoAcceso: 'Hace 4 h',  wechat: false },
    { id: 3, nombre: 'Pedro',   apellido: 'López',    email: 'pedro@sima.mx',   rol: 'Familiar',      activo: true,  createdAt: '10/02/2026', ultimoAcceso: 'Ayer',       wechat: true  },
    { id: 4, nombre: 'Laura',   apellido: 'Vega',     email: 'laura@sima.mx',   rol: 'Cuidador',      activo: true,  createdAt: '15/03/2026', ultimoAcceso: 'Hace 1 d',  wechat: false },
    { id: 5, nombre: 'Ana',     apellido: 'Torres',   email: 'ana@sima.mx',     rol: 'Familiar',      activo: false, createdAt: '20/03/2026', ultimoAcceso: 'Hace 3 d',  wechat: true  },
    { id: 6, nombre: 'Marco',   apellido: 'Torres',   email: 'marco@sima.mx',   rol: 'Cuidador',      activo: true,  createdAt: '01/04/2026', ultimoAcceso: 'Hace 5 h',  wechat: false },
    { id: 7, nombre: 'Juan',    apellido: 'Flores',   email: 'juan@sima.mx',    rol: 'Familiar',      activo: true,  createdAt: '10/04/2026', ultimoAcceso: 'Hace 2 d',  wechat: true  },
    { id: 8, nombre: 'Admin',   apellido: 'SIMA',     email: 'admin@sima.mx',   rol: 'Administrador', activo: true,  createdAt: '01/01/2026', ultimoAcceso: 'Ahora',      wechat: false },
  ]);

  usuariosFiltrados = computed(() => {
    const txt  = this.filtroTexto().toLowerCase();
    const rol  = this.filtroRol();
    const est  = this.filtroEstado();
    return this.usuarios().filter(u => {
      const matchTxt = !txt || u.nombre.toLowerCase().includes(txt) || u.apellido.toLowerCase().includes(txt) || u.email.toLowerCase().includes(txt);
      const matchRol = !rol || u.rol === rol;
      const matchEst = !est || (est === 'activo' ? u.activo : !u.activo);
      return matchTxt && matchRol && matchEst;
    });
  });

  iniciales(u: Usuario): string {
    return (u.nombre.charAt(0) + u.apellido.charAt(0)).toUpperCase();
  }

  avatarBg(u: Usuario): string {
    const map: Record<RolUsuario, string> = {
      Administrador: '#2E86AB',
      Familiar: '#52B788',
      Cuidador: '#F4A261'
    };
    return map[u.rol];
  }

  rolBadge(rol: RolUsuario): { bg: string; color: string } {
    const map: Record<RolUsuario, { bg: string; color: string }> = {
      Administrador: { bg: '#EBF5FB', color: '#1E5F7A' },
      Familiar:      { bg: '#D8F3DC', color: '#1A7A4A' },
      Cuidador:      { bg: '#FEF3E2', color: '#B47B12' }
    };
    return map[rol];
  }

  openCreate(): void {
    this.form.set({ nombre: '', apellido: '', email: '', password: '', confirmPassword: '', rol: 'Familiar', wechatOpenId: '' });
    this.selectedUser.set(null);
    this.modalMode.set('crear');
  }

  openEdit(u: Usuario): void {
    this.form.set({ nombre: u.nombre, apellido: u.apellido, email: u.email, password: '', confirmPassword: '', rol: u.rol, wechatOpenId: '' });
    this.selectedUser.set(u);
    this.modalMode.set('editar');
  }

  setField<K extends keyof UsuarioForm>(key: K, value: UsuarioForm[K]): void {
    this.form.update(f => ({ ...f, [key]: value }));
  }

  closeModal(): void { this.modalMode.set(null); }

  guardar(): void {
    const f = this.form();
    if (!f.nombre.trim() || !f.apellido.trim() || !f.email.trim()) return;
    if (this.modalMode() === 'crear') {
      this.usuarios.update(list => [...list, {
        id: list.length + 1,
        nombre: f.nombre, apellido: f.apellido,
        email: f.email, rol: f.rol,
        activo: true,
        createdAt: new Date().toLocaleDateString('es-MX'),
        ultimoAcceso: 'Nunca',
        wechat: !!f.wechatOpenId
      }]);
      this.showToast('Usuario creado exitosamente', 'success');
    } else {
      const u = this.selectedUser();
      if (u) {
        this.usuarios.update(list => list.map(x => x.id === u.id
          ? { ...x, nombre: f.nombre, apellido: f.apellido, email: f.email, rol: f.rol }
          : x));
        this.showToast('Usuario actualizado', 'success');
      }
    }
    this.closeModal();
  }

  toggleActivo(u: Usuario): void {
    this.usuarios.update(list => list.map(x => x.id === u.id ? { ...x, activo: !x.activo } : x));
    this.showToast(u.activo ? 'Usuario desactivado' : 'Usuario activado', 'success');
  }

  private showToast(msg: string, type: 'success' | 'error'): void {
    this.toast.set({ msg, type });
    setTimeout(() => this.toast.set(null), 4000);
  }
}
