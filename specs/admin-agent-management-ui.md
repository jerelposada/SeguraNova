# Spec â€” admin-agent-management-ui

## Requirements
Construir la experiencia visual de administracion del agente dentro de la ruta existente admin/agente del Admin Panel Angular 20. El alcance es UI-only: historial, analisis de gaps, configuracion de semantic cache y retrieval effort con datos hardcodeados, sin servicios, sin HttpClient y sin persistencia.

### Criterios de aceptaciÃ³n
- WHEN el usuario navega a admin/agente THE SYSTEM SHALL renderizar el shell de agente dentro del AdminLayoutComponent existente, sin romper la jerarquia de rutas admin.
- R1: WHEN el shell carga THE SYSTEM SHALL mostrar un HistorialConversacionesComponent con tabla o lista agrupada, filtros visuales hardcodeados y estados de conversacion (resuelta, escalada, sin fuente, en seguimiento).
- R2: WHEN el admin revisa calidad de respuestas THE SYSTEM SHALL mostrar un GapAnalysisComponent con metricas visuales, tarjetas y lista priorizada de gaps de conocimiento usando datos simulados.
- R3: WHEN el admin ajusta cache semantico THE SYSTEM SHALL mostrar un SemanticCacheConfigComponent con toggles, thresholds y TTL simulados, reflejando cambios solo en estado local con signals.
- R4: WHEN el admin ajusta esfuerzo de recuperacion THE SYSTEM SHALL mostrar un RetrievalEffortComponent con sliders o controles equivalentes, presets visuales y resumen del perfil activo sin backend.
- R5: WHEN el usuario interactua con filtros, tabs, toggles, sliders o presets THE SYSTEM SHALL sincronizar estado local en el shell de agente con signals y eventos entre componentes standalone.
- R6: WHEN se implementen vistas y estilos THE SYSTEM SHALL usar control flow moderno de Angular 20 (@if, @for), estructura feature-first y solo design tokens, paleta y tipografias globales existentes.
- R7: WHEN se ejecute la suite unitaria del slice admin agente THE SYSTEM SHALL existir cobertura para render del shell, presencia de los cuatro componentes y cambios de estado locales criticos en filtros, toggles y presets.

### Non-goals
- No integrar LLM real, Semantic Kernel, telemetria real, almacenamiento ni APIs.
- No agregar servicios Angular, HttpClient, NgRx, signals globales ni persistencia local.
- No implementar reglas de negocio reales para score de gap, cache hit-rate o ranking de retrieval.
- No abordar las features 7 o 9 ni modificar otras secciones del panel admin fuera de lo necesario para admin/agente.

---

## Design
### Flujo
```text
Admin TI
   |
   v
/admin/agente
   |
   v
AdminAgentShellComponent
   |
   +--> HistorialConversacionesComponent
   |        - lista/tabla de conversaciones
   |        - filtros visuales y agrupacion
   |
   +--> GapAnalysisComponent
   |        - metricas y tarjetas de gaps
   |        - prioridades simuladas
   |
   +--> SemanticCacheConfigComponent
   |        - toggles y thresholds mock
   |        - estado local de configuracion
   |
   +--> RetrievalEffortComponent
            - slider/preset de esfuerzo
            - resumen de perfil seleccionado
```

