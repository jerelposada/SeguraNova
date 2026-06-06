# Spec â€” admin-layout-navigation

## Requirements
Se requiere establecer la base visual y de navegacion del panel administrativo para el rol Admin TI en el frontend Angular, reemplazando el placeholder actual del area administrativa por un layout reutilizable. La feature debe ser exclusivamente de maquetacion, usando datos estaticos, sin llamadas HTTP ni servicios externos. Debe respetar el sistema de diseno global existente (tokens, tipografia, paleta y estilos) y aplicar convenciones modernas de Angular con componentes standalone y rutas lazy.

### Criterios de aceptacion
- WHEN un usuario navega a /admin THE SYSTEM SHALL renderizar AdminLayoutComponent con Topbar, Sidebar y un Router Outlet para contenido interno.
- WHEN el Sidebar se renderiza THE SYSTEM SHALL mostrar exactamente las secciones: Principal, Documentos, Agente, Usuarios y Permisos, y Monitoreo.
- WHEN el usuario hace click en una seccion del Sidebar THE SYSTEM SHALL navegar via routerLink a la ruta correspondiente del admin y reflejar estado activo con routerLinkActive.
- WHEN se cargan rutas del admin THE SYSTEM SHALL resolverlas con lazy loading para los componentes de seccion.
- WHEN se visualiza el layout THE SYSTEM SHALL usar exclusivamente design tokens globales y mantener consistencia visual con el resto de la aplicacion.
- R1: Existe un AdminLayoutComponent standalone que contiene topbar, sidebar y router-outlet.
- R2: La navegacion del sidebar contiene 5 items exactos y usa @for para renderizado.
- R3: Cada item tiene route path interno de admin y aplica clase/estado activo con routerLinkActive.
- R4: El enrutamiento define un arbol /admin con children lazy-loaded y ruta por defecto interna.
- R5: No se introducen HttpClient, servicios de datos, ni logica de negocio; solo datos hardcodeados locales de UI.
- R6: Los estilos del layout referencian variables CSS globales ya existentes (por ejemplo --clr-*, --sp-*, --fs-*).

### Non-goals
- Implementar logica de negocio, autorizacion adicional o persistencia.
- Integrar APIs, WebSockets, estado global o almacenamiento remoto.
- Construir vistas funcionales complejas de gestion documental/agente/monitoreo (eso pertenece a features 7, 8 y 9).
- Redisenar el design system global o crear una paleta nueva.

---

## Design
### Flujo
Navegacion administrativa

+--------------------------+
| Ruta /admin (authGuard) |
+------------+-------------+
             |
             v
+-------------------------------+
| Carga lazy AdminLayoutComponent|
+---------------+---------------+
                |
      +---------+---------+
      | Topbar + Sidebar  |
      +---------+---------+
                |
                v
      click routerLink (sidebar)
                |
                v
+-------------------------------+
| Child route /admin/<seccion>  |
| lazy load componente seccion   |
+---------------+---------------+
                |
                v
         render en router-outlet

### Archivos afectados
| Archivo | Accion |
|---------|--------|
| SeguraNova.Spa/src/app/app.routes.ts | Modificar |
| SeguraNova.Spa/src/app/features/admin/layout/admin-layout.component.ts | Crear |
| SeguraNova.Spa/src/app/features/admin/layout/admin-layout.component.html | Crear |
| SeguraNova.Spa/src/app/features/admin/layout/admin-layout.component.css | Crear |
| SeguraNova.Spa/src/app/features/admin/pages/admin-home.component.ts | Crear |
| SeguraNova.Spa/src/app/features/admin/pages/admin-home.component.html | Crear |
| SeguraNova.Spa/src/app/features/admin/pages/admin-home.component.css | Crear |
| SeguraNova.Spa/src/app/features/admin/pages/admin-documents-shell.component.ts | Crear |
| SeguraNova.Spa/src/app/features/admin/pages/admin-agent-shell.component.ts | Crear |
| SeguraNova.Spa/src/app/features/admin/pages/admin-users-permissions-shell.component.ts | Crear |
| SeguraNova.Spa/src/app/features/admin/pages/admin-monitoring-shell.component.ts | Crear |
| SeguraNova.Spa/src/app/app.routes.spec.ts | Modificar |
| SeguraNova.Spa/src/app/features/admin/layout/admin-layout.component.spec.ts | Crear |

### Contratos de interfaces
- export class AdminLayoutComponent
  - readonly navItems: Signal<ReadonlyArray<{ label: string; route: string; icon: string }>>;
- export const ADMIN_ROUTES: Routes;
- function loadAdminHomeComponent(): Promise<Type<unknown>>;
- function loadAdminDocumentsShellComponent(): Promise<Type<unknown>>;
- function loadAdminAgentShellComponent(): Promise<Type<unknown>>;
- function loadAdminUsersPermissionsShellComponent(): Promise<Type<unknown>>;
- function loadAdminMonitoringShellComponent(): Promise<Type<unknown>>;

### Decisiones tecnicas
- Se usa estructura feature-first bajo src/app/features/admin para hacer visible el dominio admin y preparar extensiones de features 7-9.
- Se usa componente layout standalone con children routes para separar shell de contenido y evitar duplicacion visual.
- Se usa @for para pintar items del sidebar desde arreglo estatico local y facilitar trazabilidad/orden.
- Se usa lazy loading por componente en children para reducir costo inicial y alinear la estrategia de carga.
- Se descarta introducir servicios porque el alcance exige UI estatica sin integraciones.
- Se descarta crear tokens locales para evitar divergencias con styles.css global.

