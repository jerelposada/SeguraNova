import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
  });

  it('should render admin governance metrics and integrated sections', () => {
    const rootElement = fixture.nativeElement as HTMLElement;
    const hasExpectedContent =
      rootElement.querySelectorAll('[data-testid="dashboard-kpi-card"]').length >= 4 &&
      rootElement.querySelector('app-usuarios-roles') !== null &&
      rootElement.querySelector('app-knowledge-bases') !== null &&
      rootElement.querySelector('app-metricas-uso') !== null &&
      rootElement.querySelector('app-audit-log') !== null;

    expect(hasExpectedContent).toBeTrue();
  });
});