import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatoFecha',
  standalone: true
})
export class FormatoFechaPipe implements PipeTransform {
  transform(value: string | Date | null, formato: string = 'corto'): string {
    if (!value) return '—';

    const fecha = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(fecha.getTime())) return '—';

    const opciones: Record<string, Intl.DateTimeFormatOptions> = {
      corto:    { day: '2-digit', month: '2-digit', year: 'numeric' },
      largo:    { day: 'numeric', month: 'long', year: 'numeric' },
      relativo: {},
      iso:      {}
    };

    if (formato === 'relativo') {
      return this.formatoRelativo(fecha);
    }

    if (formato === 'iso') {
      return fecha.toISOString().split('T')[0];
    }

    return fecha.toLocaleDateString('es-PE', opciones[formato] || opciones['corto']);
  }

  private formatoRelativo(fecha: Date): string {
    const ahora = new Date();
    const diff  = ahora.getTime() - fecha.getTime();
    const mins  = Math.floor(diff / 60000);
    const horas = Math.floor(mins / 60);
    const dias  = Math.floor(horas / 24);

    if (mins  < 1)   return 'ahora mismo';
    if (mins  < 60)  return `hace ${mins} min`;
    if (horas < 24)  return `hace ${horas} h`;
    if (dias  < 7)   return `hace ${dias} día${dias > 1 ? 's' : ''}`;
    if (dias  < 30)  return `hace ${Math.floor(dias / 7)} semana${Math.floor(dias / 7) > 1 ? 's' : ''}`;
    if (dias  < 365) return `hace ${Math.floor(dias / 30)} mes${Math.floor(dias / 30) > 1 ? 'es' : ''}`;
    return `hace ${Math.floor(dias / 365)} año${Math.floor(dias / 365) > 1 ? 's' : ''}`;
  }
}
