import { Routes } from '@angular/router';

export const CUIDADOR_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard-cuidador/dashboard-cuidador.component').then(m => m.DashboardCuidadorComponent),
    title: 'Dashboard Cuidador — SiMA'
  },
  {
    path: 'registrar-tomas',
    loadComponent: () => import('./pages/registrar-tomas/registrar-tomas.component').then(m => m.RegistrarTomasComponent),
    title: 'Registrar Tomas — SiMA'
  },
  {
    path: 'observaciones',
    loadComponent: () => import('./pages/observaciones/observaciones.component').then(m => m.ObservacionesComponent),
    title: 'Observaciones — SiMA'
  },
  {
    path: 'cumplimiento',
    loadComponent: () => import('./pages/cumplimiento/cumplimiento.component').then(m => m.CumplimientoComponent),
    title: 'Cumplimiento — SiMA'
  }
];
