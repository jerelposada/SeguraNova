import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

type UsuarioAdminVM = {
  id: string;
  nombre: string;
  correo: string;
  rol: 'admin_ti' | 'analista' | 'supervisor';
  estado: 'activo' | 'suspendido';
};

@Component({
  selector: 'app-usuarios-roles',
  standalone: true,
  templateUrl: './usuarios-roles.component.html',
  styleUrl: './usuarios-roles.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuariosRolesComponent {
  readonly usuarios = signal<ReadonlyArray<UsuarioAdminVM>>([
    {
      id: 'usr-001',
      nombre: 'Elena Paredes',
      correo: 'elena.paredes@seguranova.local',
      rol: 'admin_ti',
      estado: 'activo',
    },
    {
      id: 'usr-002',
      nombre: 'Luis Mendoza',
      correo: 'luis.mendoza@seguranova.local',
      rol: 'analista',
      estado: 'activo',
    },
    {
      id: 'usr-003',
      nombre: 'Paola Rivas',
      correo: 'paola.rivas@seguranova.local',
      rol: 'supervisor',
      estado: 'suspendido',
    },
  ]);
  readonly roles = signal<ReadonlyArray<'todos' | UsuarioAdminVM['rol']>>([
    'todos',
    'admin_ti',
    'analista',
    'supervisor',
  ]);
  readonly rolFiltro = signal<'todos' | UsuarioAdminVM['rol']>('todos');
  readonly modalUsuarioId = signal<string | null>(null);
  readonly filteredUsuarios = computed(() => {
    const activeRole = this.rolFiltro();
    if (activeRole === 'todos') {
      return this.usuarios();
    }

    return this.usuarios().filter((usuario) => usuario.rol === activeRole);
  });
  readonly modalUsuario = computed(() => {
    const currentUserId = this.modalUsuarioId();
    if (!currentUserId) {
      return null;
    }

    return this.usuarios().find((usuario) => usuario.id === currentUserId) ?? null;
  });

  selectRol(rol: 'todos' | UsuarioAdminVM['rol']): void {
    this.rolFiltro.set(rol);
  }

  openUsuarioModal(userId: string): void {
    this.modalUsuarioId.set(userId);
  }

  closeUsuarioModal(): void {
    this.modalUsuarioId.set(null);
  }
}