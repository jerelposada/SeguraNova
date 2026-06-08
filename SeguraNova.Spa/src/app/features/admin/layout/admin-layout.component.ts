import { ChangeDetectionStrategy, Component, signal, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

type AdminNavItem = {
  label: string;
  route: string;
  icon: string;
};

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayoutComponent implements OnDestroy {
  readonly navItems = signal<ReadonlyArray<AdminNavItem>>([
    { label: 'Principal', route: '/admin/principal', icon: 'home' },
    { label: 'Documentos', route: '/admin/documentos', icon: 'description' },
    { label: 'Agente', route: '/admin/agente', icon: 'smart_toy' },
    { label: 'Usuarios y Permisos', route: '/admin/usuarios-permisos', icon: 'group' },
    { label: 'Monitoreo', route: '/admin/monitoreo', icon: 'monitoring' },
  ] as ReadonlyArray<AdminNavItem>);

  readonly isMobile = signal<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  private _onResize = () => this.isMobile.set(window.innerWidth < 768);

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this._onResize);
    }
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this._onResize);
    }
  }
}
