import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KnowledgeBasesComponent } from './knowledge-bases.component';

describe('KnowledgeBasesComponent', () => {
  let fixture: ComponentFixture<KnowledgeBasesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KnowledgeBasesComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(KnowledgeBasesComponent);
    fixture.detectChanges();
  });

  it('should filter knowledge bases by status and render coverage badges', () => {
    const rootElement = fixture.nativeElement as HTMLElement;
    const warningFilter = fixture.debugElement.query(
      By.css('[data-testid="kb-filter"][data-estado="warning"]'),
    );

    warningFilter.triggerEventHandler('click');
    fixture.detectChanges();

    const renderedRows = rootElement.querySelectorAll('[data-testid="kb-row"]');
    const hasCoverageBadge = rootElement.querySelectorAll('[data-testid="kb-cobertura"]').length > 0;

    expect(renderedRows.length > 0 && hasCoverageBadge).toBeTrue();
  });
});
