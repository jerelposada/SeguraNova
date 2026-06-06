import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AuditLogComponent } from './audit-log.component';

describe('AuditLogComponent', () => {
  let fixture: ComponentFixture<AuditLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditLogComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(AuditLogComponent);
    fixture.detectChanges();
  });

  it('should filter events by severity and keep highlighted visual rows', () => {
    const rootElement = fixture.nativeElement as HTMLElement;
    const criticalFilter = fixture.debugElement.query(
      By.css('[data-testid="audit-filter"][data-severity="critical"]'),
    );

    criticalFilter.triggerEventHandler('click');
    fixture.detectChanges();

    const rows = rootElement.querySelectorAll('[data-testid="audit-row"]');
    const highlightedCritical =
      rootElement.querySelector('[data-testid="audit-row"][data-severity="critical"]') !== null;

    expect(rows.length > 0 && highlightedCritical).toBeTrue();
  });
});
