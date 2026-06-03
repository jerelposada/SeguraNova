# SeguraNova — Enterprise AI Agent
## Documentación del Proyecto

> Agente empresarial de conocimiento interno construido con .NET 8 + AWS.  
> El agente decide en tiempo real si busca en documentos internos (RAG) o en datos reales de la empresa (MCP Tools).

---

## 1. Contexto y motivación

### El problema real

Las empresas tienen documentación interna densa: pólizas, reglamentos, manuales de proceso, procedimientos de reclamación. Los empleados pierden horas buscando información en PDFs o preguntándole a compañeros.

Los LLMs genéricos (ChatGPT, etc.) no resuelven esto porque no fueron entrenados con los documentos internos de cada empresa. Ayudan a redactar emails o hacer cálculos en Excel, pero no conocen las políticas internas ni los datos reales de los clientes.

**SeguraNova resuelve exactamente eso**: un agente que conoce los documentos internos de la aseguradora y puede además consultar datos reales (pólizas, siniestros, clientes) en tiempo real.

### Objetivos del proyecto

1. **Portafolio técnico** — demostrar criterio arquitectónico a nivel de arquitecto .NET senior
2. **Contenido LinkedIn** — serie de artículos técnicos documentando el proceso de construcción
3. **Cliente potencial real** — el caso de uso es extrapolable a cualquier empresa mediana

### Empresa ficticia

**SeguraNova** — aseguradora ficticia latinoamericana. Dominio elegido por:
- Documentación interna densa y variada (pólizas, coberturas, exclusiones, procedimientos)
- Dominio reconocible para recruiters de banca y fintech
- Rico en reglas de negocio (ideal para DDD)

---

## 2. Stack tecnológico

| Componente | Tecnología | Justificación |
|---|---|---|
| Backend / Agent API | .NET 8 + ASP.NET Core | Stack principal del developer |
| Orquestador del agente | Microsoft Semantic Kernel | Nativo en .NET, soporte oficial |
| LLM | Amazon Bedrock (Claude) | Stack 100% AWS, mismo proveedor |
| BD relacional + vectorial | Aurora PostgreSQL + pgvector | Una sola BD para ambos casos de uso |
| Almacenamiento de documentos | Amazon S3 | Estándar AWS para objetos |
| Autenticación y roles | Amazon Cognito | Nativo AWS, JWT estándar |
| Worker de ingestion | .NET Worker Service | Proceso background para embeddings |
| Frontend | Angular 18 + TypeScript | Stack del developer |
| Deploy | AWS ECS + Fargate | Contenedores serverless en AWS |
| IaC | AWS CDK o Terraform | Infraestructura como código |

---

## 3. Arquitectura — C4 Model

### Nivel 1 — Contexto del sistema

**Usuarios:**
- **Empleado** — consulta políticas, coberturas y procedimientos en lenguaje natural
- **Agente de Siniestros** — consulta procedimientos de reclamación y tiempos de respuesta
- **Admin TI** — gestiona documentos, roles, permisos y monitorea el sistema

**Sistema principal:**
- **Enterprise AI Agent** — responde preguntas en lenguaje natural sobre documentos internos y datos reales

**Sistemas externos (AWS):**
- Amazon Bedrock (Claude) — LLM para razonamiento y generación
- Aurora PostgreSQL + pgvector — BD relacional y vectorial
- Amazon S3 — almacenamiento de PDFs
- Amazon Cognito — autenticación y roles

---

### Nivel 2 — Contenedores

| Contenedor | Tecnología | Responsabilidad |
|---|---|---|
| Auth / Login | Angular 18 + Cognito | JWT, roles, guards de ruta |
| Admin Panel | Angular 18 | Gestión documental, métricas, audit log |
| Chat UI | Angular 18 | Interfaz de chat con fuentes citadas |
| Agent API | ASP.NET Core + Semantic Kernel | Orquestación del agente — core del sistema |
| Document Ingestion | .NET Worker Service | Procesa PDFs, genera embeddings |
| MCP Tools | .NET — herramientas custom | Consultas a BD relacional |
| Aurora PostgreSQL + pgvector | AWS | Datos + embeddings + historial + audit log |

