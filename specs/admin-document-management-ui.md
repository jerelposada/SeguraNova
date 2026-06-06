# Spec — admin-document-management-ui

## Requirements
Construir la experiencia visual de gestion documental dentro del Admin Panel existente en Angular 20, sobre la ruta `admin/documentos` ya registrada. El alcance es exclusivamente de frontend estatico: los flujos de upload, listado, versionado y chunk preview deben representarse con datos hardcodeados, sin servicios, sin HttpClient y sin persistencia.

### Criterios de aceptación
- WHEN el usuario navega a `admin/documentos` THE SYSTEM SHALL renderizar el shell documental dentro del `AdminLayoutComponent` existente, sin romper la jerarquia de rutas `admin` ya configurada.
- R1: WHEN el shell documental se carga THE SYSTEM SHALL mostrar un `UploadDocumentoComponent` con zona drag and drop simulada, CTA principal, ayudas visuales y una cola hardcodeada de archivos con estados visibles como `Subido`, `Procesando`, `Generando embeddings` y `Listo`.
- R2: WHEN el admin revisa el catalogo documental THE SYSTEM SHALL mostrar un `ListaDocumentosComponent` con filtros visuales hardcodeados, tabla o cards responsivas, badges/chips de estado, metadatos basicos y acciones simuladas para ver versiones y chunk preview.
- R3: WHEN el admin selecciona un documento THE SYSTEM SHALL mostrar un `VersionesDocumentoComponent` con timeline o lista vertical de versiones, version activa destacada, metadatos por version y CTA simulada para subir nueva version sin borrar historico.
- R4: WHEN el admin abre el detalle de fragmentacion THE SYSTEM SHALL mostrar un `ChunkPreviewComponent` en superficie secundaria o modal con chunks hardcodeados, snippet de texto, pagina, score o longitud estimada y señales visuales de calidad.
- R5: WHEN el usuario interactua con filtros, tabs, chips o acciones simuladas THE SYSTEM SHALL resolver el estado local con signals y eventos entre componentes standalone, sin introducir servicios compartidos ni estado global.
- R6: WHEN se implementen las vistas THE SYSTEM SHALL usar control flow moderno de Angular 20 (`@if`, `@for`), estructura feature-first y solo design tokens, paleta y tipografias globales ya definidas por la aplicacion.
- R7: WHEN se ejecute la suite unitaria del slice admin documental THE SYSTEM SHALL existir cobertura para el render del shell, la presencia de los cuatro componentes principales y al menos los cambios de estado locales criticos de seleccion, filtros y apertura/cierre de preview.

### Non-goals
- No implementar upload real, drag and drop nativo completo, validacion de archivos ni integracion con backend.
- No usar `HttpClient`, servicios Angular, stores globales ni persistencia en browser.
- No implementar eliminacion real, versionado real, polling, WebSockets ni modales conectados a infraestructura externa.
- No incluir las features 8 y 9 ni refactorizar otras secciones del panel admin fuera de lo necesario para integrar `admin/documentos`.

---

## Design
### Flujo
```text
Admin TI
   |
   v
/admin/documentos
   |
   v
AdminDocumentsShellComponent
   |
   +--> UploadDocumentoComponent
   |        - muestra dropzone simulada
   |        - muestra cola hardcodeada
   |
   +--> ListaDocumentosComponent
   |        - renderiza filtros y documentos
   |        - emite documento seleccionado
   |        - emite abrir chunk preview
   |
   +--> VersionesDocumentoComponent
   |        - recibe documento activo
   |        - muestra timeline/version activa
   |
   +--> ChunkPreviewComponent
            - recibe documento/version/chunks activos
            - abre/cierra preview local
```

