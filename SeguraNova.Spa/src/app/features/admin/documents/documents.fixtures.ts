import {
  type AdminChunkPreviewItem,
  type AdminDocumentItem,
  type AdminDocumentVersion,
  type UploadQueueItem,
} from './documents.models';

export const UPLOAD_QUEUE_ITEMS: ReadonlyArray<UploadQueueItem> = [
  { id: 'cola-1', nombre: 'Poliza Hogar Premium 2026.pdf', estado: 'Subido' },
  { id: 'cola-2', nombre: 'Manual de Siniestros Auto.pdf', estado: 'Procesando' },
  { id: 'cola-3', nombre: 'Coberturas Colectivas.pdf', estado: 'Generando embeddings' },
  { id: 'cola-4', nombre: 'Preguntas Frecuentes Vida.pdf', estado: 'Listo' },
];

export const ADMIN_DOCUMENTS: ReadonlyArray<AdminDocumentItem> = [
  {
    id: 'manual-siniestros',
    nombre: 'Manual Operativo de Siniestros',
    categoria: 'Operaciones',
    estado: 'Listo',
    knowledgeBase: 'Claims Core',
    versionActiva: 'v3.2',
    actualizadoEl: '2026-05-28',
    chunks: 24,
  },
  {
    id: 'guia-coberturas',
    nombre: 'Guia Comercial de Coberturas',
    categoria: 'Productos',
    estado: 'Procesando',
    knowledgeBase: 'Policies',
    versionActiva: 'v1.4',
    actualizadoEl: '2026-05-25',
    chunks: 12,
  },
];

export const ADMIN_DOCUMENT_VERSIONS: Readonly<Record<string, ReadonlyArray<AdminDocumentVersion>>> = {
  'manual-siniestros': [
    {
      id: 'manual-siniestros-v3-2',
      version: 'v3.2',
      estado: 'Listo',
      creadoEl: '2026-05-28',
      autor: 'Equipo TI',
      paginas: 48,
      activa: true,
    },
    {
      id: 'manual-siniestros-v3-1',
      version: 'v3.1',
      estado: 'Subido',
      creadoEl: '2026-04-11',
      autor: 'Equipo TI',
      paginas: 45,
      activa: false,
    },
  ],
  'guia-coberturas': [
    {
      id: 'guia-coberturas-v1-4',
      version: 'v1.4',
      estado: 'Procesando',
      creadoEl: '2026-05-25',
      autor: 'Mesa Comercial',
      paginas: 32,
      activa: true,
    },
    {
      id: 'guia-coberturas-v1-3',
      version: 'v1.3',
      estado: 'Listo',
      creadoEl: '2026-03-15',
      autor: 'Mesa Comercial',
      paginas: 29,
      activa: false,
    },
  ],
};

export const ADMIN_CHUNKS: Readonly<Record<string, ReadonlyArray<AdminChunkPreviewItem>>> = {
  'manual-siniestros-v3-2': [
    {
      id: 'chunk-1',
      pagina: 3,
      encabezado: 'Cobertura de daños parciales',
      contenido: 'Resumen del flujo de validación documental para reclamos leves.',
      longitud: 432,
      score: 'alto',
    },
  ],
  'guia-coberturas-v1-4': [
    {
      id: 'chunk-2',
      pagina: 7,
      encabezado: 'Resumen ejecutivo de cobertura colectiva',
      contenido: 'Incluye deducibles, exclusiones y límites para pólizas comerciales.',
      longitud: 356,
      score: 'medio',
    },
  ],
};