---

### Flujo de decisión del agente

```
Empleado → pregunta en lenguaje natural → Agent API
Agent API → Semantic Kernel evalúa la pregunta
    ├── Si pregunta sobre políticas/documentos → RAG (búsqueda semántica en pgvector)
    ├── Si pregunta sobre datos reales → MCP Tool (consulta Aurora PostgreSQL)
    └── Si necesita ambos → combina RAG + MCP Tool
Respuesta → incluye fuente citada (documento + página) → se guarda en historial
```

---

## 4. Panel Administrativo — Funcionalidades

### v1 — Alcance inicial

| Funcionalidad | Descripción |
|---|---|
| 🔐 Login + Roles | Cognito. Roles: Admin TI, Empleado, Agente Siniestros. Guards Angular |
| 📤 Upload PDF → S3 | Drag & drop. Upload con presigned URL. Trigger automático al Worker |
| 📊 Estado del documento | Pipeline: Subido → Procesando → Generando embeddings → Listo |
| 🗂️ Versioning | Nueva versión sin borrar anterior. El agente usa la versión activa |
| 🔍 Chunk Preview | Ver cómo quedó fragmentado el PDF. Detectar problemas de calidad RAG |
| 💬 Historial conversaciones | Qué preguntan los empleados, cuáles sin buena respuesta |
| 📚 Fuentes citadas | Cada respuesta muestra documento fuente y página |
| 📋 Audit Log | Quién subió qué, cuándo y qué cambios hubo |
| 📈 Métricas de uso | Consultas/día, docs más consultados, gaps de conocimiento |
| 🗑️ Eliminar documentos | Soft delete. Limpia S3 y embeddings en pgvector |

---

## 5. Decisiones arquitectónicas (ADRs)

### ADR-001 — Aurora PostgreSQL + pgvector

**Contexto:** El sistema necesita datos relacionales y vectoriales.

**Decisión:** Una sola Aurora PostgreSQL con pgvector en lugar de RDS + OpenSearch o Pinecone.

**Consecuencias:** Menor complejidad operacional, un solo punto de conexión. Trade-off: menor performance vectorial a escala masiva — aceptable para este dominio.

**Estado:** Accepted ✓

---

### ADR-002 — Semantic Kernel como orquestador

**Contexto:** Se necesita orquestación de agentes compatible con .NET.

**Decisión:** Microsoft Semantic Kernel sobre LangChain (Python) o solución custom.

**Consecuencias:** Integración nativa .NET, soporte oficial Microsoft, compatible con Bedrock. Comunidad más pequeña que LangChain pero en crecimiento.

**Estado:** Accepted ✓

---

### ADR-003 — Amazon Bedrock (Claude) como LLM

**Contexto:** Stack 100% AWS. Se necesita LLM con capacidad de razonamiento para decidir entre RAG y MCP Tools.

**Decisión:** Amazon Bedrock con Claude en lugar de Azure OpenAI.

**Consecuencias:** Sin salida de datos a Azure, facturación unificada AWS, latencia óptima en misma región.

**Estado:** Accepted ✓

---

### ADR-004 — Clean Architecture

**Contexto:** Múltiples fuentes de datos, sistema debe ser mantenible y testeable.

**Decisión:** Clean Architecture — Domain, Application, Infrastructure, API. El dominio sin dependencias externas.

**Consecuencias:** Alta testabilidad del dominio. El agente y MCP Tools en Application. Infrastructure maneja Bedrock, pgvector y S3.

**Estado:** Accepted ✓

---

### ADR-005 — Amazon Cognito para auth y roles

**Contexto:** Autenticación con múltiples roles en stack 100% AWS.

**Decisión:** Amazon Cognito sobre solución custom o Auth0.

**Consecuencias:** Integración nativa AWS IAM, JWT estándar, sin servidor de auth propio. Trade-off: curva de configuración inicial.

**Estado:** Accepted ✓

---

## 6. Estructura de carpetas — Clean Architecture

