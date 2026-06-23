import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter, startWith } from 'rxjs/operators';

import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { AuthService } from './core/auth/auth.service';
import { NotificationService, RecordatorioMedicamento } from './core/services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  private auth   = inject(AuthService);
  private notification = inject(NotificationService);

  sidebarCollapsed = signal(false);
  showLayout       = signal(false);

  ngOnInit(): void {
    // startWith(null) garantiza que evaluemos la URL al primer tick,
    // capturando el refresh en la ruta actual sin esperar NavigationEnd
    this.router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
        startWith(null)          // dispara inmediatamente con valor null
      )
      .subscribe(() => {
        // urlAfterRedirects en NavigationEnd, o snapshot actual del router
        const url = this.router.url || '/';
        this.actualizarLayout(url);
      });

    this.notification.recordatorios$.subscribe((recordatorio: RecordatorioMedicamento) => {
      this.mostrarNotificacion(recordatorio);
    });
  }

  private actualizarLayout(url: string): void {
    const esRutaPublica = url.startsWith('/auth') || url === '/';
    const autenticado   = this.auth.estaAutenticado;
    const mostrarNav    = !esRutaPublica && autenticado;

    this.showLayout.set(mostrarNav);

    if (mostrarNav && this.auth.tieneRol('Adulto Mayor')) {
      this.notification.conectar();
    } else {
      this.notification.desconectar();
    }
  }

  private mostrarNotificacion(recordatorio: RecordatorioMedicamento): void {
    // Mostrar alerta en el navegador (podría reemplazarse con un modal o toast)
    const mensaje = `¡Recordatorio! Es hora de tomar: ${recordatorio.nombre} (${recordatorio.dosis})`;
    alert(mensaje);

    // Activar síntesis de voz
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(mensaje);
      utterance.lang = 'es-ES';
      window.speechSynthesis.speak(utterance);
    }
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }
}
