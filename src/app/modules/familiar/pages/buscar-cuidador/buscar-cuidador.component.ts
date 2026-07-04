import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Cuidador {
  id: number; nombre: string; initials: string; especialidad: string; experiencia: string;
  calificacion: number; resenas: number; precio: string; disponible: boolean;
  tags: string[]; descripcion: string;
}

@Component({
  selector: 'app-buscar-cuidador',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './buscar-cuidador.component.html',
  styleUrls: ['./buscar-cuidador.component.scss']
})
export class BuscarCuidadorComponent {
  busquedaIA = '';
  iaMensaje  = signal<string | null>(null);
  filtroEsp  = signal<string[]>([]);
  filtroDisp = '';
  filtroCalif = '0';
  ordenar    = 'cal';

  especialidades = ['Adultos mayores', 'Diabetes', 'Fisioterapia', 'Alzheimer/demencia', 'Rehabilitación', 'Enfermería'];

  cuidadores: Cuidador[] = [
    {
      id: 1, nombre: 'María García López', initials: 'MG', especialidad: 'Cuidado de adultos mayores · Diabetes',
      experiencia: '8 años de experiencia', calificacion: 4.9, resenas: 47, precio: '$120',
      disponible: true, tags: ['Diabetes', 'Alzheimer', 'Fisioterapia'],
      descripcion: 'Enfermera titulada con amplia experiencia en el cuidado de adultos mayores con enfermedades crónicas. Certificada en primeros auxilios y manejo de emergencias.',
    },
    {
      id: 2, nombre: 'Roberto Sánchez', initials: 'RS', especialidad: 'Fisioterapia · Rehabilitación',
      experiencia: '5 años de experiencia', calificacion: 4.7, resenas: 31, precio: '$100',
      disponible: true, tags: ['Fisioterapia', 'Movilidad', 'Rehabilitación'],
      descripcion: 'Fisioterapeuta especializado en movilidad y rehabilitación post-quirúrgica. Trabaja con un enfoque integral centrado en el paciente.',
    },
    {
      id: 3, nombre: 'Ana Martínez Cruz', initials: 'AM', especialidad: 'Enfermería geriátrica',
      experiencia: '12 años de experiencia', calificacion: 5.0, resenas: 83, precio: '$145',
      disponible: false, tags: ['Enfermería', 'Adultos mayores', 'Medicamentos'],
      descripcion: 'Gerontóloga con más de una década cuidando adultos mayores. Especialista en administración de medicamentos y detección temprana de complicaciones.',
    },
    {
      id: 4, nombre: 'Carlos Jiménez', initials: 'CJ', especialidad: 'Alzheimer · Demencias',
      experiencia: '6 años de experiencia', calificacion: 4.5, resenas: 22, precio: '$110',
      disponible: true, tags: ['Alzheimer', 'Demencia', 'Estimulación cognitiva'],
      descripcion: 'Psicólogo con especialización en deterioro cognitivo. Aplica técnicas de estimulación cognitiva y reminiscencia para mejorar la calidad de vida.',
    },
  ];

  cuidadoresFiltrados = computed(() => {
    let res = [...this.cuidadores];
    if (this.filtroEsp().length > 0) {
      res = res.filter(c => this.filtroEsp().some(e =>
        c.tags.some(t => t.toLowerCase().includes(e.toLowerCase())) ||
        c.especialidad.toLowerCase().includes(e.toLowerCase())
      ));
    }
    if (this.filtroDisp === 'disponible') res = res.filter(c => c.disponible);
    const min = parseFloat(this.filtroCalif);
    if (min > 0) res = res.filter(c => c.calificacion >= min);
    if (this.ordenar === 'cal') res.sort((a, b) => b.calificacion - a.calificacion);
    else if (this.ordenar === 'precio') res.sort((a, b) => parseInt(a.precio.replace(/\D/g, '')) - parseInt(b.precio.replace(/\D/g, '')));
    else if (this.ordenar === 'exp') res.sort((a, b) => parseInt(b.experiencia) - parseInt(a.experiencia));
    return res;
  });

  starsArr(cal: number): boolean[] {
    return [1, 2, 3, 4, 5].map(i => i <= Math.round(cal));
  }

  toggleEsp(e: string): void {
    this.filtroEsp.update(list => list.includes(e) ? list.filter(x => x !== e) : [...list, e]);
  }

  buscarIA(): void {
    const q = this.busquedaIA.trim();
    if (!q) return;
    this.iaMensaje.set(`Basado en tu búsqueda "${q}", te recomiendo cuidadores con experiencia en las áreas mencionadas. He filtrado los resultados para mostrar primero los más relevantes y con mayor calificación. Considera contactar a María García López o Ana Martínez Cruz, quienes tienen especialidades que se ajustan a tu necesidad.`);
  }

  resetFiltros(): void {
    this.filtroEsp.set([]);
    this.filtroDisp = '';
    this.filtroCalif = '0';
    this.iaMensaje.set(null);
    this.busquedaIA = '';
  }
}
