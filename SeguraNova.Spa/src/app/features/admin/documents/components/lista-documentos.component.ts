import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { type AdminDocumentItem } from '../documents.models';

@Component({
  selector: 'app-lista-documentos',
  standalone: true,
  templateUrl: './lista-documentos.component.html',
  styleUrl: './lista-documentos.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListaDocumentosComponent {
  readonly activeFilter = input('Todos');
  readonly documents = input<ReadonlyArray<AdminDocumentItem>>([]);
  readonly filterChanged = output<string>();
  readonly documentSelected = output<string>();
  readonly previewOpened = output<string>();

  readonly filters = computed(() => {
    const statuses = new Set(this.documents().map((document) => document.estado));

    return ['Todos', ...statuses];
  });
  readonly visibleDocuments = computed(() => {
    if (this.activeFilter() === 'Todos') {
      return this.documents();
    }

    return this.documents().filter((document) => document.estado === this.activeFilter());
  });

  onFilterSelected(filter: string): void {
    this.filterChanged.emit(filter);
  }

  onDocumentSelected(documentId: string): void {
    this.documentSelected.emit(documentId);
  }

  onPreviewOpened(documentId: string): void {
    this.previewOpened.emit(documentId);
  }
}