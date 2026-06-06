import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuditLogComponent } from '../governance/components/audit-log/audit-log.component';
import { MetricasUsoComponent } from '../governance/components/metricas-uso/metricas-uso.component';

@Component({
  selector: 'app-admin-monitoring-shell',
  standalone: true,
  imports: [MetricasUsoComponent, AuditLogComponent],
  template: `
    <section class="admin-shell" data-testid="monitoring-shell">
      <header class="admin-shell__header">
        <h2 class="admin-shell__title">Monitoreo operativo</h2>
        <p class="admin-shell__subtitle">Seguimiento visual de uso y auditoria.</p>
      </header>

      <div class="admin-shell__grid">
        <app-metricas-uso />
        <app-audit-log />
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
export class AdminMonitoringShellComponent {}
