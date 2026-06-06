import {
  AgentConversationItem,
  AgentGapItem,
  RetrievalEffortSettings,
  SemanticCacheSettings,
} from './agent.models';

export const AGENT_CONVERSATIONS: AgentConversationItem[] = [
  {
    id: 'conv-001',
    usuario: 'Marta Prieto',
    pregunta: 'Cobertura para granizo en auto familiar',
    kb: 'Guia Comercial de Coberturas',
    estado: 'resuelta',
    fecha: '2026-06-05 10:14',
    tiempoRespuestaMs: 640,
  },
  {
    id: 'conv-002',
    usuario: 'Lucas Palma',
    pregunta: 'Proceso de siniestro parcial sin denuncia policial',
    kb: 'Manual Operativo de Siniestros',
    estado: 'escalada',
    fecha: '2026-06-05 09:40',
    tiempoRespuestaMs: 1120,
  },
  {
    id: 'conv-003',
    usuario: 'Carla Vera',
    pregunta: 'Cobertura para dron recreativo en plan hogar',
    kb: 'Sin coincidencia',
    estado: 'sin_fuente',
    fecha: '2026-06-04 17:26',
    tiempoRespuestaMs: 1330,
  },
  {
    id: 'conv-004',
    usuario: 'Diego Mendez',
    pregunta: 'Seguimiento de reembolso de cristal lateral',
    kb: 'Manual Operativo de Siniestros',
    estado: 'seguimiento',
    fecha: '2026-06-03 14:11',
    tiempoRespuestaMs: 710,
  },
];

export const AGENT_GAPS: AgentGapItem[] = [
  {
    id: 'gap-001',
    tema: 'Cobertura para movilidad electrica ligera',
    prioridad: 'alta',
    ocurrencias: 28,
    ultimaDeteccion: '2026-06-05 10:05',
    coberturaEstimada: 0.32,
  },
  {
    id: 'gap-002',
    tema: 'Reglas para siniestros en estacionamientos privados',
    prioridad: 'media',
    ocurrencias: 17,
    ultimaDeteccion: '2026-06-05 08:31',
    coberturaEstimada: 0.51,
  },
  {
    id: 'gap-003',
    tema: 'Exclusiones de drones recreativos',
    prioridad: 'baja',
    ocurrencias: 7,
    ultimaDeteccion: '2026-06-04 15:22',
    coberturaEstimada: 0.7,
  },
];

export const DEFAULT_SEMANTIC_CACHE_SETTINGS: SemanticCacheSettings = {
  enabled: true,
  minSimilarity: 0.78,
  ttlMinutes: 45,
  maxEntries: 1200,
};

export const DEFAULT_RETRIEVAL_SETTINGS: RetrievalEffortSettings = {
  preset: 'balanceado',
  topK: 8,
  rerankDepth: 40,
  includeHybridSignals: true,
};
