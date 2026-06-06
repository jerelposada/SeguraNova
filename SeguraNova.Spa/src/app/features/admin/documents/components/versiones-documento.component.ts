import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { type AdminDocumentItem, type AdminDocumentVersion } from '../documents.models';

@Component({
  selector: 'app-versiones-documento',
  standalone: true,
  templateUrl: './versiones-documento.component.html',
  styleUrl: './versiones-documento.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VersionesDocumentoComponent {
  readonly document = input<AdminDocumentItem | null>(null);
  readonly versions = input<ReadonlyArray<AdminDocumentVersion>>([]);
  readonly selectedVersionId = input('');
  readonly versionSelected = output<string>();

  onVersionSelected(versionId: string): void {
    this.versionSelected.emit(versionId);
  }
}