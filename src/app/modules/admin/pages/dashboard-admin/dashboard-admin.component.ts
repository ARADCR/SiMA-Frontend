import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface DashboardUser {
  id: number;
  initials: string;
  avatarBg: string;
  name: string;
  email: string;
  role: string;
  roleBg: string;
  roleColor: string;
  lastAccess: string;
}

interface PendingCredential {
  id: number;
  initials: string;
  name: string;
  docType: string;
  date: string;
}

interface UnassignedDevice {
  id: number;
  type: string;
  mac: string;
}

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.scss']
})
export class DashboardAdminComponent {
  readonly todayDate = new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  readonly stats = signal({
    totalUsuarios: 24,
    adultosActivos: 18,
    dispositivosConectados: 31,
    alertasActivas: 3
  });

  readonly usuarios = signal<DashboardUser[]>([
    { id: 1, initials: 'MG', avatarBg: '#2E86AB', name: 'María García',    email: 'maria@sima.mx',   role: 'Familiar',  roleBg: '#EBF5FB', roleColor: '#1E5F7A', lastAccess: 'Hace 2 h' },
    { id: 2, initials: 'CA', avatarBg: '#52B788', name: 'Carlos Andrade',  email: 'carlos@sima.mx',  role: 'Cuidador',  roleBg: '#D8F3DC', roleColor: '#1A7A4A', lastAccess: 'Hace 4 h' },
    { id: 3, initials: 'PL', avatarBg: '#F4A261', name: 'Pedro López',     email: 'pedro@sima.mx',   role: 'Familiar',  roleBg: '#EBF5FB', roleColor: '#1E5F7A', lastAccess: 'Ayer' },
    { id: 4, initials: 'LV', avatarBg: '#6C63FF', name: 'Laura Vega',      email: 'laura@sima.mx',   role: 'Cuidador',  roleBg: '#D8F3DC', roleColor: '#1A7A4A', lastAccess: 'Hace 1 d' },
    { id: 5, initials: 'AT', avatarBg: '#E76F51', name: 'Ana Torres',      email: 'ana@sima.mx',     role: 'Familiar',  roleBg: '#EBF5FB', roleColor: '#1E5F7A', lastAccess: 'Hace 3 d' },
  ]);

  readonly pendingCredentials = signal<PendingCredential[]>([
    { id: 1, initials: 'CA', name: 'Carlos Andrade', docType: 'Certificación técnica', date: '20/06/2026' },
    { id: 2, initials: 'LV', name: 'Laura Vega',     docType: 'Antecedentes no penales', date: '18/06/2026' },
    { id: 3, initials: 'MT', name: 'Marco Torres',   docType: 'Identificación oficial', date: '15/06/2026' },
    { id: 4, initials: 'SR', name: 'Sofía Ramos',    docType: 'Título universitario', date: '10/06/2026' },
  ]);

  readonly unassignedDevices = signal<UnassignedDevice[]>([
    { id: 1, type: 'Pastillero ESP32', mac: 'AA:BB:CC:11:22:33' },
    { id: 2, type: 'Pulsera inteligente', mac: 'DD:EE:FF:44:55:66' },
    { id: 3, type: 'Pastillero ESP32', mac: 'GG:HH:II:77:88:99' },
  ]);
}
