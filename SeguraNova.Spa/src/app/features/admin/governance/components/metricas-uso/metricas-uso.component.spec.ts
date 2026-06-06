import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MetricasUsoComponent } from './metricas-uso.component';

describe('MetricasUsoComponent', () => {
  let fixture: ComponentFixture<MetricasUsoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetricasUsoComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(MetricasUsoComponent);
    fixture.detectChanges();
  });

  it('should switch period and update visual dataset bars', () => {
    const rootElement = fixture.nativeElement as HTMLElement;
    const periodButton = fixture.debugElement.query(
      By.css('[data-testid="period-filter"][data-periodo="30d"]'),
    );

    periodButton.triggerEventHandler('click');
    fixture.detectChanges();

    const bars = rootElement.querySelectorAll('[data-testid="metric-bar"]');
    const hasExpectedBar =
      rootElement.querySelector('[data-testid="metric-bar"][data-value="74"]') !== null;

    expect(bars.length > 0 && hasExpectedBar).toBeTrue();
  });
});
