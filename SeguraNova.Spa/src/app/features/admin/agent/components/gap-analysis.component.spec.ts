import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GapAnalysisComponent } from './gap-analysis.component';

describe('GapAnalysisComponent', () => {
  let fixture: ComponentFixture<GapAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GapAnalysisComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(GapAnalysisComponent);
    fixture.detectChanges();
  });

  it('should render metrics, cards and prioritized ranking with mock data', () => {
    const rootElement = fixture.nativeElement as HTMLElement;
    const isRendered =
      rootElement.querySelectorAll('[data-testid="gap-metric-card"]').length >= 3 &&
      rootElement.querySelectorAll('[data-testid="gap-priority-card"]').length >= 3 &&
      rootElement.querySelector('[data-priority="alta"]') !== null;

    expect(isRendered).toBeTrue();
  });
});
