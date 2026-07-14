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
  },
  {
    path: 'historial',
    loadComponent: () => import('./pages/historial-cuidador/historial-cuidador.component').then(m => m.HistorialCuidadorComponent),
    title: 'Historial — SiMA'
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil-cuidador/perfil-cuidador.component').then(m => m.PerfilCuidadorComponent),
    title: 'Mi Perfil — SiMA'
  },
  {
    path: 'reportes',
    loadComponent: () => import('./pages/reportes-medicacion/reportes-medicacion.component').then(m => m.ReportesMedicacionComponent),
    title: 'Reportes de Medicación — SiMA'
  },
  {
    path: 'chatbot',
    loadComponent: () => import('./pages/chatbot/chatbot-cuidador.component').then(m => m.ChatbotCuidadorComponent),
    title: 'Chatbot IA — SiMA'
  },
  {
    path: 'notificaciones',
    loadComponent: () => import('./pages/notificaciones/notificaciones.component').then(m => m.NotificacionesComponent),
    title: 'Notificaciones — SiMA'
  }
];
