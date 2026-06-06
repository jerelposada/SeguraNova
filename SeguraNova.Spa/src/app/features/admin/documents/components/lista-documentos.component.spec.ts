import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ADMIN_DOCUMENTS } from '../documents.fixtures';
import { ListaDocumentosComponent } from './lista-documentos.component';

describe('ListaDocumentosComponent', () => {
  let fixture: ComponentFixture<ListaDocumentosComponent>;
  let component: ListaDocumentosComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaDocumentosComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaDocumentosComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('documents', ADMIN_DOCUMENTS);
    fixture.componentRef.setInput('activeFilter', 'Todos');
    fixture.detectChanges();
  });

  it('should render visual filters, hardcoded documents and emit selection plus preview actions', () => {
    const filterSpy = jasmine.createSpy<(filter: string) => void>('filterChanged');
    const documentSpy = jasmine.createSpy<(documentId: string) => void>('documentSelected');
    const previewSpy = jasmine.createSpy('previewOpened');
    const rootElement = fixture.nativeElement as HTMLElement;

    component.filterChanged.subscribe(filterSpy);
    component.documentSelected.subscribe(documentSpy);
    component.previewOpened.subscribe(previewSpy);

    const filterButtons = rootElement.querySelectorAll('[data-testid="document-filter"]');
    const documentCards = rootElement.querySelectorAll('[data-testid="document-row"]');
    const processingFilter = fixture.debugElement.query(
      By.css('[data-testid="document-filter"][data-filter="Procesando"]'),
    );
    const firstSelectButton = fixture.debugElement.query(
      By.css('[data-testid="select-document"][data-document-id="manual-siniestros"]'),
    );
    const firstPreviewButton = fixture.debugElement.query(
      By.css('[data-testid="open-preview"][data-document-id="manual-siniestros"]'),
    );

    processingFilter.triggerEventHandler('click');
    firstSelectButton.triggerEventHandler('click');
    firstPreviewButton.triggerEventHandler('click');

    expect(filterButtons.length).toBeGreaterThanOrEqual(3);
    expect(documentCards.length).toBe(2);
    expect(rootElement.textContent).toContain('Manual Operativo de Siniestros');
    expect(rootElement.textContent).toContain('Guia Comercial de Coberturas');
    expect(filterSpy).toHaveBeenCalledWith('Procesando');
    expect(documentSpy).toHaveBeenCalledWith('manual-siniestros');
    expect(previewSpy).toHaveBeenCalled();
  });
});