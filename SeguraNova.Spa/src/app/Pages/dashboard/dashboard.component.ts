import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AuditLogComponent } from '../../features/admin/governance/components/audit-log/audit-log.component';
import { KnowledgeBasesComponent } from '../../features/admin/governance/components/knowledge-bases/knowledge-bases.component';
import { MetricasUsoComponent } from '../../features/admin/governance/components/metricas-uso/metricas-uso.component';
import { UsuariosRolesComponent } from '../../features/admin/governance/components/usuarios-roles/usuarios-roles.component';

type DashboardKpi = {
  label: string;
  value: string;
  trend: string;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [UsuariosRolesComponent, KnowledgeBasesComponent, MetricasUsoComponent, AuditLogComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  readonly kpis = signal<ReadonlyArray<DashboardKpi>>([
    { label: 'Usuarios activos', value: '124', trend: '+12%' },
    { label: 'Knowledge Bases sanas', value: '7/9', trend: '+1' },
    { label: 'Consultas hoy', value: '2.409', trend: '+8%' },
    { label: 'Eventos criticos', value: '3', trend: '-2' },
  ]);

  readonly operationalStatus = signal('Operativo con alertas menores en monitoreo.');
}