```
SeguraNova/
├── src/
│   ├── SeguraNova.Domain/
│   │   ├── Entities/
│   │   │   ├── Document.cs
│   │   │   ├── Conversation.cs
│   │   │   ├── Policy.cs
│   │   │   └── Claim.cs
│   │   ├── ValueObjects/
│   │   ├── Interfaces/
│   │   └── Events/
│   │
│   ├── SeguraNova.Application/
│   │   ├── Agent/
│   │   │   ├── AgentOrchestrator.cs
│   │   │   └── Tools/
│   │   │       ├── SearchDocumentsTool.cs
│   │   │       └── QueryPolicyTool.cs
│   │   ├── Documents/
│   │   │   ├── Commands/
│   │   │   └── Queries/
│   │   └── Conversations/
│   │
│   ├── SeguraNova.Infrastructure/
│   │   ├── Persistence/
│   │   │   ├── ApplicationDbContext.cs
│   │   │   └── Repositories/
│   │   ├── AI/
│   │   │   ├── BedrockService.cs
│   │   │   └── EmbeddingService.cs
│   │   ├── Storage/
│   │   │   └── S3DocumentStorage.cs
│   │   └── Auth/
│   │       └── CognitoAuthService.cs
│   │
│   ├── SeguraNova.API/
│   │   ├── Controllers/
│   │   ├── Hubs/
│   │   └── Program.cs
│   │
│   └── SeguraNova.Worker/
│       └── DocumentIngestionWorker.cs
│
├── frontend/
│   └── seguranowa-admin/        # Angular 18
│       ├── src/app/
│       │   ├── auth/
│       │   ├── admin/
│       │   │   ├── documents/
│       │   │   ├── conversations/
│       │   │   ├── metrics/
│       │   │   └── audit-log/
│       │   └── chat/
│
├── infra/                       # CDK o Terraform
└── docs/
    ├── adrs/
    └── c4/
```

---

## 7. Roadmap de construcción

### Fase 1 — Fundamentos (semanas 1-2)
- [ ] Setup del proyecto .NET con Clean Architecture
- [ ] Setup Angular con estructura de módulos
- [ ] Cognito configurado con roles
- [ ] Login funcional en Angular

### Fase 2 — Panel Admin (semanas 3-5)
- [ ] Upload de documentos a S3
- [ ] Worker de ingestion básico
- [ ] Estado del documento en tiempo real
- [ ] Listado y eliminación de documentos

### Fase 3 — RAG core (semanas 6-8)
- [ ] pgvector configurado en Aurora
- [ ] Búsqueda semántica funcional
- [ ] Chunk preview en admin
- [ ] Versioning de documentos

### Fase 4 — Agente (semanas 9-14)
- [ ] Semantic Kernel integrado
- [ ] MCP Tools custom (pólizas, siniestros)
- [ ] Lógica de decisión RAG vs MCP
- [ ] Chat UI con fuentes citadas
- [ ] Historial de conversaciones

### Fase 5 — Enterprise features (semanas 15-20)
- [ ] Audit log completo
- [ ] Métricas de uso
- [ ] Deploy en ECS + Fargate
- [ ] Documentación C4 final
- [ ] Posts LinkedIn del proceso

---

## 8. Estrategia de contenido LinkedIn

El proyecto genera contenido en paralelo a la construcción. Un post por semana.

| Semana | Post |
|---|---|
| 1 | "Por qué construí un agente empresarial en .NET y no en Python" |
| 2 | "Así diseñé la arquitectura antes de escribir una línea de código" |
| 3 | "Clean Architecture en .NET — así separo el dominio del agente" |
| 4 | "Cómo subir PDFs a S3 y procesarlos con un Worker en .NET" |
| 5 | "pgvector vs OpenSearch — por qué elegí una sola BD para RAG" |
| 6 | "Semantic Kernel en .NET — cómo el agente decide entre documentos y datos reales" |
| 7 | "Chunk preview — cómo validar la calidad del RAG antes de indexar" |
| 8 | "Amazon Bedrock + .NET — integración paso a paso" |

---

