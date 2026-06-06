import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SemanticCacheSettings } from '../agent.models';
import { SemanticCacheConfigComponent } from './semantic-cache-config.component';

describe('SemanticCacheConfigComponent', () => {
  let fixture: ComponentFixture<SemanticCacheConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SemanticCacheConfigComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(SemanticCacheConfigComponent);
    fixture.detectChanges();
  });

  it('should update local toggles and thresholds while emitting settings changes', () => {
    const emitted: SemanticCacheSettings[] = [];
    const component = fixture.componentInstance;

    component.settingsChange.subscribe((value) => emitted.push(value));

    const rootElement = fixture.nativeElement as HTMLElement;
    const toggle = rootElement.querySelector('[data-testid="cache-enabled"]') as HTMLInputElement;
    const similarityInput = rootElement.querySelector('[data-testid="cache-min-similarity"]') as HTMLInputElement;

    toggle.click();
    similarityInput.value = '0.91';
    similarityInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const summary = rootElement.querySelector('[data-testid="cache-summary"]')?.textContent ?? '';
    const stateChanged = summary.includes('desactivado') && summary.includes('0.91') && emitted.length >= 2;

    expect(stateChanged).toBeTrue();
  });
});
