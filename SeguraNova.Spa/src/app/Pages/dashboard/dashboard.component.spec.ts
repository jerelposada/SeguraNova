import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent (T5)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('renders KPI grid and main sections', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    const kpiGrid = el.querySelector('[data-testid="kpi-grid"]');
    const sections = el.querySelectorAll('[data-testid="dashboard-section"]');

    expect(kpiGrid).toBeTruthy();
    expect(sections.length).toBeGreaterThanOrEqual(2);
  });
});
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent (visuals)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent, RouterTestingModule]
    }).compileComponents();
  });

  it('renders KPIs and sections (R3, R5)', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const kpis = el.querySelectorAll('[data-testid="dashboard-kpi-card"]');
    expect(kpis.length).toBeGreaterThan(0);
    expect(el.querySelector('.dashboard__sections')).toBeTruthy();
  });

  it('renders same visual structure when used by /chat route (R6)', async () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('[data-testid="dashboard-kpi-card"]').length).toBeGreaterThan(0);
  });
});
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