## 9. Diferenciadores vs proyectos similares

| Aspecto | Demo típico en Python | SeguraNova |
|---|---|---|
| Stack | Python + LangChain | .NET 8 + Semantic Kernel |
| Datos | Mock sin estructura | Mock realista con dominio de seguros |
| Decisión agente | RAG únicamente | RAG + MCP Tools según contexto |
| Admin | No existe | Panel completo con audit log |
| Auth | No existe | Cognito + roles + guards |
| Fuentes | Sin citar | Documento + página citados |
| Deploy | Local / Vercel | AWS ECS + Fargate |
| Documentación | README básico | C4 + ADRs + roadmap |

---

### ADR-006 — Mensajería asíncrona para notificaciones de documentos

**Contexto:** Cuando un Admin sube un PDF o una nueva versión, otros usuarios deben ser notificados sin bloquear el flujo principal de upload.

**Opciones evaluadas:**
- Amazon SNS + SES — nativo AWS, pub/sub, múltiples suscriptores
- Amazon SQS + SES — nativo AWS, simple, bajo costo
- RabbitMQ (Amazon MQ) — más control, no nativo AWS
- Apache Kafka (MSK) — overkill para este volumen

**Decisión pendiente:** Amazon SNS + SES. SNS publica el evento "DocumentoIndexado" y SES envía el email. Sin infraestructura adicional fuera del ecosistema AWS.

**Casos de uso:**
- Admin sube documento nuevo → email a equipo de gestión documental
- Admin sube nueva versión → email a usuarios que consultaron ese documento
- Documento eliminado → notificación a Admin TI

**Consecuencias:** Desacoplamiento total entre el Worker de ingestion y el sistema de notificaciones. Fácil de extender a Slack o SMS vía SNS.

**Estado:** Proposed — implementar en Fase 5 ⏳

---

*Documento generado: Junio 2026*  
*Versión: 1.1*

---

### ADR-007 — Semantic Caching con ElastiCache

**Contexto:** Usuarios distintos hacen preguntas semánticamente equivalentes — "¿cuántos días para reportar un siniestro?" vs "¿cuál es el plazo para notificar un accidente?". Sin caché, cada pregunta genera una llamada completa a Bedrock con su costo en tokens y latencia.

**Decisión:** Agregar semantic cache con Amazon ElastiCache (Redis/Valkey) antes del flujo del agente. Se compara el embedding de la pregunta entrante contra preguntas cacheadas por similitud coseno. Si supera un umbral configurable (~0.92), se devuelve la respuesta cacheada sin llamar al LLM.

**Flujo:**
```
Pregunta → embedding → Redis busca similitud
    ├── Hit (coseno > umbral) → respuesta cacheada sin llamar a Bedrock
    └── Miss → flujo normal → guarda en Redis para próxima vez
```

**Consideraciones pendientes:**
- Umbral óptimo: empezar en 0.92, ajustar con datos reales
- Invalidación de caché cuando se actualiza un documento fuente
- Evitar falsos positivos — preguntas similares con respuestas distintas

**Consecuencias:** Reducción de llamadas a Bedrock, menor latencia en preguntas frecuentes, menor costo operacional en producción.

**Estado:** Proposed — implementar en Fase 4 ⏳

---

### ADR-008 — Retrieve-and-Rerank para mejorar calidad del RAG

**Contexto:** El top-k por similitud coseno en pgvector a veces retorna chunks relevantes pero no los más precisos. Un reranker evalúa los chunks recuperados y los reordena por relevancia real antes de pasarlos al LLM.

**Decisión:** Agregar Amazon Bedrock Rerank después de la búsqueda vectorial en pgvector. El flujo pasa de top-k similitud a top-k relevancia.

**Flujo:**
```
Query → pgvector top-k (similitud) → Bedrock Rerank → top-k rerankeado → LLM
```

**Consecuencias:** Respuestas más precisas, menos alucinaciones por contexto irrelevante. Costo adicional por llamada al reranker — mitigado por semantic cache en preguntas frecuentes.

**Estado:** Proposed — implementar en Fase 4 ⏳
