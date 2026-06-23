import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardEstadisticaComponent } from '../../../../shared/components/card-estadistica/card-estadistica.component';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, CardEstadisticaComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Panel de Administración</h1>
        <p>Resumen general del sistema SiMA</p>
      </div>

      <div class="stats-grid">
        <app-card-estadistica
          label="Usuarios Activos"
          valor="24"
          variant="primary"
          tendencia="up"
          tendenciaValor="+3 este mes"
          iconPath="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
        <app-card-estadistica
          label="Adultos Mayores"
          valor="18"
          variant="success"
          iconPath="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        <app-card-estadistica
          label="Dispositivos IoT"
          valor="42"
          variant="info"
          tendencia="up"
          tendenciaValor="+5 dispositivos"
          iconPath="M17 1H7c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 18H7V5h10v14zm-5-4c.83 0 1.5-.67 1.5-1.5S12.83 12 12 12s-1.5.67-1.5 1.5S11.17 15 12 15z"/>
        <app-card-estadistica
          label="Alertas Activas"
          valor="3"
          variant="danger"
          tendencia="down"
          tendenciaValor="-2 vs ayer"
          iconPath="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
      </div>

      <div class="section-grid">
        <div class="sima-card">
          <h3>Acciones rápidas</h3>
          <div class="quick-actions">
            <a routerLink="/admin/usuarios" class="quick-action" id="admin-quick-usuarios">
              <span>Gestionar Usuarios</span>
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
            </a>
            <a routerLink="/admin/dispositivos" class="quick-action" id="admin-quick-dispositivos">
              <span>Gestionar Dispositivos</span>
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
            </a>
            <a routerLink="/admin/configuracion" class="quick-action" id="admin-quick-config">
              <span>Configuración del sistema</span>
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
            </a>
          </div>
        </div>

        <div class="sima-card">
          <h3>Estado del sistema</h3>
          <div class="status-list">
            <div class="status-item"><span class="dot success"></span><span>API Backend</span><span class="badge badge-success">Online</span></div>
            <div class="status-item"><span class="dot success"></span><span>Base de datos</span><span class="badge badge-success">Online</span></div>
            <div class="status-item"><span class="dot warning"></span><span>WebSockets</span><span class="badge badge-warning">Degradado</span></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 2rem; max-width: 1400px; margin: 0 auto; }
    .page-header { margin-bottom: 2rem; }
    .page-header h1 { font-size: 1.875rem; font-weight: 800; color: #f1f5f9; margin-bottom: 0.5rem; }
    .page-header p { color: #94a3b8; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .section-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    @media (max-width: 768px) { .section-grid { grid-template-columns: 1fr; } }
    .sima-card { background: #1e293b; border: 1px solid #475569; border-radius: 0.75rem; padding: 1.5rem; }
    .sima-card h3 { font-size: 1rem; font-weight: 700; color: #f1f5f9; margin-bottom: 1rem; }
    .quick-actions { display: flex; flex-direction: column; gap: 0.5rem; }
    .quick-action { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; border-radius: 0.5rem; background: #334155; color: #94a3b8; font-size: 0.875rem; transition: all 0.15s; }
    .quick-action:hover { background: #475569; color: #f1f5f9; }
    .status-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .status-item { display: flex; align-items: center; gap: 0.75rem; font-size: 0.875rem; color: #94a3b8; }
    .status-item span:nth-child(2) { flex: 1; color: #f1f5f9; }
    .dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .dot.success { background: #10b981; }
    .dot.warning { background: #f59e0b; }
    .dot.danger  { background: #ef4444; }
    .badge { padding: 2px 8px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
    .badge-success { background: rgba(16,185,129,0.15); color: #10b981; }
    .badge-warning { background: rgba(245,158,11,0.15); color: #f59e0b; }
  `]
})
export class DashboardAdminComponent {}
