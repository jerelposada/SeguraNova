import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  ADMIN_CHUNKS,
  ADMIN_DOCUMENTS,
  ADMIN_DOCUMENT_VERSIONS,
} from '../documents/documents.fixtures';
import { ChunkPreviewComponent } from '../documents/components/chunk-preview.component';
import { ListaDocumentosComponent } from '../documents/components/lista-documentos.component';
import { UploadDocumentoComponent } from '../documents/components/upload-documento.component';
import { VersionesDocumentoComponent } from '../documents/components/versiones-documento.component';

@Component({
  selector: 'app-admin-documents-shell',
  standalone: true,
  imports: [
    UploadDocumentoComponent,
    ListaDocumentosComponent,
    VersionesDocumentoComponent,
    ChunkPreviewComponent,
  ],
  templateUrl: './admin-documents-shell.component.html',
  styleUrl: './admin-documents-shell.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDocumentsShellComponent {
  readonly activeFilter = signal('Todos');
  readonly documents = signal(ADMIN_DOCUMENTS);
  readonly selectedDocumentId = signal(ADMIN_DOCUMENTS[0]?.id ?? '');
  readonly previewOpen = signal(false);
  readonly selectedDocument = computed(
    () => this.documents().find((document) => document.id === this.selectedDocumentId()) ?? null,
  );
  readonly versions = computed(() => ADMIN_DOCUMENT_VERSIONS[this.selectedDocumentId()] ?? []);
  readonly selectedVersionId = signal(this.versions()[0]?.id ?? '');
  readonly selectedVersion = computed(
    () => this.versions().find((version) => version.id === this.selectedVersionId()) ?? null,
  );
  readonly previewChunks = computed(() => ADMIN_CHUNKS[this.selectedVersionId()] ?? []);

  onFilterChange(filter: string): void {
    this.activeFilter.set(filter);

    const nextDocument = this.documents().find(
      (document) => filter === 'Todos' || document.estado === filter,
    );

    if (nextDocument) {
      this.onDocumentSelected(nextDocument.id);
    }
  }

  onDocumentSelected(documentId: string): void {
    this.selectedDocumentId.set(documentId);
    this.selectedVersionId.set(ADMIN_DOCUMENT_VERSIONS[documentId]?.[0]?.id ?? '');
  }

  onVersionSelected(versionId: string): void {
    this.selectedVersionId.set(versionId);
  }

  openPreview(documentId: string): void {
    this.onDocumentSelected(documentId);
    this.previewOpen.set(true);
  }

  closePreview(): void {
    this.previewOpen.set(false);
  }
}
