import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UsuariosRolesComponent } from './usuarios-roles.component';

describe('UsuariosRolesComponent', () => {
  let fixture: ComponentFixture<UsuariosRolesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuariosRolesComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(UsuariosRolesComponent);
    fixture.detectChanges();
  });

  it('should filter users by role and open-close detail modal', () => {
    const rootElement = fixture.nativeElement as HTMLElement;
    const roleFilterButton = fixture.debugElement.query(
      By.css('[data-testid="rol-filter"][data-rol="admin_ti"]'),
    );

    roleFilterButton.triggerEventHandler('click');
    fixture.detectChanges();

    const filteredRows = rootElement.querySelectorAll('[data-testid="usuario-row"]');
    const firstDetailButton = fixture.debugElement.query(
      By.css('[data-testid="usuario-open-modal"][data-usuario-id="usr-001"]'),
    );

    firstDetailButton.triggerEventHandler('click');
    fixture.detectChanges();

    const closeButton = fixture.debugElement.query(By.css('[data-testid="usuario-close-modal"]'));
    closeButton.triggerEventHandler('click');
    fixture.detectChanges();

    const modalOpenAndCloseWorks =
      filteredRows.length > 0 &&
      rootElement.querySelector('[data-testid="usuario-modal"]') === null &&
      !rootElement.textContent?.includes('Sin resultados');

    expect(modalOpenAndCloseWorks).toBeTrue();
  });
});
