import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard-admin/dashboard-admin.component').then(m => m.DashboardAdminComponent),
    title: 'Dashboard Admin — SiMA'
  },
  {
    path: 'usuarios',
    loadComponent: () => import('./pages/gestion-usuarios/gestion-usuarios.component').then(m => m.GestionUsuariosComponent),
    title: 'Gestión de Usuarios — SiMA'
  },
  {
    path: 'dispositivos',
    loadComponent: () => import('./pages/gestion-dispositivos/gestion-dispositivos.component').then(m => m.GestionDispositivosComponent),
    title: 'Gestión de Dispositivos — SiMA'
  },
  {
    path: 'configuracion',
    loadComponent: () => import('./pages/configuracion-sistema/configuracion-sistema.component').then(m => m.ConfiguracionSistemaComponent),
    title: 'Configuración — SiMA'
  }
];
