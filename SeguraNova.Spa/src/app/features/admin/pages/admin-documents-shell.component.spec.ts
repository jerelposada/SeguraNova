import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AdminDocumentsShellComponent } from './admin-documents-shell.component';

describe('AdminDocumentsShellComponent', () => {
  let fixture: ComponentFixture<AdminDocumentsShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDocumentsShellComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDocumentsShellComponent);
    fixture.detectChanges();
  });

  it('should render upload, catalog, versions and chunk preview regions', () => {
    const rootElement = fixture.nativeElement as HTMLElement;

    expect(rootElement.querySelector('[data-testid="documents-shell"]')).not.toBeNull();
    expect(rootElement.querySelector('app-upload-documento')).not.toBeNull();
    expect(rootElement.querySelector('app-lista-documentos')).not.toBeNull();
    expect(rootElement.querySelector('app-versiones-documento')).not.toBeNull();
    expect(rootElement.querySelector('app-chunk-preview')).not.toBeNull();
  });

  it('should update the versions panel and highlight the active version when a document is selected', () => {
    const selectButton = fixture.debugElement.query(
      By.css('[data-testid="select-document"][data-document-id="guia-coberturas"]'),
    );

    selectButton.triggerEventHandler('click');
    fixture.detectChanges();

    const rootElement = fixture.nativeElement as HTMLElement;
    const activeVersion = rootElement.querySelector('[data-testid="version-item-active"]');
    const newVersionCta = rootElement.querySelector('[data-testid="new-version-cta"]');

    expect(rootElement.textContent).toContain('Guia Comercial de Coberturas');
    expect(activeVersion?.textContent).toContain('v1.4');
    expect(activeVersion?.textContent).toContain('2026-05-25');
    expect(activeVersion?.textContent).toContain('Mesa Comercial');
    expect(activeVersion?.textContent).toContain('32 paginas');
    expect(newVersionCta?.textContent).toContain('Subir nueva version');
  });

  it('should open and close the chunk preview with the active document data', () => {
    const previewButton = fixture.debugElement.query(
      By.css('[data-testid="open-preview"][data-document-id="manual-siniestros"]'),
    );

    previewButton.triggerEventHandler('click');
    fixture.detectChanges();

    let rootElement = fixture.nativeElement as HTMLElement;
    const closeButton = rootElement.querySelector('[data-testid="close-preview"]') as HTMLButtonElement;
    const qualityBadge = rootElement.querySelector('[data-testid="chunk-score-badge"]');

    expect(rootElement.textContent).toContain('Cobertura de daños parciales');
    expect(rootElement.textContent).toContain('Manual Operativo de Siniestros');
    expect(rootElement.textContent).toContain('Pagina 3');
    expect(rootElement.textContent).toContain('432 caracteres');
    expect(qualityBadge?.textContent).toContain('alto');
    expect(qualityBadge?.getAttribute('data-score')).toBe('alto');
    expect(rootElement.querySelector('[data-testid="chunk-preview-surface"]')).not.toBeNull();

    closeButton.click();
    fixture.detectChanges();

    rootElement = fixture.nativeElement as HTMLElement;

    expect(rootElement.querySelector('[data-testid="chunk-preview-surface"]')).toBeNull();
  });

  it('should keep filter state, initial selection and shell rendering aligned without services', () => {
    const rootElement = fixture.nativeElement as HTMLElement;
    const processingFilter = fixture.debugElement.query(
      By.css('[data-testid="document-filter"][data-filter="Procesando"]'),
    );
    const styles = (AdminDocumentsShellComponent as unknown as { ɵcmp: { styles: string[] } }).ɵcmp.styles.join(' ');
    const factorySource = String((AdminDocumentsShellComponent as unknown as { ɵfac?: unknown }).ɵfac ?? '');

    expect(rootElement.textContent).toContain('Manual Operativo de Siniestros');

    processingFilter.triggerEventHandler('click');
    fixture.detectChanges();

    const filteredRows = fixture.nativeElement.querySelectorAll('[data-testid="document-row"]');
    const versionsRegion = fixture.nativeElement.querySelector('[data-testid="versions-region"]') as HTMLElement;

    expect(filteredRows.length).toBe(1);
    expect(versionsRegion.textContent).toContain('Guia Comercial de Coberturas');
    expect(versionsRegion.textContent).not.toContain('Manual Operativo de Siniestros');
    expect(styles).toContain('@media');
    expect(styles).toContain('var(--sp-');
    expect(factorySource).not.toMatch(/HttpClient|directiveInject\(|inject\(/);
  });
});