import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistorialConversacionesComponent } from './historial-conversaciones.component';

describe('HistorialConversacionesComponent', () => {
  let fixture: ComponentFixture<HistorialConversacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialConversacionesComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(HistorialConversacionesComponent);
    fixture.detectChanges();
  });

  it('should render filters, groups and all conversation statuses', () => {
    const rootElement = fixture.nativeElement as HTMLElement;
    const hasAllRegions =
      rootElement.querySelector('[data-testid="conversation-filters"]') !== null &&
      rootElement.querySelector('[data-testid="conversation-groups"]') !== null &&
      rootElement.querySelectorAll('[data-testid="conversation-row"]').length > 0 &&
      rootElement.querySelectorAll('[data-status="resuelta"]').length > 0 &&
      rootElement.querySelectorAll('[data-status="escalada"]').length > 0 &&
      rootElement.querySelectorAll('[data-status="sin_fuente"]').length > 0 &&
      rootElement.querySelectorAll('[data-status="seguimiento"]').length > 0;

    expect(hasAllRegions).toBeTrue();
  });
});
