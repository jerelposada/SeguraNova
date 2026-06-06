import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import { DEFAULT_RETRIEVAL_SETTINGS } from '../agent.fixtures';
import { RetrievalEffortSettings, RetrievalPreset } from '../agent.models';

@Component({
  selector: 'app-retrieval-effort',
  standalone: true,
  templateUrl: './retrieval-effort.component.html',
  styleUrl: './retrieval-effort.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RetrievalEffortComponent {
  readonly settings = input<RetrievalEffortSettings>(DEFAULT_RETRIEVAL_SETTINGS);
  readonly settingsChange = output<RetrievalEffortSettings>();
  readonly localSettings = signal(this.settings());
  readonly presets: RetrievalPreset[] = ['conservador', 'balanceado', 'agresivo'];
  readonly summary = computed(() => {
    const current = this.localSettings();
    const hybrid = current.includeHybridSignals ? 'hybrid on' : 'hybrid off';

    return `${current.preset} · topK ${current.topK} · rerank ${current.rerankDepth} · ${hybrid}`;
  });

  constructor() {
    effect(() => {
      this.localSettings.set(this.settings());
    });
  }

  onPresetSelected(preset: RetrievalPreset): void {
    this.updateSettings({ preset });
  }

  onTopKChanged(topK: number): void {
    this.updateSettings({ topK });
  }

  onRerankChanged(rerankDepth: number): void {
    this.updateSettings({ rerankDepth });
  }

  onHybridChanged(includeHybridSignals: boolean): void {
    this.updateSettings({ includeHybridSignals });
  }

  private updateSettings(partial: Partial<RetrievalEffortSettings>): void {
    const nextSettings = { ...this.localSettings(), ...partial };

    this.localSettings.set(nextSettings);
    this.settingsChange.emit(nextSettings);
  }
}
