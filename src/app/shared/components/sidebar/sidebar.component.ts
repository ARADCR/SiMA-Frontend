import { Component, Input, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

interface NavItem {
  label: string;
  icon?: string;
  route?: string;
  roles?: string[];
  sectionLabel?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() collapsed = false;
  // Mobile drawer state
  isOpen = false;
  isMobile = window.innerWidth <= 768;

  protected auth = inject(AuthService);
  private router = inject(Router);

  private allNavItems: NavItem[] = [
    { sectionLabel: 'General', roles: ['Administrador'], label: '' },
    { label: 'Dashboard',       icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',                                                                   route: '/admin/dashboard',          roles: ['Administrador'] },
    { label: 'Usuarios',        icon: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z', route: '/admin/usuarios',           roles: ['Administrador'] },
    { label: 'Adultos Mayores', icon: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',                                           route: '/admin/adultos',            roles: ['Administrador'] },
    { label: 'Dispositivos',    icon: 'M9.5 14.5L11 13H9V7h6v6h-2.5l1.5 1.5V16h1c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H9C7.9 4 7 4.9 7 6v8c0 1.1.9 2 2 2h1v-1.5zM22 9h-2V7h-2v2h-2v2h2v2h2v-2h2zm-9 4h2v2h-2zM6 9H4V7H2v2H0v2h2v2h2v-2h2z',                    route: '/admin/dispositivos',       roles: ['Administrador'] },
    { sectionLabel: 'Sistema',  roles: ['Administrador'], label: '' },
    { label: 'Credenciales',    icon: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4l6 2.67V11c0 3.89-2.67 7.52-6 8.93-3.33-1.41-6-5.04-6-8.93V7.67L12 5z',                                                                            route: '/admin/credenciales',       roles: ['Administrador'] },
    { label: 'Reportes',        icon: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z',                                                                                       route: '/admin/reportes',           roles: ['Administrador'] },
    { label: 'Configuración',   icon: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l-1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z', route: '/admin/configuracion',    roles: ['Administrador'] },

    { sectionLabel: 'Mi trabajo', roles: ['Cuidador'], label: '' },
    { label: 'Dashboard',         icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',                                                                   route: '/cuidador/dashboard',       roles: ['Cuidador'] },
    { label: 'Registrar Tomas',   icon: 'M6.5 10h-2v5h2v-5zm4 0h-2v5h2v-5zm8.5 7H4v2h15v-2zm-4.5-7h-2v5h2v-5zM11.5 1L2 6v2h19V6l-9.5-5z',                               route: '/cuidador/registrar-tomas', roles: ['Cuidador'] },
    { label: 'Observaciones',     icon: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z', route: '/cuidador/observaciones',  roles: ['Cuidador'] },
    { sectionLabel: 'Consultas',  roles: ['Cuidador'], label: '' },
    { label: 'Historial',         icon: 'M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z', route: '/cuidador/historial', roles: ['Cuidador'] },
    { label: 'Chatbot IA',        icon: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z',                                                             route: '/cuidador/chatbot',         roles: ['Cuidador'] },
    { sectionLabel: 'Mi perfil',  roles: ['Cuidador'], label: '' },
    { label: 'Mi Perfil',         icon: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4l6 2.67V11c0 3.89-2.67 7.52-6 8.93-3.33-1.41-6-5.04-6-8.93V7.67L12 5z', route: '/cuidador/perfil',  roles: ['Cuidador'] },

    { sectionLabel: 'Monitoreo',  roles: ['Familiar'], label: '' },
    { label: 'Dashboard',         icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',                                                                   route: '/familiar/dashboard',       roles: ['Familiar'] },
    { label: 'Medicamentos',      icon: 'M6.5 10h-2v5h2v-5zm4 0h-2v5h2v-5zm8.5 7H4v2h15v-2zm-4.5-7h-2v5h2v-5zM11.5 1L2 6v2h19V6l-9.5-5z',                               route: '/familiar/medicamentos',    roles: ['Familiar'] },
    { label: 'Historial',         icon: 'M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z', route: '/familiar/historial',   roles: ['Familiar'] },
    { label: 'Actividad IoT',     icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z',  route: '/familiar/actividad-iot',  roles: ['Familiar'] },
    { sectionLabel: 'Gestión',    roles: ['Familiar'], label: '' },
    { label: 'Mis Adultos',       icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',               route: '/familiar/adultos',         roles: ['Familiar'] },
    { label: 'Buscar Cuidador',   icon: 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z', route: '/familiar/buscar-cuidador', roles: ['Familiar'] },
    { sectionLabel: 'IA',         roles: ['Familiar'], label: '' },
    { label: 'Chatbot',           icon: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z',                                                             route: '/familiar/chatbot',         roles: ['Familiar'] },
    { label: 'Reportes',          icon: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z', route: '/familiar/reportes',      roles: ['Familiar'] },
  ];

  /**
   * Navigate to a route and, if on mobile, close the sidebar.
   */
  navigate(route: string | undefined): void {
    if (!route) return;
    this.router.navigate([route]);
    // Close mobile drawer after navigation
    if (this.isMobile) {
      this.isOpen = false;
    }
  }

  get navItems(): NavItem[] {
    const rol = this.auth.rolActual;
    if (!rol) return [];
    return this.allNavItems.filter(item => !item.roles || item.roles.includes(rol));
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) {
      this.isOpen = false;
    }
  }

  routeId(route: string | undefined): string {
    return route?.split('/').pop() || '';
  }
}