### Archivos afectados
| Archivo | Acción |
|---------|--------|
| SeguraNova.Spa/src/app/app.routes.ts | Verificar sin romper la ruta hija `admin/documentos` ya existente |
| SeguraNova.Spa/src/app/features/admin/pages/admin-documents-shell.component.ts | Modificar o crear shell contenedor del slice documental |
| SeguraNova.Spa/src/app/features/admin/pages/admin-documents-shell.component.html | Modificar o crear layout de la pagina documental |
| SeguraNova.Spa/src/app/features/admin/pages/admin-documents-shell.component.css | Modificar o crear estilos del shell respetando tokens globales |
| SeguraNova.Spa/src/app/features/admin/documents/components/upload-documento.component.ts | Crear |
| SeguraNova.Spa/src/app/features/admin/documents/components/upload-documento.component.html | Crear |
| SeguraNova.Spa/src/app/features/admin/documents/components/upload-documento.component.css | Crear |
| SeguraNova.Spa/src/app/features/admin/documents/components/lista-documentos.component.ts | Crear |
| SeguraNova.Spa/src/app/features/admin/documents/components/lista-documentos.component.html | Crear |
| SeguraNova.Spa/src/app/features/admin/documents/components/lista-documentos.component.css | Crear |
| SeguraNova.Spa/src/app/features/admin/documents/components/versiones-documento.component.ts | Crear |
| SeguraNova.Spa/src/app/features/admin/documents/components/versiones-documento.component.html | Crear |
| SeguraNova.Spa/src/app/features/admin/documents/components/versiones-documento.component.css | Crear |
| SeguraNova.Spa/src/app/features/admin/documents/components/chunk-preview.component.ts | Crear |
| SeguraNova.Spa/src/app/features/admin/documents/components/chunk-preview.component.html | Crear |
| SeguraNova.Spa/src/app/features/admin/documents/components/chunk-preview.component.css | Crear |
| SeguraNova.Spa/src/app/features/admin/pages/admin-documents-shell.component.spec.ts | Crear o expandir |
| SeguraNova.Spa/src/app/features/admin/documents/components/*.spec.ts | Crear pruebas unitarias del slice documental |

### Contratos de interfaces
```ts
type DocumentPipelineStatus = 'Subido' | 'Procesando' | 'Generando embeddings' | 'Listo';

interface AdminDocumentItem {
  id: string;
  nombre: string;
  categoria: string;
  estado: DocumentPipelineStatus;
  knowledgeBase: string;
  versionActiva: string;
  actualizadoEl: string;
  chunks: number;
}

interface AdminDocumentVersion {
  id: string;
  version: string;
  estado: DocumentPipelineStatus;
  creadoEl: string;
  autor: string;
  paginas: number;
  activa: boolean;
}

interface AdminChunkPreviewItem {
  id: string;
  pagina: number;
  encabezado: string;
  contenido: string;
  longitud: number;
  score: 'alto' | 'medio' | 'bajo';
}

class UploadDocumentoComponent {}
class ListaDocumentosComponent {}
class VersionesDocumentoComponent {}
class ChunkPreviewComponent {}
class AdminDocumentsShellComponent {}
```

### Decisiones técnicas
- El estado local vive en `AdminDocumentsShellComponent` con signals para filtro activo, documento seleccionado, version seleccionada y visibilidad del chunk preview. Esto evita servicios innecesarios y mantiene el alcance UI-only.
- Los cuatro componentes del feature se separan como presentacionales o semipresentacionales para que el Coder pueda probar interacciones puntuales sin acoplar todo el layout.
- Los datos mock se modelan como constantes tipadas en el slice documental. Se descarta un servicio fake porque agregaria indirección sin valor para una feature puramente visual.
- El chunk preview debe poder renderizarse como panel o modal segun convenga al layout real; la decision final se deja al Coder siempre que conserve apertura/cierre local testeable.
- Se descarta reutilizar el `DashboardComponent` placeholder para evitar mezclar responsabilidades y para que la arquitectura grite `admin/documentos` como feature explicita.

---

## Tasks
### Reglas para el coder
- TDD estricto: RED -> GREEN -> REFACTOR
- Funciones <= 20 líneas, 1 responsabilidad, <= 3 parámetros
- Nombres que revelan intención
- Sin auto-aprobación

### Lista
Progreso: 12/12

- [x] T1: test — verificar que `admin-documents-shell` renderiza las cuatro regiones principales del slice documental dentro del layout admin.
- [x] T2: implementar — crear o ajustar `AdminDocumentsShellComponent` con wiring minimo, mocks locales y composicion de subcomponentes.
- [x] T3: test — verificar que `UploadDocumentoComponent` muestra dropzone simulada, CTA y cola hardcodeada con al menos cuatro estados visibles.
- [x] T4: implementar — construir `UploadDocumentoComponent` standalone con markup y estilos consistentes con design tokens existentes.
- [x] T5: test — verificar que `ListaDocumentosComponent` renderiza filtros, documentos hardcodeados y emite seleccion/apertura de preview ante acciones del usuario.
- [x] T6: implementar — construir `ListaDocumentosComponent` con control flow moderno, chips/badges y eventos tipados hacia el shell.
- [x] T7: test — verificar que seleccionar un documento actualiza `VersionesDocumentoComponent` y destaca la version activa en su timeline/lista.
- [x] T8: implementar — construir `VersionesDocumentoComponent` y conectar el estado de documento/version activos desde el shell.
- [x] T9: test — verificar apertura y cierre de `ChunkPreviewComponent` con chunks hardcodeados del documento/version seleccionados.
- [x] T10: implementar — construir `ChunkPreviewComponent` y su superficie secundaria o modal con indicadores visuales de calidad.
- [x] T11: test — verificar el comportamiento local critico de filtros, seleccion inicial y responsive-safe render del shell sin servicios ni HttpClient.
- [x] T12: refactor — consolidar fixtures, helpers de pruebas y estilos repetidos sin cambiar comportamiento.

---
## Review Report
**Fecha:** 2026-06-05
**Veredicto:** RECHAZADO

**Tests:** 78 pasando, 0 fallando
**Trazabilidad:**
- Ruta shell /admin/documentos -> should navigate to /admin/documentos and render the document shell inside the admin layout: OK
- R1 -> should render simulated dropzone, primary CTA and the hardcoded pipeline states: OK
- R2 -> should render visual filters, hardcoded documents and emit selection plus preview actions: OK
- R3 -> cobertura parcial en should update the versions panel and highlight the active version when a document is selected: NO
- R4 -> cobertura parcial en should open and close the chunk preview with the active document data: NO
- R5 -> should render visual filters, hardcoded documents and emit selection plus preview actions + should keep filter state, initial selection and shell rendering aligned without services: OK
- R6 -> verificado por inspeccion (signal, @if, @for, design tokens), sin prueba explicita dedicada: PARCIAL
- R7 -> ng test SeguraNova.Spa --watch=false --browsers=ChromeHeadless + specs del slice admin documental: OK

**Observaciones bloqueantes:**
- OB-1 - SeguraNova.Spa/src/app/features/admin/pages/admin-documents-shell.component.spec.ts:29 � La prueba de versiones solo verifica cambio de documento y version activa; no verifica explicitamente los metadatos por version ni el CTA de nueva version exigidos por R3 en specs/admin-document-management-ui.md:10. - Principio: CleanCode
- OB-2 - SeguraNova.Spa/src/app/features/admin/pages/admin-documents-shell.component.spec.ts:44 � La prueba de chunk preview solo verifica apertura/cierre y presencia de superficie; no verifica explicitamente pagina, score/longitud ni senales visuales de calidad exigidas por R4 en specs/admin-document-management-ui.md:11. - Principio: CleanCode

**Lo que esta bien:**
- El hallazgo previo quedo corregido: existe una prueba de integracion real para navegacion a /admin/documentos dentro del layout admin.
- Todas las tareas del spec estan marcadas [x].
- La suite completa ejecutable quedo en verde: Angular app, Angular core y backend .NET.
- La implementacion inspeccionada respeta estado local con signal y no introduce servicios ni HttpClient en el slice documental.



---
## Review Report
**Fecha:** 2026-06-05
**Veredicto:** APROBADO

**Tests:** 66 pasando / 0 fallando
**Trazabilidad:** Ruta shell /admin/documentos -> "should navigate to /admin/documentos and render the document shell inside the admin layout" OK � R1 -> "should render simulated dropzone, primary CTA and the hardcoded pipeline states" OK � R2 -> "should render visual filters, hardcoded documents and emit selection plus preview actions" OK � R3 -> "should update the versions panel and highlight the active version when a document is selected" OK � R4 -> "should open and close the chunk preview with the active document data" OK � R5 -> "should keep filter state, initial selection and shell rendering aligned without services" OK � R6 -> verificado por tests de design tokens/no services e inspeccion directa de templates con @if/@for OK � R7 -> slice admin documental cubierto en la suite Angular OK

**Observaciones bloqueantes:**
- Ninguna.

**Lo que esta bien:**
- Los dos bloqueos previos quedaron resueltos: la prueba del shell ahora valida metadatos y CTA de versionado, y la prueba de preview valida pagina, longitud y score.
- La jerarquia de rutas admin sigue intacta y /admin/documentos renderiza dentro de AdminLayoutComponent.
- El slice mantiene estado local con signals y no introduce HttpClient, servicios compartidos ni persistencia.
