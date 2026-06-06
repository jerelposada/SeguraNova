# Spec — admin-governance-monitoring-ui

## Requirements
Se implementará la capa visual de administración, gobierno y monitoreo del panel admin en Angular 20 usando componentes standalone, lazy loading y datos hardcodeados. El alcance cubre Dashboard, Usuarios/Roles, Knowledge Bases, Métricas de Uso y Audit Log, manteniendo coherencia con tokens de diseño y estilos globales existentes. No se incluirá lógica de negocio ni integración con backend.

### Criterios de aceptación
- WHEN el usuario admin navegue a /admin THE SYSTEM SHALL renderizar un dashboard de gobierno con tarjetas de métricas, estado operativo y atajos visuales sin llamadas HTTP.
- R1: Debe existir DashboardComponent con métricas hardcodeadas, indicadores visuales de estado y layout responsive.
- R2: Debe existir UsuariosRolesComponent con tabla administrativa, chips de rol, filtros locales y modal visual de detalle/edición simulada.
- R3: Debe existir KnowledgeBasesComponent con listado de bases, estados de indexación simulados y chips/etiquetas de cobertura.
- R4: Debe existir MetricasUsoComponent con gráficos simples basados en CSS (barras/líneas simuladas) y KPIs hardcodeados.
- R5: Debe existir AuditLogComponent con tabla de eventos, filtros visuales y resaltado por severidad.
- R6: Las vistas deben usar control flow moderno (@if, @for) y signals para estado local de filtros/modales cuando aplique.
- R7: La navegación debe mantener lazy loading para los componentes de administración/gobernanza en la configuración de rutas.
- R8: Deben existir pruebas unitarias mínimas para renderizado base, interacción de filtro local y apertura/cierre de modal en al menos dos componentes clave.

### Non-goals
- Conexión a API, HttpClient, servicios, guards adicionales o persistencia.
- Implementación de lógica real de permisos, auditoría o analítica.
- Exportación de reportes, paginación server-side o búsqueda full-text real.

---

## Design
### Flujo
[Admin TI]
   |
   v
/app.routes -> loadComponent lazy
   |
   v
DashboardComponent
   |
   +--> UsuariosRolesComponent (tabla + chips + modal)
   |
   +--> KnowledgeBasesComponent (estado + cobertura)
   |
   +--> MetricasUsoComponent (KPIs + chart CSS)
   |
   +--> AuditLogComponent (eventos + filtros)

Estado local UI (signals)
   |
   +--> filtroSeleccionado
   +--> modalAbierto
   +--> pestaña/segmento activo

Todo el contenido se alimenta de arreglos hardcodeados dentro de cada componente.

### Archivos afectados
| Archivo | Acción |
|---------|--------|
| SeguraNova.Spa/src/app/app.routes.ts | Modificar |
| SeguraNova.Spa/src/app/Pages/dashboard/dashboard.component.ts | Modificar |
| SeguraNova.Spa/src/app/Pages/dashboard/dashboard.component.html | Modificar |
| SeguraNova.Spa/src/app/Pages/dashboard/dashboard.component.css | Modificar |
| SeguraNova.Spa/src/app/Pages/admin/usuarios-roles/usuarios-roles.component.ts | Crear |
| SeguraNova.Spa/src/app/Pages/admin/usuarios-roles/usuarios-roles.component.html | Crear |
| SeguraNova.Spa/src/app/Pages/admin/usuarios-roles/usuarios-roles.component.css | Crear |
| SeguraNova.Spa/src/app/Pages/admin/knowledge-bases/knowledge-bases.component.ts | Crear |
| SeguraNova.Spa/src/app/Pages/admin/knowledge-bases/knowledge-bases.component.html | Crear |
| SeguraNova.Spa/src/app/Pages/admin/knowledge-bases/knowledge-bases.component.css | Crear |
| SeguraNova.Spa/src/app/Pages/admin/metricas-uso/metricas-uso.component.ts | Crear |
| SeguraNova.Spa/src/app/Pages/admin/metricas-uso/metricas-uso.component.html | Crear |
| SeguraNova.Spa/src/app/Pages/admin/metricas-uso/metricas-uso.component.css | Crear |
| SeguraNova.Spa/src/app/Pages/admin/audit-log/audit-log.component.ts | Crear |
| SeguraNova.Spa/src/app/Pages/admin/audit-log/audit-log.component.html | Crear |
| SeguraNova.Spa/src/app/Pages/admin/audit-log/audit-log.component.css | Crear |
| SeguraNova.Spa/src/app/Pages/admin/usuarios-roles/usuarios-roles.component.spec.ts | Crear |
| SeguraNova.Spa/src/app/Pages/admin/metricas-uso/metricas-uso.component.spec.ts | Crear |
| SeguraNova.Spa/src/app/Pages/dashboard/dashboard.component.spec.ts | Crear/Modificar |

