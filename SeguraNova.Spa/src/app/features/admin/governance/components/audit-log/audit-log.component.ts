import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

type AuditEventVM = {
  id: string;
  fecha: string;
  actor: string;
  accion: string;
  severidad: 'info' | 'warning' | 'critical';
};

@Component({
  selector: 'app-audit-log',
  standalone: true,
  templateUrl: './audit-log.component.html',
  styleUrl: './audit-log.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditLogComponent {
  readonly eventos = signal<ReadonlyArray<AuditEventVM>>([
    {
      id: 'evt-004',
      fecha: '2026-06-05 09:44',
      actor: 'admin_ti',
      accion: 'Cambio de rol en usuario usr-021',
      severidad: 'info',
    },
    {
      id: 'evt-003',
      fecha: '2026-06-05 08:52',
      actor: 'scheduler',
      accion: 'Retraso de indexacion en KB siniestros',
      severidad: 'warning',
    },
    {
      id: 'evt-002',
      fecha: '2026-06-05 08:16',
      actor: 'admin_ti',
      accion: 'Intento fallido de elevacion de permisos',
      severidad: 'critical',
    },
  ]);
  readonly severidades = signal<ReadonlyArray<'todas' | 'info' | 'warning' | 'critical'>>([
    'todas',
    'info',
    'warning',
    'critical',
  ]);
  readonly severidadFiltro = signal<'todas' | 'info' | 'warning' | 'critical'>('todas');
  readonly filteredEventos = computed(() => {
    const activeSeverity = this.severidadFiltro();
    if (activeSeverity === 'todas') {
      return this.eventos();
    }

    return this.eventos().filter((evento) => evento.severidad === activeSeverity);
  });

  selectSeveridad(severidad: 'todas' | 'info' | 'warning' | 'critical'): void {
    this.severidadFiltro.set(severidad);
  }
}