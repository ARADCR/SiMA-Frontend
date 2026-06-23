import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatoHora',
  standalone: true
})
export class FormatoHoraPipe implements PipeTransform {
  transform(value: string | Date | null, formato: '12h' | '24h' = '12h'): string {
    if (!value) return '—';

    const fecha = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(fecha.getTime())) return '—';

    if (formato === '24h') {
      const horas   = String(fecha.getHours()).padStart(2, '0');
      const minutos = String(fecha.getMinutes()).padStart(2, '0');
      return `${horas}:${minutos}`;
    }

    return fecha.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
}
