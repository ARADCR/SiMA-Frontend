import { Routes } from '@angular/router';

export const ADULTO_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard-adulto/dashboard-adulto.component').then(m => m.DashboardAdultoComponent),
    title: 'Mi Inicio — SiMA'
  },
  {
    path: 'recordatorios',
    loadComponent: () => import('./pages/recordatorios/recordatorios.component').then(m => m.RecordatoriosComponent),
    title: 'Mis Recordatorios — SiMA'
  },
  {
    path: 'chatbot',
    loadComponent: () => import('./pages/chatbot/chatbot.component').then(m => m.ChatbotComponent),
    title: 'Chat de ayuda — SiMA'
  },
  {
    path: 'boton-emergencia',
    loadComponent: () => import('./pages/boton-emergencia/boton-emergencia.component').then(m => m.BotonEmergenciaComponent),
    title: 'Emergencia — SiMA'
  }
];
