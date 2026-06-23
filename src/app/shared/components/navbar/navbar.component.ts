import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { AlertaService } from '../../../core/services/alerta.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  @Input() sidebarCollapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  protected auth     = inject(AuthService);
  private alertasSvc = inject(AlertaService);
  private router     = inject(Router);

  alertasActivas = 0;
  menuUsuarioAbierto = false;

  get nombreUsuario(): string {
    const u = this.auth.usuarioActual;
    if (!u) return '';
    return u.nombre || (u.sub ? u.sub.split('@')[0] : '');
  }

  get inicialUsuario(): string {
    return (this.auth.usuarioActual?.nombre || 'U').charAt(0).toUpperCase();
  }

  ngOnInit(): void {
    if (this.auth.tieneRol(['Administrador', 'Familiar', 'Cuidador'])) {
      this.cargarAlertas();
    }
  }

  private cargarAlertas(): void {
    this.alertasSvc.getContadorActivas().subscribe({
      next: total => this.alertasActivas = total,
      error: () => {}
    });
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  toggleMenuUsuario(): void {
    this.menuUsuarioAbierto = !this.menuUsuarioAbierto;
  }

  cerrarSesion(): void {
    this.auth.logout();
  }
}
