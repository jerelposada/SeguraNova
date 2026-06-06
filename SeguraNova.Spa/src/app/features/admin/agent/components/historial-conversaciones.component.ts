import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { AGENT_CONVERSATIONS } from '../agent.fixtures';
import { ConversationStatus } from '../agent.models';

type ConversationGroup = 'hoy' | 'semana';

@Component({
  selector: 'app-historial-conversaciones',
  standalone: true,
  templateUrl: './historial-conversaciones.component.html',
  styleUrl: './historial-conversaciones.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistorialConversacionesComponent {
  readonly activeStatus = input<ConversationStatus | 'todas'>('todas');
  readonly activeGroup = input<ConversationGroup>('semana');
  readonly statusSelected = output<ConversationStatus | 'todas'>();
  readonly groupSelected = output<ConversationGroup>();
  readonly statusOptions: Array<ConversationStatus | 'todas'> = [
    'todas',
    'resuelta',
    'escalada',
    'sin_fuente',
    'seguimiento',
  ];
  readonly groups: ConversationGroup[] = ['hoy', 'semana'];
  readonly conversations = AGENT_CONVERSATIONS;
  readonly visibleConversations = computed(() => {
    const selectedStatus = this.activeStatus();
    const selectedGroup = this.activeGroup();

    return this.conversations.filter((item) => {
      const matchesStatus = selectedStatus === 'todas' || item.estado === selectedStatus;
      const matchesGroup = selectedGroup === 'hoy' ? item.fecha.startsWith('2026-06-05') : true;

      return matchesStatus && matchesGroup;
    });
  });

  onStatusSelected(status: ConversationStatus | 'todas'): void {
    this.statusSelected.emit(status);
  }

  onGroupSelected(group: ConversationGroup): void {
    this.groupSelected.emit(group);
  }
}
