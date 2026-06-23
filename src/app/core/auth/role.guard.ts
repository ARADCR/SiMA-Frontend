import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { RolUsuario } from '../models/usuario.model';

export const roleGuard: CanActivateFn = (route, state) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.estaAutenticado) {
    router.navigate(['/auth/login']);
    return false;
  }

  const rolRequerido = route.data?.['role'] as RolUsuario | RolUsuario[] | undefined;

  if (!rolRequerido) return true; // sin restricción de rol

  const tieneAcceso = auth.tieneRol(rolRequerido);

  if (!tieneAcceso) {
    // Redirigir al dashboard del rol actual
    auth.redirigirPorRol();
    return false;
  }

  return true;
};