### Contratos de interfaces
- DashboardComponent: standalone component que compone sub-vistas administrativas.
- UsuariosRolesComponent:
  - usuarios = signal<UsuarioAdminVM[]>
  - rolFiltro = signal<string>('todos')
  - modalUsuarioId = signal<string | null>(null)
  - filteredUsuarios(): UsuarioAdminVM[]
  - openUsuarioModal(userId: string): void
  - closeUsuarioModal(): void
- KnowledgeBasesComponent:
  - knowledgeBases = signal<KnowledgeBaseVM[]>
  - estadoFiltro = signal<'todos' | 'activo' | 'warning' | 'error'>('todos')
  - filteredKnowledgeBases(): KnowledgeBaseVM[]
- MetricasUsoComponent:
  - kpis = signal<KpiVM[]>
  - serieConsultas = signal<number[]>
  - periodoActivo = signal<'7d' | '30d'>('7d')
  - changePeriodo(periodo: '7d' | '30d'): void
- AuditLogComponent:
  - eventos = signal<AuditEventVM[]>
  - severidadFiltro = signal<'todas' | 'info' | 'warning' | 'critical'>('todas')
  - filteredEventos(): AuditEventVM[]

### Decisiones técnicas
- Se mantiene componente dashboard como punto de entrada de /admin para minimizar cambios de navegación y reducir riesgo de regresión.
- Se crean subcomponentes feature-first bajo Pages/admin/* para separar responsabilidades por dominio visual (usuarios, KB, métricas, auditoría).
- Se usa signals para estado local de UI (filtros, modal, tabs) por compatibilidad con Angular 20 y menor complejidad que RxJS en un escenario sin datos remotos.
- Se usa control flow @if/@for para plantillas declarativas modernas y mejor legibilidad.
- Se descarta crear servicios mock compartidos: la feature exige datos hardcodeados y cero lógica de negocio.
- Se descarta librería de gráficos externa: los gráficos deben resolverse con CSS puro para mantener el alcance solicitado.

---

## Tasks
### Reglas para el coder
- TDD estricto: RED → GREEN → REFACTOR
- Funciones ≤ 20 líneas, 1 responsabilidad, ≤ 3 parámetros
- Nombres que revelan intención
- Sin auto-aprobación

### Lista
Progreso: 11/11

- [x] T1: test — validar que DashboardComponent renderiza cards de métricas y secciones de gobierno esperadas.
- [x] T2: implementar — componer DashboardComponent con estructura, datos hardcodeados e integración de subcomponentes.
- [x] T3: test — validar filtro por rol y apertura/cierre de modal en UsuariosRolesComponent.
- [x] T4: implementar — crear UsuariosRolesComponent con tabla, chips, signal de filtro y modal visual.
- [x] T5: test — validar filtro de estado y render de badges en KnowledgeBasesComponent.
- [x] T6: implementar — crear KnowledgeBasesComponent con datos hardcodeados y control flow moderno.
- [x] T7: test — validar cambio de período y actualización visual del dataset en MetricasUsoComponent.
- [x] T8: implementar — crear MetricasUsoComponent con KPIs y gráficos CSS simples.
- [x] T9: test — validar filtro por severidad y orden visual básico en AuditLogComponent.
- [x] T10: implementar — crear AuditLogComponent con tabla, chips de severidad y filtros locales.
- [x] T11: refactor — ajustar rutas lazy, estilos compartidos y cleanup final sin alterar comportamiento.
