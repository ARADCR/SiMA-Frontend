import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';

export const routes: Routes = [
  // Ruta raíz → redirige a login
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },

  // Módulo de autenticación (público)
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  // Módulo Administrador
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { role: 'Administrador' },
    loadChildren: () => import('./modules/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },

  // Módulo Familiar
  {
    path: 'familiar',
    canActivate: [authGuard, roleGuard],
    data: { role: 'Familiar' },
    loadChildren: () => import('./modules/familiar/familiar.routes').then(m => m.FAMILIAR_ROUTES)
  },

  // Módulo Cuidador
  {
    path: 'cuidador',
    canActivate: [authGuard, roleGuard],
    data: { role: 'Cuidador' },
    loadChildren: () => import('./modules/cuidador/cuidador.routes').then(m => m.CUIDADOR_ROUTES)
  },

  // Módulo Adulto Mayor
  {
    path: 'adulto',
    canActivate: [authGuard, roleGuard],
    data: { role: 'Adulto Mayor' },
    loadChildren: () => import('./modules/adulto-mayor/adulto.routes').then(m => m.ADULTO_ROUTES)
  },

  // Wildcard → login
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];
