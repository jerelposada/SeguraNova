import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KnowledgeBasesComponent } from '../governance/components/knowledge-bases/knowledge-bases.component';
import { UsuariosRolesComponent } from '../governance/components/usuarios-roles/usuarios-roles.component';

@Component({
  selector: 'app-admin-users-permissions-shell',
  standalone: true,
  imports: [UsuariosRolesComponent, KnowledgeBasesComponent],
  template: `
    <section class="admin-shell" data-testid="users-permissions-shell">
      <header class="admin-shell__header">
        <h2 class="admin-shell__title">Usuarios y permisos</h2>
        <p class="admin-shell__subtitle">Gobierno visual de accesos y cobertura de conocimiento.</p>
      </header>

      <div class="admin-shell__grid">
        <app-usuarios-roles />
        <app-knowledge-bases />
      </div>
    </section>
  `,
  styles: [
    `
      .admin-shell {
        display: grid;
        gap: var(--sp-2);
      }

      .admin-shell__title {
        color: var(--clr-heading);
        font-size: var(--fs-xl);
      }

      .admin-shell__subtitle {
        color: var(--clr-muted);
        font-size: var(--fs-sm);
      }

      .admin-shell__grid {
        display: grid;
        gap: var(--sp-2);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUsersPermissionsShellComponent {}
