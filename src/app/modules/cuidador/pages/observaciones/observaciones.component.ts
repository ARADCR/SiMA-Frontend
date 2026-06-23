import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-observaciones',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Observaciones</h1>
        <p>Registra observaciones clínicas del paciente</p>
      </div>
      <div class="sima-card">
        <p style="color:#94a3b8; text-align:center; padding:2rem;">
          Modulo en construcción — Próximamente disponible
        </p>
      </div>
    </div>
  `,
  styles: [`.page-container { padding: 2rem; max-width: 1400px; margin: 0 auto; }
    .page-header { margin-bottom: 2rem; }
    .page-header h1 { font-size: 1.875rem; font-weight: 800; color: #f1f5f9; margin-bottom: 0.5rem; }
    .page-header p { color: #94a3b8; }
    .sima-card { background: #1e293b; border: 1px solid #475569; border-radius: 0.75rem; padding: 1.5rem; }`]
})
export class ObservacionesComponent {}
