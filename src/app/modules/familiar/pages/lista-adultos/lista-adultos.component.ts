import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdultoMayorService } from '../../../../core/services/adulto-mayor.service';
import { FormularioAdultoComponent } from '../formulario-adulto/formulario-adulto.component';

interface AdultoCard {
  id: number;
  nombre: string;
  initials: string;
  avatarColor: string;
  edad: number;
  relacion: string;
  condiciones: string[];
  cuidador: string;
  cuidadorTel: string;
  dispositivoOnline: boolean;
  medsCount: number;
  cumplimiento: number;
  cumplimientoColor: string;
}

@Component({
  selector: 'app-lista-adultos',
  standalone: true,
  imports: [CommonModule, RouterModule, FormularioAdultoComponent],
  templateUrl: './lista-adultos.component.html',
  styleUrls: ['./lista-adultos.component.scss']
})
export class ListaAdultosComponent implements OnInit {
  private adultoService = inject(AdultoMayorService);
  toast = signal<string | null>(null);

  adultos = signal<any[]>([]);
  cargando = signal<boolean>(true);
  showModal = signal<boolean>(false);

  ngOnInit(): void {
    this.cargarAdultos();
  }

  private cargarAdultos(): void {
    this.cargando.set(true);
    this.adultoService.getMisPacientes().subscribe({
      next: (data) => {
        const mapeados = data.map(a => ({
          ...a,
          initials: (a.nombre.charAt(0) + a.apellido.charAt(0)).toUpperCase(),
          avatarColor: this.getColorForId(a.idAdulto),
          edad: this.calcularEdad(a.fechaNacimiento),
          // Valores por defecto para HU futuras
          relacion: 'Familiar',
          condicionesArray: a.condicionesMedicas ? a.condicionesMedicas.split(',').map(s => s.trim()) : [],
          cuidador: 'Sin asignar',
          dispositivoOnline: false,
          medsCount: 0,
          cumplimiento: 0,
          cumplimientoColor: '#999'
        }));
        this.adultos.set(mapeados);
        this.cargando.set(false);
      },
      error: (err) => {
        this.showToast('Error al cargar la lista de adultos mayores');
        this.cargando.set(false);
      }
    });
  }

  private calcularEdad(fecha: string): number {
    const birthDate = new Date(fecha);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  private getColorForId(id: number): string {
    const colors = ['#2E86AB', '#52B788', '#E07A5F', '#F4A261', '#8338EC'];
    return colors[id % colors.length];
  }

  private showToast(msg: string): void {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(null), 3500);
  }

  abrirModal(): void {
    this.showModal.set(true);
  }

  cerrarModal(recargar: boolean): void {
    this.showModal.set(false);
    if (recargar) {
      this.showToast('Adulto mayor registrado exitosamente');
      this.cargarAdultos();
    }
  }
}
