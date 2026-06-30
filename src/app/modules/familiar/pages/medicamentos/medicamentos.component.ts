import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type ModalMode = 'crear' | 'editar' | null;

interface MedCard {
  id: number;
  nombre: string;
  dosis: string;
  frecuencia: string;
  horarios: string[];
  estado: 'activo' | 'inactivo';
  notas: string;
  iconBg: string;
  iconColor: string;
}

interface MedForm {
  nombre: string;
  dosis: string;
  frecuencia: string;
  horasInput: string;
  notas: string;
}

@Component({
  selector: 'app-medicamentos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './medicamentos.component.html',
  styleUrls: ['./medicamentos.component.scss']
})
export class MedicamentosComponent {
  adultoSel = signal<string>('Elena Rodríguez');
  modalMode = signal<ModalMode>(null);
  selectedId = signal<number | null>(null);
  toast = signal<string | null>(null);
  saving = signal(false);

  adultos = ['Elena Rodríguez', 'José Rodríguez'];

  form: MedForm = { nombre: '', dosis: '', frecuencia: 'diario', horasInput: '', notas: '' };

  medicamentos = signal<MedCard[]>([
    { id: 1, nombre: 'Losartán 50mg', dosis: '1 tableta', frecuencia: 'Cada 12 horas', horarios: ['08:00', '20:00'], estado: 'activo', notas: 'Tomar con el estómago vacío. Controla la presión arterial.', iconBg: '#EBF5FB', iconColor: '#2E86AB' },
    { id: 2, nombre: 'Metformina 850mg', dosis: '1 tableta', frecuencia: 'Cada 8 horas', horarios: ['08:00', '14:00', '20:00'], estado: 'activo', notas: 'Tomar con alimentos. Control de glucosa en sangre.', iconBg: '#EBF5FB', iconColor: '#2E86AB' },
    { id: 3, nombre: 'Atorvastatina 20mg', dosis: '1 tableta', frecuencia: 'Cada 24 horas', horarios: ['21:00'], estado: 'activo', notas: 'Tomar por la noche. Control de colesterol.', iconBg: '#EBF5FB', iconColor: '#2E86AB' },
    { id: 4, nombre: 'Omeprazol 20mg', dosis: '1 cápsula', frecuencia: 'Cada 24 horas', horarios: ['07:00'], estado: 'activo', notas: 'Tomar 30 min antes del desayuno. Protector gástrico.', iconBg: '#EBF5FB', iconColor: '#2E86AB' },
    { id: 5, nombre: 'Aspirina 100mg', dosis: '1 tableta', frecuencia: 'Cada 24 horas', horarios: ['12:00'], estado: 'inactivo', notas: 'Suspendido por indicación médica.', iconBg: '#F0F4F8', iconColor: '#9CABB8' },
  ]);

  medsFiltrados = computed(() => this.medicamentos());

  openCrear(): void {
    this.form = { nombre: '', dosis: '', frecuencia: 'diario', horasInput: '', notas: '' };
    this.selectedId.set(null);
    this.modalMode.set('crear');
  }

  openEditar(m: MedCard): void {
    this.selectedId.set(m.id);
    this.form = { nombre: m.nombre, dosis: m.dosis, frecuencia: 'diario', horasInput: m.horarios.join(', '), notas: m.notas };
    this.modalMode.set('editar');
  }

  closeModal(): void { this.modalMode.set(null); }

  guardar(): void {
    if (!this.form.nombre || !this.form.dosis) return;
    this.saving.set(true);
    setTimeout(() => {
      if (this.modalMode() === 'crear') {
        const nuevo: MedCard = {
          id: Date.now(), nombre: this.form.nombre, dosis: this.form.dosis,
          frecuencia: this.form.frecuencia, horarios: this.form.horasInput.split(',').map(h => h.trim()).filter(Boolean),
          estado: 'activo', notas: this.form.notas, iconBg: '#EBF5FB', iconColor: '#2E86AB'
        };
        this.medicamentos.update(list => [...list, nuevo]);
        this.showToast('Medicamento agregado correctamente');
      } else {
        const id = this.selectedId();
        this.medicamentos.update(list => list.map(m => m.id === id ? {
          ...m, nombre: this.form.nombre, dosis: this.form.dosis,
          horarios: this.form.horasInput.split(',').map(h => h.trim()).filter(Boolean), notas: this.form.notas
        } : m));
        this.showToast('Medicamento actualizado correctamente');
      }
      this.saving.set(false);
      this.closeModal();
    }, 600);
  }

  eliminar(m: MedCard): void {
    this.medicamentos.update(list => list.filter(x => x.id !== m.id));
    this.showToast('Medicamento eliminado');
  }

  private showToast(msg: string): void {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(null), 3500);
  }
}
