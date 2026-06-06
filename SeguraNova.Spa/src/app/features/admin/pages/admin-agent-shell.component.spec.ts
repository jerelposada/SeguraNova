import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminAgentShellComponent } from './admin-agent-shell.component';

describe('AdminAgentShellComponent', () => {
  let fixture: ComponentFixture<AdminAgentShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAgentShellComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminAgentShellComponent);
    fixture.detectChanges();
  });

  it('should render the four agent management regions', () => {
    const rootElement = fixture.nativeElement as HTMLElement;
    const renderedRegions = [
      rootElement.querySelector('app-historial-conversaciones'),
      rootElement.querySelector('app-gap-analysis'),
      rootElement.querySelector('app-semantic-cache-config'),
      rootElement.querySelector('app-retrieval-effort'),
    ].filter(Boolean);

    expect(renderedRegions.length).toBe(4);
  });

  it('should keep integrated local state aligned for filters, cache and retrieval changes', () => {
    const rootElement = fixture.nativeElement as HTMLElement;
    const statusEscalada = rootElement.querySelector('app-historial-conversaciones [data-status-filter="escalada"]') as HTMLButtonElement;
    const cacheToggle = rootElement.querySelector('app-semantic-cache-config [data-testid="cache-enabled"]') as HTMLInputElement;
    const aggressivePreset = rootElement.querySelector('app-retrieval-effort [data-testid="retrieval-preset-agresivo"]') as HTMLButtonElement;

    statusEscalada.click();
    cacheToggle.click();
    aggressivePreset.click();
    fixture.detectChanges();

    const summary = rootElement.querySelector('[data-testid="agent-shell-state"]')?.textContent ?? '';
    const isStable =
      summary.includes('escalada') &&
      summary.includes('cache desactivado') &&
      summary.includes('agresivo') &&
      summary.includes('grupos');

    expect(isStable).toBeTrue();
  });
});