---

## Tasks
### Reglas para el coder
- TDD estricto: RED -> GREEN -> REFACTOR
- Funciones <= 20 lineas, 1 responsabilidad, <= 3 parametros
- Nombres que revelan intencion
- Sin auto-aprobacion

### Lista
Progreso: 12/12

- [x] T1: test â€” validar que /admin carga AdminLayoutComponent y define children routes lazy.
- [x] T2: implementar â€” ajustar app.routes para arbol /admin con layout + children lazy.
- [x] T3: test â€” validar que AdminLayoutComponent renderiza Topbar, Sidebar y router-outlet.
- [x] T4: implementar â€” crear AdminLayoutComponent standalone con estructura base.
- [x] T5: test â€” validar que sidebar contiene 5 items exactos requeridos y rutas esperadas.
- [x] T6: implementar â€” definir navItems estaticos con @for y labels oficiales.
- [x] T7: test â€” validar routerLink y routerLinkActive en cada item del sidebar.
- [x] T8: implementar â€” enlazar navegacion y estado activo en template.
- [x] T9: test â€” validar que cada child route lazy carga un componente shell standalone.
- [x] T10: implementar â€” crear shells minimos para principal, documentos, agente, usuarios-permisos y monitoreo.
- [x] T11: test â€” validar que estilos del layout usan tokens globales sin hardcode semantico ajeno al design system.
- [x] T12: refactor â€” limpiar estructura, consolidar nombres y mantener cobertura sin cambiar comportamiento.

---
## Review Report
**Fecha:** 2026-06-05
**Veredicto:** ✗ RECHAZADO

**Tests:** 50 pasando · 0 fallando
**Trazabilidad:** R1 → "AdminLayoutComponent should render topbar, sidebar and router outlet" ✓ · R2 → "AdminLayoutComponent should render the exact five sidebar sections" (sin verificacion explicita de @for) ✗ · R3 → "AdminLayoutComponent should wire routerLink and routerLinkActive for each sidebar item" (sin validar rutas/estado activo real) ✗ · R4 → "app routes should configure admin route with lazy layout component and lazy-loaded children" + "should define lazy-loaded admin children for all expected sections" ✓ · R5 → sin test explicito ✗ · R6 → "AdminLayoutComponent should style layout with global design tokens" (solo presencia, no exclusividad) ✗

**Observaciones bloqueantes:**
- OB-1 · SeguraNova.Spa/src/app/features/admin/layout/admin-layout.component.css:14,27,72 · Se usan valores hardcoded (72px, 240px, 960px) cuando el spec exige uso exclusivo de design tokens globales en el layout. · Principio: Clean Code (consistencia de diseno / evitar magic numbers)
- OB-2 · SeguraNova.Spa/src/app/features/admin/layout/admin-layout.component.spec.ts:44-52 · La prueba de navegacion solo valida presencia de directivas; no verifica que cada item navegue a su ruta admin ni que el estado activo se aplique tras navegar. R3 queda parcialmente cubierto. · Principio: TDD / trazabilidad de requerimientos
- OB-3 · SeguraNova.Spa/src/app/features/admin/layout/admin-layout.component.spec.ts:54-60 · La prueba de tokens valida contains, pero no falla si hay estilos no-token; por ello no garantiza R6 de uso exclusivo. · Principio: TDD / especificacion ejecutable
- OB-4 · SeguraNova.Spa/src/app/app.routes.spec.ts:1-38 y SeguraNova.Spa/src/app/features/admin/layout/admin-layout.component.spec.ts:1-61 · No existe prueba explicita para R5 (ausencia de HttpClient/servicios/logica de negocio), dejando el requisito sin trazabilidad automatizada. · Principio: trazabilidad completa de requisitos

**Lo que esta bien:**
- Arbol /admin con AdminLayoutComponent y children lazy-loaded implementado correctamente.
- Sidebar renderiza las 5 secciones esperadas y usa sintaxis moderna @for en plantilla.
- No se detectaron integraciones HTTP/servicios en el feature admin durante la inspeccion del codigo.
---
## Review Report
**Fecha:** 2026-06-05
**Veredicto:** ✓ APROBADO

**Tests:** 71 pasando · 0 fallando
**Trazabilidad:** R1 → "should render topbar, sidebar and router outlet" ✓ · R2 → "should render the exact five sidebar sections" ✓ · R3 → "should wire routerLink and routerLinkActive for each sidebar item" (incluye navegacion real a /admin/agente y estado activo) ✓ · R4 → "should configure admin route with lazy layout component and lazy-loaded children" + "should define lazy-loaded admin children for all expected sections" ✓ · R5 → "should keep admin feature as static UI without service or HttpClient injections" ✓ · R6 → "should style layout with global design tokens" (con exclusividad: sin px/hex/rgb) ✓

**Lo que está bien:**
- Se eliminaron hardcodes CSS previos (72px, 240px, 960px) y se sustituyeron por tokens/cálculos basados en tokens.
- La prueba de navegación ahora valida estado activo real tras `router.navigateByUrl('/admin/agente')`.
- La prueba de estilos ahora valida exclusividad de tokens con aserciones negativas para `px`, colores hex y `rgb/rgba`.
- Existe prueba explícita de R5 que falla si aparece inyección de `HttpClient`/`inject()` o lógica de negocio en componentes UI admin.
- Arbol de rutas `/admin` mantiene lazy loading para layout y secciones.
