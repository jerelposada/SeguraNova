import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UploadDocumentoComponent } from './upload-documento.component';

describe('UploadDocumentoComponent', () => {
  let fixture: ComponentFixture<UploadDocumentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadDocumentoComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadDocumentoComponent);
    fixture.detectChanges();
  });

  it('should render simulated dropzone, primary CTA and the hardcoded pipeline states', () => {
    const rootElement = fixture.nativeElement as HTMLElement;
    const queueText = rootElement.textContent ?? '';

    expect(rootElement.querySelector('[data-testid="upload-dropzone"]')).not.toBeNull();
    expect(rootElement.querySelector('[data-testid="upload-cta"]')).not.toBeNull();
    expect(queueText).toContain('Subido');
    expect(queueText).toContain('Procesando');
    expect(queueText).toContain('Generando embeddings');
    expect(queueText).toContain('Listo');
  });
});