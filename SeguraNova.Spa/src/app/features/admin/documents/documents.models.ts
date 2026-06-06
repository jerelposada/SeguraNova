export type DocumentPipelineStatus = 'Subido' | 'Procesando' | 'Generando embeddings' | 'Listo';

export interface UploadQueueItem {
  id: string;
  nombre: string;
  estado: DocumentPipelineStatus;
}

export interface AdminDocumentItem {
  id: string;
  nombre: string;
  categoria: string;
  estado: DocumentPipelineStatus;
  knowledgeBase: string;
  versionActiva: string;
  actualizadoEl: string;
  chunks: number;
}

export interface AdminDocumentVersion {
  id: string;
  version: string;
  estado: DocumentPipelineStatus;
  creadoEl: string;
  autor: string;
  paginas: number;
  activa: boolean;
}

export interface AdminChunkPreviewItem {
  id: string;
  pagina: number;
  encabezado: string;
  contenido: string;
  longitud: number;
  score: 'alto' | 'medio' | 'bajo';
}