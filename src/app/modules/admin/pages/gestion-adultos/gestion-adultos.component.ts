import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface AdultoMayor {
  id: number;
  nombre: string;
  initials: string;
  avatarBg: string;
  edad: number;
  fechaNac: string;
  curp: string;
  familiar: string;
  cuidador: string;
  dispositivo: string;
  compliance: number;
  activo: boolean;
}

interface AdultoForm {
  nombre: string;
  fechaNac: string;
  curp: string;
  familiar: string;
  cuidador: string;
}

@Component({
  selector: 'app-gestion-adultos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-adultos.component.html',
  styleUrls: ['./gestion-adultos.component.scss']
})
export class GestionAdultosComponent {
  busqueda = signal('');
  estadoFiltro = signal<'activo' | 'inactivo' | ''>('');
  modal = signal<'crear' | 'editar' | null>(null);
  toast = signal<string | null>(null);
  form = signal<AdultoForm>({ nombre: '', fechaNac: '', curp: '', familiar: '', cuidador: '' });

  adultos = signal<AdultoMayor[]>([
    { id: 1, nombre: 'Elena Rodríguez', initials: 'ER', avatarBg: '#2E86AB', edad: 78, fechaNac: '12/03/1948', curp: 'ROEE480312MDFDRX01', familiar: 'María García',  cuidador: 'Carlos Andrade', dispositivo: 'ESP32-001', compliance: 92, activo: true  },
    { id: 2, nombre: 'José Martínez',   initials: 'JM', avatarBg: '#52B788', edad: 82, fechaNac: '05/07/1944', curp: 'MARJ440705HDFRTX02', familiar: 'Pedro López',   cuidador: 'Laura Vega',     dispositivo: 'ESP32-003', compliance: 78, activo: true  },
    { id: 3, nombre: 'Rosa Pérez',      initials: 'RP', avatarBg: '#E76F51', edad: 75, fechaNac: '20/11/1951', curp: 'PERR511120MDFRZX03', familiar: 'Ana Torres',    cuidador: 'Carlos Andrade', dispositivo: '',          compliance: 65, activo: true  },
    { id: 4, nombre: 'Luis García',     initials: 'LG', avatarBg: '#F4A261', edad: 80, fechaNac: '18/04/1946', curp: 'GALA460418HDFRCX04', familiar: 'Ana Torres',    cuidador: '',               dispositivo: 'ESP32-007', compliance: 88, activo: true  },
    { id: 5, nombre: 'Carmen Flores',   initials: 'CF', avatarBg: '#9CABB8', edad: 73, fechaNac: '30/09/1953', curp: 'FLOC530930MDFRLX05', familiar: 'Juan Flores',   cuidador: '',               dispositivo: '',          compliance: 45, activo: false },
    { id: 6, nombre: 'Manuel Herrera',  initials: 'MH', avatarBg: '#6C63FF', edad: 85, fechaNac: '14/02/1941', curp: 'HERM410214HDFRRX06', familiar: 'María García',  cuidador: 'Laura Vega',     dispositivo: 'ESP32-011', compliance: 95, activo: true  },
  ]);

  adultosFiltrados = computed(() => {
    const txt = this.busqueda().toLowerCase();
    const est = this.estadoFiltro();
    return this.adultos().filter(a => {
      const matchTxt = !txt || a.nombre.toLowerCase().includes(txt) || a.curp.toLowerCase().includes(txt);
      const matchEst = !est || (est === 'activo' ? a.activo : !a.activo);
      return matchTxt && matchEst;
    });
  });

  totalActivos   = computed(() => this.adultos().filter(a => a.activo).length);
  conDispositivo = computed(() => this.adultos().filter(a => !!a.dispositivo).length);
  sinCuidador    = computed(() => this.adultos().filter(a => !a.cuidador && a.activo).length);

  complianceColor(v: number): string {
    if (v >= 80) return '#1A7A4A';
    if (v >= 60) return '#B47B12';
    return '#C0452A';
  }

  complianceBg(v: number): string {
    if (v >= 80) return '#D8F3DC';
    if (v >= 60) return '#FEF3E2';
    return '#FDE8E0';
  }

  complianceBarColor(v: number): string {
    if (v >= 80) return '#52B788';
    if (v >= 60) return '#F4A261';
    return '#E76F51';
  }

  abrirModal(modo: 'crear' | 'editar', adulto?: AdultoMayor): void {
    if (adulto) {
      this.form.set({ nombre: adulto.nombre, fechaNac: adulto.fechaNac, curp: adulto.curp, familiar: adulto.familiar, cuidador: adulto.cuidador });
    } else {
      this.form.set({ nombre: '', fechaNac: '', curp: '', familiar: '', cuidador: '' });
    }
    this.modal.set(modo);
  }

  setField<K extends keyof AdultoForm>(key: K, value: AdultoForm[K]): void {
    this.form.update(f => ({ ...f, [key]: value }));
  }

  cerrarModal(): void { this.modal.set(null); }

  guardar(): void {
    const f = this.form();
    if (!f.nombre.trim()) return;
    if (this.modal() === 'crear') {
      const words = f.nombre.trim().split(' ');
      const inits = (words[0]?.[0] ?? '') + (words[1]?.[0] ?? '');
      const colors = ['#2E86AB', '#52B788', '#E76F51', '#F4A261', '#6C63FF'];
      this.adultos.update(list => [...list, {
        id: list.length + 1,
        nombre: f.nombre,
        initials: inits.toUpperCase(),
        avatarBg: colors[list.length % colors.length],
        edad: 0, fechaNac: f.fechaNac, curp: f.curp,
        familiar: f.familiar, cuidador: f.cuidador,
        dispositivo: '', compliance: 0, activo: true
      }]);
    } else {
      const nombre = f.nombre;
      this.adultos.update(list => list.map(x => {
        if (x.nombre === nombre) return { ...x, ...f };
        return x;
      }));
    }
    this.cerrarModal();
    this.showToast('Adulto mayor guardado correctamente');
  }

  toggleEstado(a: AdultoMayor): void {
    this.adultos.update(list => list.map(x => x.id === a.id ? { ...x, activo: !x.activo } : x));
    this.showToast(`Adulto mayor ${a.activo ? 'desactivado' : 'activado'} correctamente`);
  }

  private showToast(msg: string): void {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(null), 3500);
  }
}
