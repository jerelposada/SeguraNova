import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RetrievalEffortSettings } from '../agent.models';
import { RetrievalEffortComponent } from './retrieval-effort.component';

describe('RetrievalEffortComponent', () => {
  let fixture: ComponentFixture<RetrievalEffortComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetrievalEffortComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(RetrievalEffortComponent);
    fixture.detectChanges();
  });

  it('should apply presets and slider changes while emitting selected profile', () => {
    const emitted: RetrievalEffortSettings[] = [];
    const component = fixture.componentInstance;

    component.settingsChange.subscribe((value) => emitted.push(value));

    const rootElement = fixture.nativeElement as HTMLElement;
    const aggressivePreset = rootElement.querySelector('[data-testid="retrieval-preset-agresivo"]') as HTMLButtonElement;
    const topKSlider = rootElement.querySelector('[data-testid="retrieval-topk"]') as HTMLInputElement;

    aggressivePreset.click();
    topKSlider.value = '12';
    topKSlider.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const summary = rootElement.querySelector('[data-testid="retrieval-summary"]')?.textContent ?? '';
    const updated = summary.includes('agresivo') && summary.includes('topK 12') && emitted.length >= 2;

    expect(updated).toBeTrue();
  });
});
