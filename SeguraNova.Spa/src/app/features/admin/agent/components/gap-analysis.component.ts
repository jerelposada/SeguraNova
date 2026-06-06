import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { AGENT_GAPS } from '../agent.fixtures';
import { GapPriority } from '../agent.models';

type MetricItem = { label: string; value: string };

@Component({
  selector: 'app-gap-analysis',
  standalone: true,
  templateUrl: './gap-analysis.component.html',
  styleUrl: './gap-analysis.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GapAnalysisComponent {
  readonly metrics: MetricItem[] = [
    { label: 'Gaps detectados', value: '52' },
    { label: 'Cobertura media', value: '61%' },
    { label: 'Temas criticos', value: '4' },
  ];
  readonly gaps = AGENT_GAPS;
  readonly priorityCards = [
    { priority: 'alta' as GapPriority, count: 2 },
    { priority: 'media' as GapPriority, count: 3 },
    { priority: 'baja' as GapPriority, count: 6 },
  ];
  readonly prioritizedGaps = computed(() =>
    [...this.gaps].sort((left, right) => this.priorityWeight(left.prioridad) - this.priorityWeight(right.prioridad)),
  );

  private priorityWeight(priority: GapPriority): number {
    if (priority === 'alta') {
      return 1;
    }

    return priority === 'media' ? 2 : 3;
  }
}
