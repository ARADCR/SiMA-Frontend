import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, provideRouter } from '@angular/router';

import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('authGuard', () => {
  let authMock: { estaAutenticado: boolean };
  let router: Router;

  const route = {} as ActivatedRouteSnapshot;
  const state = { url: '/familiar/dashboard' } as RouterStateSnapshot;

  beforeEach(() => {
    authMock = { estaAutenticado: false };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authMock },
      ],
    });

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
  });

  it('redirige al inicio de sesión cuando no hay sesión activa', () => {
    const resultado = TestBed.runInInjectionContext(() => authGuard(route, state));

    expect(resultado).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login'], {
      queryParams: { returnUrl: '/familiar/dashboard' },
    });
  });

  it('permite el acceso cuando hay sesión activa', () => {
    authMock.estaAutenticado = true;

    const resultado = TestBed.runInInjectionContext(() => authGuard(route, state));

    expect(resultado).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
