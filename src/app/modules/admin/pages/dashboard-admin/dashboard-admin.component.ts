import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService, DashboardStats, DashboardUser, PendingCredential, UnassignedDevice } from '../../../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.scss']
})
export class DashboardAdminComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  readonly todayDate = new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  readonly stats = signal<DashboardStats>({
    totalUsuarios: 0,
    adultosActivos: 0,
    dispositivosConectados: 0,
    alertasActivas: 0
  });

  readonly usuarios = signal<DashboardUser[]>([]);
  readonly pendingCredentials = signal<PendingCredential[]>([]);
  readonly unassignedDevices = signal<UnassignedDevice[]>([]);
  readonly loading = signal<boolean>(true);

  ngOnInit() {
    this.dashboardService.getAdminDashboard().subscribe({
      next: (data) => {
        this.stats.set(data.stats);
        this.usuarios.set(data.usuarios);
        this.pendingCredentials.set(data.pendingCredentials);
        this.unassignedDevices.set(data.unassignedDevices);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando dashboard', err);
        this.loading.set(false);
      }
    });
  }
}
