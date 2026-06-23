import { Routes } from '@angular/router';

export const FAMILIAR_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard-familiar/dashboard-familiar.component').then(m => m.DashboardFamiliarComponent),
    title: 'Mi Dashboard — SiMA'
  },
  {
    path: 'adultos',
    loadComponent: () => import('./pages/lista-adultos/lista-adultos.component').then(m => m.ListaAdultosComponent),
    title: 'Mis Adultos Mayores — SiMA'
  },
  {
    path: 'adultos/:id',
    loadComponent: () => import('./pages/detalle-adulto/detalle-adulto.component').then(m => m.DetalleAdultoComponent),
    title: 'Detalle — SiMA'
  },
  {
    path: 'medicamentos',
    loadComponent: () => import('./pages/medicamentos/medicamentos.component').then(m => m.MedicamentosComponent),
    title: 'Medicamentos — SiMA'
  },
  {
    path: 'historial',
    loadComponent: () => import('./pages/historial/historial.component').then(m => m.HistorialComponent),
    title: 'Historial — SiMA'
  },
  {
    path: 'alertas',
    loadComponent: () => import('./pages/alertas/alertas.component').then(m => m.AlertasComponent),
    title: 'Alertas — SiMA'
  }
];
