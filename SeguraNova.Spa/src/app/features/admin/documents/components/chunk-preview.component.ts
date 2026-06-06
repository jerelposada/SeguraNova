import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  type AdminChunkPreviewItem,
  type AdminDocumentItem,
  type AdminDocumentVersion,
} from '../documents.models';

@Component({
  selector: 'app-chunk-preview',
  standalone: true,
  templateUrl: './chunk-preview.component.html',
  styleUrl: './chunk-preview.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChunkPreviewComponent {
  readonly chunks = input<ReadonlyArray<AdminChunkPreviewItem>>([]);
  readonly document = input<AdminDocumentItem | null>(null);
  readonly isOpen = input(false);
  readonly version = input<AdminDocumentVersion | null>(null);
  readonly closed = output<void>();

  onClose(): void {
    this.closed.emit();
  }
}