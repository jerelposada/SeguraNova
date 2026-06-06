export type ConversationStatus = 'resuelta' | 'escalada' | 'sin_fuente' | 'seguimiento';
export type GapPriority = 'alta' | 'media' | 'baja';
export type RetrievalPreset = 'conservador' | 'balanceado' | 'agresivo';

export interface AgentConversationItem {
  id: string;
  usuario: string;
  pregunta: string;
  kb: string;
  estado: ConversationStatus;
  fecha: string;
  tiempoRespuestaMs: number;
}

export interface AgentGapItem {
  id: string;
  tema: string;
  prioridad: GapPriority;
  ocurrencias: number;
  ultimaDeteccion: string;
  coberturaEstimada: number;
}

export interface SemanticCacheSettings {
  enabled: boolean;
  minSimilarity: number;
  ttlMinutes: number;
  maxEntries: number;
}

export interface RetrievalEffortSettings {
  preset: RetrievalPreset;
  topK: number;
  rerankDepth: number;
  includeHybridSignals: boolean;
}
