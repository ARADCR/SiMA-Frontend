import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
  imports: [CommonModule, RouterModule],
  templateUrl: './lista-adultos.component.html',
  styleUrls: ['./lista-adultos.component.scss']
})
export class ListaAdultosComponent {
  toast = signal<string | null>(null);

  adultos: AdultoCard[] = [
    {
      id: 1, nombre: 'Elena Rodríguez', initials: 'ER', avatarColor: '#2E86AB',
      edad: 76, relacion: 'Mi madre',
      condiciones: ['Diabetes', 'Hipertensión'],
      cuidador: 'Carlos Mendoza', cuidadorTel: '55-1234-5678',
      dispositivoOnline: true, medsCount: 4,
      cumplimiento: 87, cumplimientoColor: '#52B788'
    },
    {
      id: 2, nombre: 'José Rodríguez', initials: 'JR', avatarColor: '#52B788',
      edad: 81, relacion: 'Mi padre',
      condiciones: ['Colesterol'],
      cuidador: 'Sin asignar', cuidadorTel: '',
      dispositivoOnline: true, medsCount: 3,
      cumplimiento: 92, cumplimientoColor: '#52B788'
    },
  ];

  vincularAdulto(): void {
    this.showToast('Funcionalidad de vinculación próximamente disponible');
  }

  private showToast(msg: string): void {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(null), 3500);
  }
}
