import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

type AdminNavItem = {
  label: string;
  route: string;
  icon: string;
};

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css',
})
export class AdminLayoutComponent {
  readonly navItems = signal<ReadonlyArray<AdminNavItem>>([
    { label: 'Principal', route: '/admin/principal', icon: 'home' },
    { label: 'Documentos', route: '/admin/documentos', icon: 'description' },
    { label: 'Agente', route: '/admin/agente', icon: 'smart_toy' },
    { label: 'Usuarios y Permisos', route: '/admin/usuarios-permisos', icon: 'group' },
    { label: 'Monitoreo', route: '/admin/monitoreo', icon: 'monitoring' },
  ]);
}
