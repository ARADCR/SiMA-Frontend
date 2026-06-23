import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardEstadisticaComponent } from '../../../../shared/components/card-estadistica/card-estadistica.component';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard-familiar',
  standalone: true,
  imports: [CommonModule, RouterModule, CardEstadisticaComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Bienvenido, {{ auth.usuarioActual?.nombre }} 👋</h1>
        <p>Aquí tienes el resumen de tus adultos mayores a cargo</p>
      </div>
      <div class="stats-grid">
        <app-card-estadistica label="Adultos a cargo" valor="3" variant="primary"
          iconPath="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        <app-card-estadistica label="Tomas pendientes hoy" valor="5" variant="warning"
          iconPath="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
        <app-card-estadistica label="Alertas activas" valor="1" variant="danger"
          iconPath="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
        <app-card-estadistica label="Medicamentos activos" valor="8" variant="success"
          iconPath="M6.5 10h-2v5h2v-5zm4 0h-2v5h2v-5zm8.5 7H4v2h15v-2zm-4.5-7h-2v5h2v-5zM11.5 1L2 6v2h19V6l-9.5-5z"/>
      </div>
      <div class="quick-nav">
        <a routerLink="/familiar/adultos" class="nav-card" id="familiar-quick-adultos">
          <h3>Ver mis adultos</h3>
          <p>Lista y detalles de los adultos mayores</p>
        </a>
        <a routerLink="/familiar/medicamentos" class="nav-card" id="familiar-quick-medicamentos">
          <h3>Medicamentos</h3>
          <p>Gestiona medicamentos y horarios</p>
        </a>
        <a routerLink="/familiar/alertas" class="nav-card warn" id="familiar-quick-alertas">
          <h3>Alertas</h3>
          <p>Revisa las alertas pendientes</p>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 2rem; max-width: 1400px; margin: 0 auto; }
    .page-header { margin-bottom: 2rem; }
    .page-header h1 { font-size: 1.875rem; font-weight: 800; color: #f1f5f9; margin-bottom: 0.5rem; }
    .page-header p { color: #94a3b8; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .quick-nav { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; }
    .nav-card { background: #1e293b; border: 1px solid #475569; border-radius: 0.75rem; padding: 1.5rem; transition: all 0.25s; display: block; }
    .nav-card:hover { border-color: #4f46e5; transform: translateY(-2px); }
    .nav-card.warn:hover { border-color: #ef4444; }
    .nav-card h3 { color: #f1f5f9; font-size: 1.125rem; font-weight: 700; margin-bottom: 0.5rem; }
    .nav-card p { color: #94a3b8; font-size: 0.875rem; }
  `]
})
export class DashboardFamiliarComponent {
  protected auth = inject(AuthService);
}
