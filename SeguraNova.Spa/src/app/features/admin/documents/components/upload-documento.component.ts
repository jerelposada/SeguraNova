import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { UPLOAD_QUEUE_ITEMS } from '../documents.fixtures';
import { type UploadQueueItem } from '../documents.models';

@Component({
  selector: 'app-upload-documento',
  standalone: true,
  templateUrl: './upload-documento.component.html',
  styleUrl: './upload-documento.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadDocumentoComponent {
  readonly queue = input<ReadonlyArray<UploadQueueItem>>([]);
  readonly queueItems = computed(() => this.queue().length ? this.queue() : UPLOAD_QUEUE_ITEMS);
}