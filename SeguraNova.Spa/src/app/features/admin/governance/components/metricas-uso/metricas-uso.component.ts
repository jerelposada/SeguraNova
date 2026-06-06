import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

type KpiVM = {
  label: string;
  value: string;
};

@Component({
  selector: 'app-metricas-uso',
  standalone: true,
  templateUrl: './metricas-uso.component.html',
  styleUrl: './metricas-uso.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricasUsoComponent {
  readonly kpis = signal<ReadonlyArray<KpiVM>>([
    { label: 'Latencia promedio', value: '420ms' },
    { label: 'Tasa de exito', value: '93%' },
    { label: 'Usuarios concurrentes', value: '37' },
  ]);
  readonly seriesByPeriod = signal<Record<'7d' | '30d', ReadonlyArray<number>>>({
    '7d': [35, 44, 52, 49, 61, 58, 66],
    '30d': [20, 34, 28, 40, 31, 45, 39, 51, 46, 58, 52, 60, 55, 62, 58, 64, 60, 67, 63, 70, 65, 72, 68, 74, 69, 73, 71, 70, 72, 74],
  });
  readonly periodoActivo = signal<'7d' | '30d'>('7d');
  readonly serieConsultas = computed(() => this.seriesByPeriod()[this.periodoActivo()]);

  changePeriodo(periodo: '7d' | '30d'): void {
    this.periodoActivo.set(periodo);
  }
}