import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import { DEFAULT_SEMANTIC_CACHE_SETTINGS } from '../agent.fixtures';
import { SemanticCacheSettings } from '../agent.models';

@Component({
  selector: 'app-semantic-cache-config',
  standalone: true,
  templateUrl: './semantic-cache-config.component.html',
  styleUrl: './semantic-cache-config.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SemanticCacheConfigComponent {
  readonly settings = input<SemanticCacheSettings>(DEFAULT_SEMANTIC_CACHE_SETTINGS);
  readonly settingsChange = output<SemanticCacheSettings>();
  readonly localSettings = signal(this.settings());
  readonly summary = computed(() => {
    const current = this.localSettings();
    const status = current.enabled ? 'activado' : 'desactivado';

    return `Cache ${status} · similitud ${current.minSimilarity.toFixed(2)} · TTL ${current.ttlMinutes}m · max ${current.maxEntries}`;
  });

  constructor() {
    effect(() => {
      this.localSettings.set(this.settings());
    });
  }

  onEnabledChange(nextValue: boolean): void {
    this.updateSettings({ enabled: nextValue });
  }

  onSimilarityChange(nextValue: number): void {
    this.updateSettings({ minSimilarity: nextValue });
  }

  onTtlChange(nextValue: number): void {
    this.updateSettings({ ttlMinutes: nextValue });
  }

  onMaxEntriesChange(nextValue: number): void {
    this.updateSettings({ maxEntries: nextValue });
  }

  private updateSettings(partial: Partial<SemanticCacheSettings>): void {
    const nextSettings = { ...this.localSettings(), ...partial };

    this.localSettings.set(nextSettings);
    this.settingsChange.emit(nextSettings);
  }
}
