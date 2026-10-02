import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { EMPTY } from 'rxjs';

import { AppComponent } from './app.component';
import { AuthService } from './core/auth/auth.service';
import { NotificationService } from './core/services/notification.service';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let authMock: { estaAutenticado: boolean };
  let notificationMock: { recordatorios$: typeof EMPTY; desconectar: jasmine.Spy };

  beforeEach(async () => {
    // Servicios simulados: la prueba no hace peticiones ni abre conexiones reales.
    authMock = { estaAutenticado: false };
    notificationMock = {
      recordatorios$: EMPTY,
      desconectar: jasmine.createSpy('desconectar'),
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authMock },
        { provide: NotificationService, useValue: notificationMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('oculta el layout autenticado cuando no hay sesión', () => {
    fixture.detectChanges();
    expect(component.showLayout()).toBeFalse();
  });

  it('muestra el layout autenticado en una ruta protegida con sesión activa', () => {
    fixture.detectChanges();
    authMock.estaAutenticado = true;
    (component as any).actualizarLayout('/familiar/dashboard');
    expect(component.showLayout()).toBeTrue();
  });

  it('oculta el layout en rutas públicas aunque haya sesión', () => {
    fixture.detectChanges();
    authMock.estaAutenticado = true;
    (component as any).actualizarLayout('/auth/login');
    expect(component.showLayout()).toBeFalse();
  });

  it('alterna el estado del menú lateral', () => {
    expect(component.sidebarCollapsed()).toBeFalse();
    component.toggleSidebar();
    expect(component.sidebarCollapsed()).toBeTrue();
    component.toggleSidebar();
    expect(component.sidebarCollapsed()).toBeFalse();
  });
});