### Archivos afectados
| Archivo | AcciÃ³n |
|---------|--------|
| SeguraNova.Spa/src/app/app.routes.ts | Verificar sin romper la ruta hija admin/agente ya existente |
| SeguraNova.Spa/src/app/features/admin/pages/admin-agent-shell.component.ts | Modificar shell placeholder para composicion real del slice |
| SeguraNova.Spa/src/app/features/admin/pages/admin-agent-shell.component.html | Crear o usar template externo del shell agente |
| SeguraNova.Spa/src/app/features/admin/pages/admin-agent-shell.component.css | Crear o usar estilos externos del shell agente |
| SeguraNova.Spa/src/app/features/admin/agent/components/historial-conversaciones.component.ts | Crear |
| SeguraNova.Spa/src/app/features/admin/agent/components/historial-conversaciones.component.html | Crear |
| SeguraNova.Spa/src/app/features/admin/agent/components/historial-conversaciones.component.css | Crear |
| SeguraNova.Spa/src/app/features/admin/agent/components/gap-analysis.component.ts | Crear |
| SeguraNova.Spa/src/app/features/admin/agent/components/gap-analysis.component.html | Crear |
| SeguraNova.Spa/src/app/features/admin/agent/components/gap-analysis.component.css | Crear |
| SeguraNova.Spa/src/app/features/admin/agent/components/semantic-cache-config.component.ts | Crear |
| SeguraNova.Spa/src/app/features/admin/agent/components/semantic-cache-config.component.html | Crear |
| SeguraNova.Spa/src/app/features/admin/agent/components/semantic-cache-config.component.css | Crear |
| SeguraNova.Spa/src/app/features/admin/agent/components/retrieval-effort.component.ts | Crear |
| SeguraNova.Spa/src/app/features/admin/agent/components/retrieval-effort.component.html | Crear |
| SeguraNova.Spa/src/app/features/admin/agent/components/retrieval-effort.component.css | Crear |
| SeguraNova.Spa/src/app/features/admin/pages/admin-agent-shell.component.spec.ts | Crear o expandir |
| SeguraNova.Spa/src/app/features/admin/agent/components/*.spec.ts | Crear pruebas unitarias del slice agente |
| SeguraNova.Spa/src/app/app.routes.spec.ts | Expandir trazabilidad de ruta admin/agente y restricciones UI-only |

### Contratos de interfaces
```ts
type ConversationStatus = 'resuelta' | 'escalada' | 'sin_fuente' | 'seguimiento';
type GapPriority = 'alta' | 'media' | 'baja';
type RetrievalPreset = 'conservador' | 'balanceado' | 'agresivo';

interface AgentConversationItem {
  id: string;
  usuario: string;
  pregunta: string;
  kb: string;
  estado: ConversationStatus;
  fecha: string;
  tiempoRespuestaMs: number;
}

interface AgentGapItem {
  id: string;
  tema: string;
  prioridad: GapPriority;
  ocurrencias: number;
  ultimaDeteccion: string;
  coberturaEstimada: number;
}

interface SemanticCacheSettings {
  enabled: boolean;
  minSimilarity: number;
  ttlMinutes: number;
  maxEntries: number;
}

interface RetrievalEffortSettings {
  preset: RetrievalPreset;
  topK: number;
  rerankDepth: number;
  includeHybridSignals: boolean;
}

class HistorialConversacionesComponent {}
class GapAnalysisComponent {}
class SemanticCacheConfigComponent {}
class RetrievalEffortComponent {}
class AdminAgentShellComponent {}
```

### Decisiones tÃ©cnicas
- El estado orquestador vive en AdminAgentShellComponent con signals para filtro activo, grupo seleccionado, cache settings y retrieval settings; evita servicios y mantiene alcance visual.
- Cada componente del slice es standalone y orientado a presentacion para facilitar pruebas angostas por responsabilidad.
- Los fixtures tipados se definen localmente al feature agente para simular volumen realista sin dependencias externas.
- Se favorece composicion por inputs/outputs entre shell y subcomponentes, descartando estado global porque no hay necesidad de compartir datos fuera de admin/agente.
- Se transforma el shell placeholder inline a plantilla estructurada para mejorar testabilidad, trazabilidad de requisitos y mantenibilidad.

---

## Tasks
### Reglas para el coder
- TDD estricto: RED -> GREEN -> REFACTOR
- Funciones <= 20 lÃ­neas, 1 responsabilidad, <= 3 parÃ¡metros
- Nombres que revelan intenciÃ³n
- Sin auto-aprobaciÃ³n

### Lista
Progreso: 12/12

- [x] T1: test â€” verificar que admin-agent-shell renderiza las cuatro regiones principales del slice agente dentro del layout admin.
- [x] T2: implementar â€” reemplazar placeholder de AdminAgentShellComponent por composicion real, template externo y estado local minimo.
- [x] T3: test â€” verificar que HistorialConversacionesComponent renderiza filtros, agrupacion y estados hardcodeados de conversaciones.
- [x] T4: implementar â€” construir HistorialConversacionesComponent standalone con tabla/lista agrupada y eventos de seleccion/filtro.
- [x] T5: test â€” verificar que GapAnalysisComponent renderiza metricas, tarjetas y ranking priorizado de gaps con datos mock.
- [x] T6: implementar â€” construir GapAnalysisComponent con visuales estaticos y control flow moderno.
- [x] T7: test â€” verificar que SemanticCacheConfigComponent refleja cambios de toggles/thresholds en estado local y emite ajustes al shell.
- [x] T8: implementar â€” construir SemanticCacheConfigComponent con controles simulados y resumen de configuracion activa.
- [x] T9: test â€” verificar que RetrievalEffortComponent aplica presets/slider y comunica el perfil seleccionado al shell.
- [x] T10: implementar â€” construir RetrievalEffortComponent con presets visuales, slider y summary card sin backend.
- [x] T11: test â€” verificar estabilidad del estado local integrado (filtros + cache + retrieval) y ausencia de dependencias prohibidas en el slice.
- [x] T12: refactor — consolidar fixtures/helpers/spec setup y limpiar estilos repetidos sin cambiar comportamiento.

---
## Review Report
**Fecha:** 2026-06-05
**Veredicto:** RECHAZADO

**Tests:** 41 pasando · 0 fallando
**Trazabilidad:** R1 -> HistorialConversacionesComponent should render filters, groups and all conversation statuses OK · R2 -> GapAnalysisComponent should render metrics, cards and prioritized ranking with mock data OK · R3 -> SemanticCacheConfigComponent should update local toggles and thresholds while emitting settings changes OK · R4 -> RetrievalEffortComponent should apply presets and slider changes while emitting selected profile OK · R5 -> AdminAgentShellComponent should keep integrated local state aligned for filters, cache and retrieval changes OK · R6 -> sin test explicito dedicado FAIL · R7 -> cobertura de shell + cuatro componentes + cambios criticos OK

**Observaciones bloqueantes:**
- OB-1 · SeguraNova.Spa/src/app/features/admin/agent/components/gap-analysis.component.spec.ts:18 (y resto del slice specs) · No existe prueba explicita que verifique el criterio R6 del spec (uso de control flow moderno + uso exclusivo de design tokens en estilos); la verificacion actual es solo manual/indirecta. · Principio: Trazabilidad de requisitos

**Lo que está bien:**
- Ruta admin/agente preservada como hija lazy de admin y enlazada en el sidebar del AdminLayout.
- Wiring completo del shell con los cuatro componentes requeridos via inputs/outputs.
- Estado local orquestado con signals en shell, semantic cache y retrieval effort.
- No se detectaron servicios, HttpClient, NgRx ni persistencia en el slice admin/agente.

handoff Rechazado

---
## Review Report
**Fecha:** 2026-06-05
**Veredicto:** ✓ APROBADO

**Tests:** 55 pasando · 0 fallando
**Trazabilidad:** R1 → "should render filters, groups and all conversation statuses" ✓ · R2 → "should render metrics, cards and prioritized ranking with mock data" ✓ · R3 → "should update local toggles and thresholds while emitting settings changes" ✓ · R4 → "should apply presets and slider changes while emitting selected profile" ✓ · R5 → "should keep integrated local state aligned for filters, cache and retrieval changes" ✓ · R6 → "should use Angular modern control flow instructions in dynamic agent templates" + "should keep admin agent styles tied to global design tokens for palette and typography" ✓ · R7 → "should render the four agent management regions" + pruebas de cambios críticos en filtros/toggles/presets ✓

**Observaciones bloqueantes:**
- Ninguna.

**Lo que está bien:**
- Se resolvió el bloqueo OB-1 con prueba explícita de R6 en agent-r6-traceability.spec.ts.
- La suite completa se ejecutó en headless con resultados en verde.
- El slice mantiene alcance UI-only sin servicios, HttpClient, NgRx ni persistencia local.

handoff ✓ Aprobado
