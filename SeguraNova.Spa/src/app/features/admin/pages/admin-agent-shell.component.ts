import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  ConversationStatus,
  RetrievalEffortSettings,
  SemanticCacheSettings,
} from '../agent/agent.models';
import {
  DEFAULT_RETRIEVAL_SETTINGS,
  DEFAULT_SEMANTIC_CACHE_SETTINGS,
} from '../agent/agent.fixtures';
import { GapAnalysisComponent } from '../agent/components/gap-analysis.component';
import { HistorialConversacionesComponent } from '../agent/components/historial-conversaciones.component';
import { RetrievalEffortComponent } from '../agent/components/retrieval-effort.component';
import { SemanticCacheConfigComponent } from '../agent/components/semantic-cache-config.component';

@Component({
  selector: 'app-admin-agent-shell',
  standalone: true,
  imports: [
    HistorialConversacionesComponent,
    GapAnalysisComponent,
    SemanticCacheConfigComponent,
    RetrievalEffortComponent,
  ],
  templateUrl: './admin-agent-shell.component.html',
  styleUrl: './admin-agent-shell.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAgentShellComponent {
  readonly activeConversationStatus = signal<ConversationStatus | 'todas'>('todas');
  readonly activeConversationGroup = signal('hoy');
  readonly cacheSettings = signal<SemanticCacheSettings>(DEFAULT_SEMANTIC_CACHE_SETTINGS);
  readonly retrievalSettings = signal<RetrievalEffortSettings>(DEFAULT_RETRIEVAL_SETTINGS);

  onStatusChange(status: ConversationStatus | 'todas'): void {
    this.activeConversationStatus.set(status);
  }

  onGroupChange(group: string): void {
    this.activeConversationGroup.set(group);
  }

  onCacheSettingsChange(settings: SemanticCacheSettings): void {
    this.cacheSettings.set(settings);
  }

  onRetrievalSettingsChange(settings: RetrievalEffortSettings): void {
    this.retrievalSettings.set(settings);
  }
}
